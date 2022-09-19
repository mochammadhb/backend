import express from "express";
import {
  editUsers,
  getUserById,
  getUsers,
  Login,
  Logout,
  RefreshToken,
  Register,
} from "../controllers/Users.js";
import { withToken } from "../middleware/token.js";

const router = express.Router();

router.get("/users", withToken, getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", editUsers);
router.post("/register", Register);
router.post("/login", Login);
router.delete("/logout", Logout);

// Refresh Token
router.get("/refresh_token", RefreshToken);

export default router;
