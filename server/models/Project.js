import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    skills: { type: [String], default: [] },
    budget: { type: Number, required: true, min: 1 },
    budgetType: { type: String, default: "Fixed price" },
    duration: { type: String, default: "To be discussed" },
    postedAt: { type: String, default: "Just now" },
    client: { type: String, required: true },
    company: { type: String, default: "" },
    location: { type: String, default: "Remote" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["open", "paused", "filled", "closed"],
      default: "open",
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    avatar: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Project", projectSchema);
