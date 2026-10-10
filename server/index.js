import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import Project from "./models/Project.js";
import User from "./models/User.js";
import Proposal from "./models/Proposal.js";
import Conversation from "./models/Conversation.js";
import { authenticate, createToken, requireRole } from "./middleware/auth.js";
import { starterProjects } from "./data/projects.js";

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const requireDatabase = (_request, response, next) => {
  if (mongoose.connection.readyState !== 1)
    return response
      .status(503)
      .json({ message: "The marketplace database is not connected yet." });
  next();
};
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  skills: user.skills,
  location: user.location,
  company: user.company,
  avatar: user.avatar,
  savedProjects: user.savedProjects,
});

app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "offline",
  });
});

app.get("/api/projects", async (request, response) => {
  try {
    const { category, search, minBudget, maxBudget } = request.query;
    if (mongoose.connection.readyState !== 1)
      return response.json(
        starterProjects.map((project) => ({ ...project, isSample: true })),
      );
    const query = {};
    if (category && category !== "All projects") query.category = category;
    query.status = request.query.status || "open";
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = ["title", "description", "company", "skills"].map(
        (field) => ({ [field]: { $regex: escaped, $options: "i" } }),
      );
    }
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    const projects = await Project.find(query)
      .populate("owner", "name avatar company")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    response.json(projects);
  } catch (error) {
    response
      .status(500)
      .json({ message: "Could not load projects", error: error.message });
  }
});

app.post(
  "/api/projects",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    try {
      const user = request.user;
      const {
        title,
        description,
        category,
        skills,
        budget,
        budgetType,
        duration,
        location,
      } = request.body;
      const project = await Project.create({
        title,
        description,
        category,
        skills: Array.isArray(skills) ? skills : [],
        budget,
        budgetType: budgetType || "Fixed price",
        duration,
        location,
        client: user.name,
        company: user.company || user.name,
        owner: user._id,
      });
      response.status(201).json(project);
    } catch (error) {
      response
        .status(400)
        .json({
          message: "Project details are incomplete or invalid.",
          error: error.message,
        });
    }
  },
);

app.post("/api/auth/register", requireDatabase, async (request, response) => {
  try {
    const { name, email, password, role } = request.body;
    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 8 ||
      !["freelancer", "client"].includes(role)
    ) {
      return response
        .status(400)
        .json({
          message:
            "Enter a name, valid email, password of at least 8 characters, and account type.",
        });
    }
    const user = await User.create({ name, email, password, role });
    response
      .status(201)
      .json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000)
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });
    response
      .status(400)
      .json({ message: "Could not create the account.", error: error.message });
  }
});

app.post("/api/auth/login", requireDatabase, async (request, response) => {
  const user = await User.findOne({
    email: request.body.email?.toLowerCase(),
  }).select("+password");
  if (!user || !(await user.comparePassword(request.body.password || ""))) {
    return response
      .status(401)
      .json({ message: "Email or password is incorrect." });
  }
  response.json({ token: createToken(user), user: publicUser(user) });
});

app.get(
  "/api/auth/me",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const user = await User.findById(request.user._id);
    response.json({ user: publicUser(user) });
  },
);

app.put(
  "/api/auth/me",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const updates = {};
    for (const key of [
      "name",
      "bio",
      "skills",
      "location",
      "company",
      "avatar",
    ]) {
      if (request.body[key] !== undefined) updates[key] = request.body[key];
    }
    const user = await User.findByIdAndUpdate(request.user._id, updates, {
      new: true,
      runValidators: true,
    });
    response.json({ user: publicUser(user) });
  },
);

app.patch(
  "/api/auth/me/saved",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const { projectId, saved } = request.body;
    if (!projectId)
      return response
        .status(400)
        .json({ message: "Choose a project to save." });
    const update = saved
      ? { $addToSet: { savedProjects: String(projectId) } }
      : { $pull: { savedProjects: String(projectId) } };
    const user = await User.findByIdAndUpdate(request.user._id, update, {
      new: true,
    });
    response.json({ savedProjects: user.savedProjects });
  },
);

