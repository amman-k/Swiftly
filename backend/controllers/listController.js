import List from "../models/listModel.js";
import Board from "../models/boardModel.js";

/**
 * @desc    Create a new list on a board
 * @route   POST /api/lists
 * @access  Private
 */
const createList = async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || !boardId) {
    return res
      .status(400)
      .json({ message: "Title and board ID are required." });
  }

  try {
    // Authorization check remains the same
    const boardExists = await Board.findOne({
      _id: boardId,
      owner: req.user.id,
    });
    if (!boardExists) {
      return res.status(404).json({ message: "Board not found or not authorized." });
    }

    const newList = new List({
      title,
      board: boardId,
    });
    const savedList = await newList.save();

    // --- MODIFICATION START ---
    // Update the board atomically using $push
    await Board.findByIdAndUpdate(boardId, {
      $push: { lists: savedList._id },
    });
    // --- MODIFICATION END ---

    const listWithEmptyCards = { ...savedList.toObject(), cards: [] };
    req.io.to(boardId).emit("listCreated", listWithEmptyCards);

    res.status(201).json(listWithEmptyCards);
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ message: "Server Error: Could not create list." });
  }
};

/**
 * @desc    Reorder the cards within a single list
 * @route   PUT /api/lists/:listId/reorder-cards
 * @access  Private
 */
const reorderCards = async (req, res) => {
  const { listId } = req.params;
  const { orderedCardIds, boardId } = req.body;

  try {
    // Authorization checks remain the same
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, board: boardId }, // Find the list on the correct board
      { $set: { cards: orderedCardIds } }, // Atomically set the new card order
      { new: true } // Option to return the updated document
    );

    if (!updatedList) {
      return res
        .status(404)
        .json({ message: "List not found on this board." });
    }

    req.io.to(boardId).emit("cardsReordered", { listId, orderedCardIds });

    res.status(200).json({ message: "Cards reordered successfully." });
  } catch (error) {
    console.error("Error reordering cards:", error);
    res.status(500).json({ message: "Server Error: Could not reorder cards." });
  }
};
/**
 * @desc    Update a list's title
 * @route   PUT /api/lists/:listId
 * @access  Private
 */

const updateList = async (req, res) => {
  const { listId } = req.params;
  const { title, boardId } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }
  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }

    const list = await List.findOneAndUpdate(
      { _id: listId, board: boardId },
      { title },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }
    req.io.to(boardId).emit("listUpdated", { listId, newTitle: list.title });
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).json({ message: "Server Error: Could not update list." });
  }
};

export { createList, reorderCards, updateList };
