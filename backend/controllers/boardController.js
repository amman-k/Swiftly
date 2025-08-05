import Board from "../models/boardModel.js";
import User from "../models/userModel.js";

/**
 * @desc    Get all boards for the logged-in user
 * @route   GET /api/boards
 * @access  Private
 */
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id });
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: "error fetching boards" });
  }
};

/**
 * @desc    Create a new board
 * @route   POST /api/boards
 * @access  Private
 */

const createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  try {
    const newBoard = new Board({
      title,
      owner: req.user.id,
    });
    const savedBoard = await newBoard.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { boards: newBoard } },
      { new: true }
    );
    res.status(201).json(savedBoard);
  } catch (err) {
    res.status(500).json({ message: "Failed to create new board" });
  }
};

/**
 * @desc    Get a single board by its ID
 * @route   GET /api/boards/:id
 * @access  Private
 */

const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate({
      path: "lists",
      populate: {
        path: "cards",
        model: "Card",
      },
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    if (board.owner.toString() != req.user.id) {
      return res.status(401).json({ message: "Not Authorized." });
    }
    res.status(200).json(board);
  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not fetch board." });
  }
};

/**
 * @desc    Reorder the lists on a board
 * @route   PUT /api/boards/:id/reorder-lists
 * @access  Private
 */

const reorderLists = async (req, res) => {
  const { boardId } = req.params;
  const { orderedListIds } = req.body;

  try {
    const board = Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    board.lists = orderedListIds;
    await board.save();
    res.status(200).json({ message: "list rendered successfully" });
  } catch (error) {
    console.error("Error reordering lists:", error);
    res.status(500).json({ message: "Server Error: Could not reorder lists." });
  }
};

export { getBoards, createBoard, getBoardById, reorderLists };
