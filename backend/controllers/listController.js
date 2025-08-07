import List from "../models/listModel.js";
import Board from "../models/boardModel.js";
import Card from "../models/cardModel.js";

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
    const boardExists = await Board.findOne({
      _id: boardId,
      owner: req.user.id,
    });
    if (!boardExists) {
      return res
        .status(404)
        .json({ message: "Board not found or not authorized." });
    }

    const newList = new List({
      title,
      board: boardId,
    });
    const savedList = await newList.save();

    await Board.findByIdAndUpdate(boardId, {
      $push: { lists: savedList._id },
    });

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
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, board: boardId },
      { $set: { cards: orderedCardIds } },
      { new: true } //
    );

    if (!updatedList) {
      return res.status(404).json({ message: "List not found on this board." });
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

  if (!title || !boardId) {
    return res.status(400).json({ message: "Title and boardId are required" });
  }
  try {
    const list = await List.findOneAndUpdate(
      { _id: listId, board: boardId },
      { title },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }

    const io = req.io;
    req.io.to(boardId).emit("listUpdated", { listId, newTitle: list.title });

    res.status(200).json(list);
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).json({ message: "Server Error: Could not update list." });
  }
};

/**
 * @desc    Delete a list and all its cards
 * @route   DELETE /api/lists/:listId
 * @access  Private
 */

const deleteList = async (req, res) => {
    const { listId } = req.params;
    const { boardId } = req.query;

    try {
        // --- CORRECTED: Find the board and verify ownership in a single, safe query ---
        const board = await Board.findOne({ _id: boardId, owner: req.user.id });
        if (!board) {
            return res.status(401).json({ message: "Not authorized or board not found." });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: "List not found." });
        }

        if (list.cards && list.cards.length > 0) {
            await Card.deleteMany({ _id: { $in: list.cards } });
        }

        await List.findByIdAndDelete(listId);

        await Board.findByIdAndUpdate(boardId, {
            $pull: { lists: listId }
        });

        req.io.to(boardId).emit("listDeleted", { listId, boardId });

        res.status(200).json({ message: "List deleted successfully." });
    } catch (error) {
        console.error("Error deleting list:", error);
        res.status(500).json({ message: "Server Error: Could not delete list." });
    }
};

export { createList, reorderCards, updateList, deleteList };
