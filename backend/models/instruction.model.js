import mongoose from "mongoose";

const instructionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide product id"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide instruction title"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    file: {
      public_id: { type: String, required: true },
      url: {
        type: String,
        required: true,
        match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Invalid URL"],
      },
    },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

instructionSchema.index({ product: 1, createdAt: -1 });

const Instruction = mongoose.model("Instruction", instructionSchema);
export default Instruction;
