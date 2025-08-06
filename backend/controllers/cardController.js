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
    return res.status(400).json({ message: "Title and list ID are required." });
  }

  try {
    // First, create the new card document
    const newCard = new Card({
      title,
      list: listId,
    });
    const savedCard = await newCard.save();

    // --- MODIFICATION START ---
    // Atomically add the new card's ID to the corresponding list's `cards` array
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $push: { cards: savedCard._id } },
      { new: true } // This option is good practice but not strictly needed here
    );

    if (!updatedList) {
      // If the list isn't found, we should probably delete the card we just created
      // to avoid orphaned data. This is an example of a "rollback".
      await Card.findByIdAndDelete(savedCard._id);
      return res.status(404).json({ message: "List not found." });
    }
    // --- MODIFICATION END ---

    // Use the board ID from the list we just updated
    const boardId = updatedList.board.toString();
    req.io.to(boardId).emit("cardCreated", { newCard: savedCard, listId });

    res.status(201).json(savedCard);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Server Error: Could not create card." });
  }
};

/**
 * @desc    Move a card to a new list and/or position
 * @route   PUT /api/cards/:id/move
 * @access  Private
 */
const moveCard = async (req, res) => {
  // Use `id` from params to match your route `/api/cards/:id/move`
  const { id: cardId } = req.params;
  
  // --- MODIFICATION: Added `boardId` to be read from the request body ---
  const { sourceListId, destListId, boardId } = req.body;

  // Basic validation
  if (!sourceListId || !destListId || !boardId) {
      return res.status(400).json({ message: "Source list, destination list, and board ID are required." });
  }

  try {
    // --- MODIFICATION START: Replaced find/splice/save with atomic updates ---
    // Step 1: Atomically remove the card ID from the source list's `cards` array.
    await List.findByIdAndUpdate(sourceListId, {
      $pull: { cards: cardId },
    });

    // Step 2: Atomically add the card ID to the destination list's `cards` array.
    // Note: We are just adding it. The exact ordering is handled by the `reorder-cards` endpoint.
    await List.findByIdAndUpdate(destListId, {
      $push: { cards: cardId },
    });
    // --- MODIFICATION END ---
    
    // Step 3: If the lists are different, update the `list` field on the card document itself.
    if (sourceListId !== destListId) {
      await Card.findByIdAndUpdate(cardId, { list: destListId });
    }

    // --- FIX: `boardId` is now defined and can be used for the socket broadcast ---
    req.io.to(boardId).emit("cardMoved", {
      cardId,
      sourceListId,
      destListId,
      // You may not need to send back indices, as the frontend state is handled there.
      // The socket event can just trigger a refetch or confirm the optimistic update.
    });

    res.status(200).json({ message: "Card moved successfully." });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({ message: "Server Error: Could not move card." });
  }
};

export { createCard, moveCard };