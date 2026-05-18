import express from "express";

import protect from "../middlewares/auth.js";
import {
  loginUser,
  logOutUser,
  registerUser,
  verifyUser,
} from "../controllers/AuthController.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/login", loginUser);
AuthRouter.get("/verify", protect, verifyUser);
AuthRouter.post("/logout", protect, logOutUser);

export default AuthRouter;
