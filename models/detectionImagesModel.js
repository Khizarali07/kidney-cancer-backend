import mongoose from "mongoose";

const detectionImagesSchema = new mongoose.Schema({
  image: {
    type: Buffer,
    default: null,
  },
  prediction: {
    type: Object,
    default: null,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DetectionImages = mongoose.model(
  "DetectionImages",
  detectionImagesSchema
);

export default DetectionImages;
