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
    res.status(201).json(savedCard);
  } catch (err) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Server Error: Could not create card." });
  }
};

export { createCard };
