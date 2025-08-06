import List from '../models/listModel.js';
import Board from '../models/boardModel.js';

/**
 * @desc    Create a new list on a board
 * @route   POST /api/lists
 * @access  Private
 */
const createList = async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || !boardId) {
    return res.status(400).json({ message: 'Title and board ID are required.' });
  }

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const newList = new List({
      title,
      board: boardId,
    });
    const savedList = await newList.save();

    board.lists.push(savedList._id);
    await board.save();
    
    const listWithEmptyCards = { ...savedList.toObject(), cards: [] };
    req.io.to(boardId).emit('listCreated', listWithEmptyCards);

    res.status(201).json(savedList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Server Error: Could not create list.' });
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
      return res.status(404).json({ message: 'Board not found.' });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const list = await List.findOne({ _id: listId, board: boardId });
    if (!list) {
      return res.status(404).json({ message: 'List not found on this board.' });
    }

    list.cards = orderedCardIds;
    await list.save();
    
    req.io.to(boardId).emit('cardsReordered', { listId, orderedCardIds });

    res.status(200).json({ message: 'Cards reordered successfully.' });
  } catch (error) {
    console.error('Error reordering cards:', error);
    res.status(500).json({ message: 'Server Error: Could not reorder cards.' });
  }
};

export { createList, reorderCards };
