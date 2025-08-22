import express from "express";
import {
  createInstruction,
  getInstructions,
  getInstructionById,
  updateInstruction,
  replaceInstructionFile,
  deleteInstruction,
} from "../controllers/instructionController.js";
import {
  isAuthenticatedUser,
  isAuthorizedUser,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: view instructions and single instruction
router.get("/instructions", getInstructions);
router.get("/instructions/:id", getInstructionById);

// Admin: manage instructions
router.post(
  "/admin/instructions",
  isAuthenticatedUser,
  isAuthorizedUser("admin", "employee"),
  createInstruction
);

router.put(
  "/admin/instructions/:id",
  isAuthenticatedUser,
  isAuthorizedUser("admin", "employee"),
  updateInstruction
);

router.put(
  "/admin/instructions/:id/file",
  isAuthenticatedUser,
  isAuthorizedUser("admin", "employee"),
  replaceInstructionFile
);

router.delete(
  "/admin/instructions/:id",
  isAuthenticatedUser,
  isAuthorizedUser("admin", "employee"),
  deleteInstruction
);

export default router;
