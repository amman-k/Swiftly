import express from "express";
import { getBoards, createBoard } from "../controllers/boardController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/boards").get(protect, getBoards).post(protect, createBoard);

export default router;