app.get("/api/users", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.json([]);
    const query = { role: request.query.role || "freelancer" };
    if (request.query.search) {
      const escaped = request.query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.$or = ["name", "bio", "skills", "location"].map((field) => ({
        [field]: { $regex: escaped, $options: "i" },
      }));
    }
    const users = await User.find(query)
      .select("name role bio skills location company avatar createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    response.json(users);
  } catch (error) {
    response
      .status(500)
      .json({ message: "Could not load talent.", error: error.message });
  }
});

app.get(
  "/api/projects/mine",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    const projects = await Project.find({ owner: request.user._id })
      .sort({ createdAt: -1 })
      .lean();
    response.json(projects);
  },
);

app.patch(
  "/api/projects/:id/status",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    if (!["open", "paused", "filled", "closed"].includes(request.body.status))
      return response
        .status(400)
        .json({ message: "Choose a valid project status." });
    const project = await Project.findOneAndUpdate(
      { _id: request.params.id, owner: request.user._id },
      { status: request.body.status },
      { new: true },
    );
    if (!project)
      return response.status(404).json({ message: "Project not found." });
    response.json(project);
  },
);

app.post(
  "/api/projects/:id/proposals",
  requireDatabase,
  authenticate,
  requireRole("freelancer"),
  async (request, response) => {
    const project = await Project.findById(request.params.id);
    if (
      !project ||
      project.isSample ||
      project.status !== "open" ||
      !project.owner
    )
      return response
        .status(400)
        .json({
          message: "This sample or closed project is not accepting proposals.",
        });
    if (String(project.owner) === String(request.user._id))
      return response
        .status(403)
        .json({ message: "You cannot apply to your own project." });
    const { coverLetter, bid, duration } = request.body;
    if (
      !coverLetter?.trim() ||
      coverLetter.trim().length < 30 ||
      !duration?.trim() ||
      Number(bid) < 1
    ) {
      return response
        .status(400)
        .json({
          message:
            "Write at least 30 characters and include a valid bid and timeline.",
        });
    }
    try {
      const proposal = await Proposal.create({
        project: project._id,
        freelancer: request.user._id,
        client: project.owner,
        coverLetter,
        bid,
        duration,
      });
      response.status(201).json(proposal);
    } catch (error) {
      if (error.code === 11000)
        return response
          .status(409)
          .json({ message: "You have already applied to this project." });
      response
        .status(400)
        .json({
          message: "Could not submit the proposal.",
          error: error.message,
        });
    }
  },
);

app.get(
  "/api/proposals/mine",
  requireDatabase,
  authenticate,
  requireRole("freelancer"),
  async (request, response) => {
    const proposals = await Proposal.find({ freelancer: request.user._id })
      .populate("project", "title budget status category")
      .sort({ createdAt: -1 })
      .lean();
    response.json(proposals);
  },
);

app.get(
  "/api/projects/:id/proposals",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    const project = await Project.findOne({
      _id: request.params.id,
      owner: request.user._id,
    });
    if (!project)
      return response.status(404).json({ message: "Project not found." });
    const proposals = await Proposal.find({ project: project._id })
      .populate("freelancer", "name bio skills location avatar")
      .sort({ createdAt: -1 })
      .lean();
    response.json(proposals);
  },
);

app.patch(
  "/api/proposals/:id/status",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    if (!["accepted", "declined"].includes(request.body.status))
      return response
        .status(400)
        .json({ message: "Choose accept or decline." });
    const proposal = await Proposal.findOneAndUpdate(
      {
        _id: request.params.id,
        client: request.user._id,
        status: "pending",
      },
      { status: request.body.status },
      { new: true },
    );
    if (!proposal) {
      const exists = await Proposal.exists({
        _id: request.params.id,
        client: request.user._id,
      });
      return response
        .status(exists ? 409 : 404)
        .json({
          message: exists
            ? "This proposal has already been reviewed."
            : "Proposal not found.",
        });
    }
    if (request.body.status === "accepted") {
      await Promise.all([
        Project.findByIdAndUpdate(proposal.project, { status: "filled" }),
        Proposal.updateMany(
          {
            project: proposal.project,
            _id: { $ne: proposal._id },
            status: "pending",
          },
          { status: "declined" },
        ),
      ]);
    }
    response.json(proposal);
  },
);

