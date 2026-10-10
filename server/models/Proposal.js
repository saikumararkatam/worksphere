import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String, required: true, trim: true, maxlength: 2500 },
    bid: { type: Number, required: true, min: 1 },
    duration: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true },
);

proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

export default mongoose.model("Proposal", proposalSchema);
