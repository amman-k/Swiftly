import express from "express";
import {
  createList,
  reorderCards,
  updateList,
} from "../controllers/listController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createList);
router.route("/:listId").put(protect, updateList);
router.route("/:listId/reorder-cards").put(protect, reorderCards);

export default router;
