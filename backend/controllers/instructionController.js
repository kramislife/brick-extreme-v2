import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Utills/customErrorHandler.js";
import Instruction from "../models/instruction.model.js";
import Product from "../models/product.model.js";
import { uploadPDF, deleteImage } from "../Utills/cloudinary.js";

// Create instruction (Admin)
export const createInstruction = catchAsyncErrors(async (req, res, next) => {
  const { product, title, file } = req.body;

  if (!product || !title || !file) {
    return next(new ErrorHandler("Product, title and file are required", 400));
  }

  const existing = await Product.findById(product).select("_id");
  if (!existing) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const uploaded = await uploadPDF(file, "brick_extreme/instructions");

  const instruction = await Instruction.create({
    product,
    title,
    file: uploaded,
    created_by: req.user?.user_id,
  });

  res
    .status(201)
    .json({ success: true, message: "Instruction created", instruction });
});

// Get instructions (optionally by product)
export const getInstructions = catchAsyncErrors(async (req, res) => {
  const { product } = req.query;
  const filter = {};
  if (product) filter.product = product;
  const instructions = await Instruction.find(filter)
    .populate("product", "product_name itemID")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, instructions });
});

// Get single instruction
export const getInstructionById = catchAsyncErrors(async (req, res, next) => {
  const instruction = await Instruction.findById(req.params.id).populate(
    "product",
    "product_name itemID"
  );
  if (!instruction) return next(new ErrorHandler("Instruction not found", 404));
  res.status(200).json({ success: true, instruction });
});

// Update instruction metadata (title, product)
export const updateInstruction = catchAsyncErrors(async (req, res, next) => {
  const { title, product } = req.body;

  if (product) {
    const exists = await Product.findById(product).select("_id");
    if (!exists) return next(new ErrorHandler("Product not found", 404));
  }

  const instruction = await Instruction.findByIdAndUpdate(
    req.params.id,
    { title, product, updated_by: req.user?.user_id },
    { new: true, runValidators: true }
  );

  if (!instruction) return next(new ErrorHandler("Instruction not found", 404));

  res
    .status(200)
    .json({ success: true, message: "Instruction updated", instruction });
});

// Replace PDF file
export const replaceInstructionFile = catchAsyncErrors(
  async (req, res, next) => {
    const { file } = req.body;
    if (!file) return next(new ErrorHandler("File is required", 400));

    const instruction = await Instruction.findById(req.params.id);
    if (!instruction)
      return next(new ErrorHandler("Instruction not found", 404));

    if (instruction.file?.public_id) {
      await deleteImage(instruction.file.public_id, "pdf");
    }

    const uploaded = await uploadPDF(file, "brick_extreme/instructions");
    instruction.file = uploaded;
    instruction.updated_by = req.user?.user_id;
    await instruction.save();

    res
      .status(200)
      .json({ success: true, message: "File replaced", instruction });
  }
);

// Delete instruction (and its PDF)
export const deleteInstruction = catchAsyncErrors(async (req, res, next) => {
  const instruction = await Instruction.findById(req.params.id);
  if (!instruction) return next(new ErrorHandler("Instruction not found", 404));

  if (instruction.file?.public_id) {
    await deleteImage(instruction.file.public_id, "pdf");
  }
  await instruction.deleteOne();

  res.status(200).json({ success: true, message: "Instruction deleted" });
});
