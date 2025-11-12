import express from "express";
import { protect } from "../controllers/authController.js";
import {
  uploadImage,
  processImage,
  handleMulterError,
  savePrediction,
  getDetections,
} from "../controllers/detectionController.js";

const router = express.Router();

// Protected route - requires authentication
router.post(
  "/",
  protect, // Ensures user is authenticated
  uploadImage, // Handles file upload
  handleMulterError, // Handles any multer errors
  processImage // Processes the uploaded image
);

router.post("/save-prediction", protect, savePrediction);
router.get("/get-detections", protect, getDetections);

export default router;
