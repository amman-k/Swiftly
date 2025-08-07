import Card from "../models/cardModel.js";
import List from "../models/listModel.js";

/**
 * @desc    Create a new card in a list
 * @route   POST /api/cards
 * @access  Private
 */

const createCard = async (req, res) => {
  const { title, listId } = req.body;
  if (!title || !listId) {
    return res.status(400).json({ message: "Title and Id are required" });
  }
  try {
    const list = await List.findById(listId);
    if (!list) {
      res.status(404).json({ message: "list not found" });
    }
    const card = new Card({
      title,
      list: listId,
    });
    const savedCard = await card.save();

    list.cards.push(savedCard._id);
    await list.save();

    const boardId = list.board.toString();
    req.io.to(boardId).emit("cardCreated", { newCard: savedCard, listId });
    res.status(201).json(savedCard);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Server Error: Could not create card." });
  }
};

/**
 * @desc    Move a card to a new list and/or position
 * @route   PUT /api/cards/:cardId/move
 * @access  Private
 */

const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { sourceListId, destListId, boardId } = req.body;

  if (!cardId || !sourceListId || !destListId || !boardId) {
    return res
      .status(400)
      .json({ message: "Card ID, list IDs, and board ID are required." });
  }

  try {
    // Step 1: Atomically remove the card's ID from the source list's 'cards' array.
    const updatedSourceList = await List.findByIdAndUpdate(
      sourceListId,
      { $pull: { cards: cardId } },
      { new: true }
    );

    // Step 2: Atomically add the card's ID to the destination list's 'cards' array.
    const updatedDestList = await List.findByIdAndUpdate(
      destListId,
      { $addToSet: { cards: cardId } },
      { new: true }
    );

    // Step 3: Update the 'list' field on the Card document itself.
    if (sourceListId !== destListId) {
      await Card.findByIdAndUpdate(cardId, { list: destListId });
    }

    // Step 4: Emit WebSocket events to update all clients.
    const io = req.io;
    if (io) {
      if (updatedSourceList) {
        io.to(boardId).emit("cardsReordered", {
          listId: sourceListId,
          orderedCardIds: updatedSourceList.cards.map((c) => c.toString()),
        });
      }
      if (updatedDestList) {
        io.to(boardId).emit("cardsReordered", {
          listId: destListId,
          orderedCardIds: updatedDestList.cards.map((c) => c.toString()),
        });
      }
    }

    res.status(200).json({ message: "Card moved successfully." });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({ message: "Server Error: Could not move card." });
  }
};

/**
 * @desc    Delete a card
 * @route   DELETE /api/cards/:cardId
 * @access  Private
 */

const deleteCard = async (req, res) => {
  const { cardId } = req.params;
  const { boardId } = req.query;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "card not found" });
    }
    const { list: listId } = card;

    await Card.findByIdAndDelete(cardId);
    await List.findByIdAndUpdate(listId, {
      $pull: { cards: cardId },
    });
    req.io
      .to(boardId)
      .emit("cardDeleted", { cardId, listId: listId.toString() });
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ message: "Server Error: Could not delete card." });
  }
};

export { createCard, moveCard, deleteCard };
