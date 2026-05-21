import express from "express";
import {
  getUserThumbnails,
  getUserThumbnailsById,
} from "../controllers/UserController.js";
import protect from "../middlewares/auth.js";

const UserRouter = express.Router();

UserRouter.get("/thumbnails", protect, getUserThumbnails);
UserRouter.get("/thumbnail/:id", protect, getUserThumbnailsById);

export default UserRouter;
