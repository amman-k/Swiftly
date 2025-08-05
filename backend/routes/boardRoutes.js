import express from "express";
import { getBoards, createBoard, getBoardById,reorderLists } from "../controllers/boardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getBoards).post(protect, createBoard);
router.route("/:id").get(protect,getBoardById);
router.route('/:boardId/reorder-lists').put(protect, reorderLists);

export default router;
