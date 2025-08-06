import Board from '../models/boardModel.js';
import User from '../models/userModel.js';
import List from '../models/listModel.js';


const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id });
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not fetch boards.' });
  }
};
const createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  try {
    const newBoard = new Board({
      title,
      owner: req.user.id,
    });
    const savedBoard = await newBoard.save();
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { boards: savedBoard._id } },
      { new: true }
    );
    res.status(201).json(savedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not create board.' });
  }
};


/**
 * @desc    Get a single board by its ID
 * @route   GET /api/boards/:id
 * @access  Private
 */
const getBoardById = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user.id }).populate({
      path: 'lists',
      populate: {
        path: 'cards',
        model: 'Card'
      }
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or you are not authorized.' });
    }

    res.status(200).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Could not fetch board.' });
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

    const updatedBoard = await Board.findOneAndUpdate(
      { _id: boardId, owner: req.user.id }, 
      { $set: { lists: orderedListIds } }, 
      { new: true }
    );

    if (!updatedBoard) {
      return res.status(404).json({ message: 'Board not found or you are not authorized.' });
    }

    req.io.to(boardId).emit('listsReordered', { orderedListIds });

    res.status(200).json({ message: 'Lists reordered successfully.' });
  } catch (error) {
    console.error('Error reordering lists:', error);
    res.status(500).json({ message: 'Server Error: Could not reorder lists.' });
  }
};


export { getBoards, createBoard, getBoardById, reorderLists };
