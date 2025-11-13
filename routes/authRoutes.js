import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  getMe,
  updateMe,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);

// Protected routes
router.post("/updateMyPassword", protect, updatePassword);
router.patch("/updateMe", protect, updateMe);

export default router;
