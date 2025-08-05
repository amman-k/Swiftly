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
    const boardId = list.board._id.toString();
    req.io.to(boardId).emit("cardCreated", { newCard: savedCard, listId });
    res.status(201).json(savedCard);
  } catch (err) {
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
  const { cardId } = req.params;
  const { sourceListId, destListId, sourceIndex, destIndex } = req.body;

  try {
    const sourceList = await List.findById(sourceListId);
    if (!sourceList) {
      return res.status(404).json({ message: "Source list not found" });
    }
    const [movedCardId] = sourceList.cards.splice(sourceIndex, 1);
    await sourceList.save();

    const destList = await List.findById(destListId);
    if (!destList)
      return res.status(404).json({ message: "Destination list not found" });

    destList.cards.splice(destIndex, 0, movedCardId);
    await destList.save();

    if (sourceListId !== destListId) {
      await Card.findByIdAndUpdate(cardId, { list: destListId });
    }
    const moveData = {
      cardId,
      sourceListId,
      destListId,
      sourceIndex,
      destIndex,
    };
    req.io.to(boardId).emit("cardMoved", moveData);

    res.status(200).json({ message: "Card moved successfully." });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({ message: "Server Error: Could not move card." });
  }
};

export { createCard, moveCard };