app.get(
  "/api/conversations",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const conversations = await Conversation.find({
      participants: request.user._id,
    })
      .populate("participants", "name role avatar")
      .populate("project", "title")
      .sort({ lastMessageAt: -1 })
      .lean();
    response.json(conversations);
  },
);

app.post(
  "/api/conversations/from-proposal/:proposalId",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const proposal = await Proposal.findOne({
      _id: request.params.proposalId,
      status: "accepted",
    });
    if (
      !proposal ||
      ![String(proposal.client), String(proposal.freelancer)].includes(
        String(request.user._id),
      )
    ) {
      return response
        .status(403)
        .json({ message: "Messaging opens after a proposal is accepted." });
    }
    let conversation = await Conversation.findOne({
      project: proposal.project,
      participants: { $all: [proposal.client, proposal.freelancer] },
    });
    if (!conversation)
      conversation = await Conversation.create({
        project: proposal.project,
        participants: [proposal.client, proposal.freelancer],
      });
    response.json({ conversationId: conversation._id });
  },
);

app.post(
  "/api/conversations/invite",
  requireDatabase,
  authenticate,
  requireRole("client"),
  async (request, response) => {
    const { projectId, recipientId } = request.body;
    const [project, recipient] = await Promise.all([
      Project.findOne({
        _id: projectId,
        owner: request.user._id,
        status: "open",
      }),
      User.findOne({ _id: recipientId, role: "freelancer" }).select("_id"),
    ]);
    if (!project || !recipient)
      return response
        .status(404)
        .json({
          message: "Choose one of your open projects and a freelancer.",
        });
    let conversation = await Conversation.findOne({
      project: project._id,
      participants: { $all: [request.user._id, recipient._id] },
    });
    if (!conversation)
      conversation = await Conversation.create({
        project: project._id,
        participants: [request.user._id, recipient._id],
      });
    response.json({ conversationId: conversation._id });
  },
);

app.get(
  "/api/conversations/:id/messages",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const conversation = await Conversation.findOne({
      _id: request.params.id,
      participants: request.user._id,
    })
      .populate("messages.sender", "name avatar")
      .lean();
    if (!conversation)
      return response.status(404).json({ message: "Conversation not found." });
    response.json(conversation.messages);
  },
);

app.post(
  "/api/conversations/:id/messages",
  requireDatabase,
  authenticate,
  async (request, response) => {
    const text = request.body.text?.trim();
    if (!text || text.length > 4000)
      return response
        .status(400)
        .json({ message: "Write a message under 4,000 characters." });
    const conversation = await Conversation.findOne({
      _id: request.params.id,
      participants: request.user._id,
    });
    if (!conversation)
      return response.status(404).json({ message: "Conversation not found." });
    conversation.messages.push({ sender: request.user._id, text });
    conversation.lastMessageAt = new Date();
    await conversation.save();
    response.status(201).json(conversation.messages.at(-1));
  },
);

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB");
      if ((await Project.countDocuments()) === 0) {
        await Project.insertMany(
          starterProjects.map(({ _id, ...project }) => ({
            ...project,
            isSample: true,
            status: "open",
          })),
        );
        console.log("Added sample marketplace projects");
      }
    })
    .catch((error) =>
      console.error("MongoDB connection failed:", error.message),
    );
} else {
  console.log(
    "MONGODB_URI not set; using sample projects until MongoDB is configured.",
  );
}

app.listen(port, () =>
  console.log(`Marketplace API listening on http://localhost:${port}`),
);
