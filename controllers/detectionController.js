import multer from "multer";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import User from "../models/userModel.js";
import DetectionImages from "../models/detectionImagesModel.js";
import AppError from "../utils/appError.js";

// --- Multer Configuration for memory storage ---
const multerStorage = multer.memoryStorage();

// --- Filter to accept only image files ---
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// --- Configure multer upload middleware ---
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// --- Middleware to handle single file upload ---
export const uploadImage = upload.single("image");

// --- Python Flask API URL (Updated to new unified API) ---
const PYTHON_API_URL =
  "https://khizarali07-kidney-cancer-backend.hf.space/api/v1/predict/image";

// --- Main controller function to process image and get prediction ---
export const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Please upload an image file.",
      });
    }

    // Process image in memory (no disk writes for Vercel compatibility)
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize(224, 224) // Resize to model's expected input dimensions
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    // Create form data to send to Flask API
    const formData = new FormData();
    formData.append("image", processedImageBuffer, {
      filename: `image-${Date.now()}.jpeg`,
      contentType: "image/jpeg",
    });

    // Send to Flask API
    const response = await axios.post(PYTHON_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    console.log("Response from Python API:", response.data);

    // Extract prediction from new API response structure
    const predictionData = response.data.data;

    const detectionImage = new DetectionImages({
      image: req.file.buffer,
      prediction: predictionData,
      confidence: predictionData.confidence,
      userId: req.user.id, // Use req.user.id directly
    });

    await detectionImage.save();

    // Atomically add the detectionImage ID to the user's detectionImages array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { detectionImages: detectionImage._id },
    });

    // 6) Send the prediction result back to the client
    res.status(200).json({
      status: "success",
      data: {
        prediction: predictionData,
      },
    });
  } catch (err) {
    console.error("Error in processImage:", err);
    next(err);
  }
};

// --- Error handling middleware for multer ---
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
  next();
};

export const savePrediction = async (req, res, next) => {
  try {
    const body = req.body || {};

    // Expect payload from frontend: { formData, prediction, probability, confusion_matrix, precision, recall, ... }
    const { formData, prediction, probability } = body;

    if (!prediction) {
      return next(new AppError("Missing 'prediction' in request body", 400));
    }

    const saved = await DetectionImages.create({
      image: null,
      prediction: {
        ...body,
        formData: formData || body.formData || null,
      },
      confidence: typeof probability === "number" ? probability : 0,
      userId: req.user.id,
    });

    return res.status(201).json({
      status: "success",
      message: "Prediction saved successfully!",
      data: {
        prediction: saved,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getDetections = async (req, res, next) => {
  const detections = await DetectionImages.find({
    userId: req.user.id,
  });
  if (detections) {
    return res.status(200).json({
      status: "success",
      data: {
        detections,
      },
    });
  }

  next();
};
