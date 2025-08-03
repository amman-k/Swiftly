import List from "../models/listModel.js";
import Board from "../models/boardModel.js";

/**
 * @desc    Create a new list on a board
 * @route   POST /api/lists
 * @access  Private
 */

const createList = async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || boardId) {
    return res
      .status(400)
      .json({ message: "Title and board ID are required." });
  }
  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }
    const newList = new List({
      title,
      board: boardId,
    });
    const savedList = await newList.save();
    board.lists.push(savedList._id);
    await board.save();
    res.status(201).json(savedList);
  } catch (err) {
    console.error("Error creating list:", error);
    res.status(500).json({ message: "Server Error: Could not create list." });
  }
};

export { createList };
