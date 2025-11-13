import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import User from "../models/userModel.js";
import DetectionImages from "../models/detectionImagesModel.js";

// --- FIX for __dirname in ES Modules ---
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// --- END FIX ---

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

    // User document will be updated directly using findByIdAndUpdate later,
    // so no need to fetch the full user document here just for its ID.
    // 2) Generate a unique filename and temporary filepath
    const tempFilename = `temp-${uuidv4()}-${Date.now()}.jpeg`;

    // Define a temporary directory relative to your project root
    // This will create a 'public/temp_uploads' folder in the root of your Node.js backend
    const tempDirPath = path.join(__dirname, "..", "public", "temp_uploads"); // Use __dirname here
    const tempFilePath = path.join(tempDirPath, tempFilename);

    // Create the temporary directory if it doesn't exist
    await fs.promises.mkdir(tempDirPath, { recursive: true });

    // Process and save the image buffer to the temporary file
    await sharp(req.file.buffer)
      .resize(224, 224) // Resize to model's expected input dimensions
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(tempFilePath);

    // 3) Create form data to send to Flask API
    const formData = new FormData();
    formData.append("image", fs.createReadStream(tempFilePath), {
      filename: tempFilename,
      contentType: "image/jpeg",
    });

    // 4) Send to Flask API
    const response = await axios.post(PYTHON_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    console.log("Response from Python API:", response.data);

    // 5) Clean up the temporary file after sending
    await fs.promises.unlink(tempFilePath);

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
  const prediction = await DetectionImages.create({
    prediction: req.body,
    userId: req.user.id,
  });
  if (prediction) {
    return res.status(200).json({
      status: "success",
      message: "Prediction saved successfully!",
    });
  }

  next();
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
