import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- Reusable Components ---

const DashboardNavbar = ({ user }) => {
  return (
    <header className="p-4 bg-[#212A31]">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Swiftly</div>
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">{user.name}</span>
          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
          <a 
            href="/auth/logout"
            className="flex items-center gap-2 text-gray-400 hover:text-white border border-gray-600 hover:bg-red-600 hover:border-red-600 font-semibold py-2 px-4 rounded-4xl transition-all duration-200"
          >
            <FiLogOut />
            <span>Logout</span>
          </a>
        </div>
      </nav>
    </header>
  );
};

const CreateBoardModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    onCreate(title);
    setTitle('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-[#2E3944] rounded-4xl p-8 shadow-xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white">Create New Board</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter board title..."
                className="w-full p-3 rounded-2xl bg-gray-200 text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full mt-6 bg-[#124E66] hover:bg-opacity-80 text-gray-400 hover:text-white font-bold py-3 px-4 rounded-4xl transition-colors"
              >
                Create Board
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, boardTitle }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-darker-bg rounded-lg p-8 shadow-2xl w-full max-w-md text-center"
                >
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50">
                        <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mt-4 text-white">Delete "{boardTitle}"?</h3>
                    <p className="text-gray-400 mt-2">Are you sure? All lists and cards will be permanently removed. This action cannot be undone.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-4xl transition-colors">Cancel</button>
                        <button onClick={onConfirm} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-4xl transition-colors">Delete</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


const EditBoardModal = ({ board, isOpen, onClose, onUpdate }) => {
    const [title, setTitle] = useState(board?.title || '');

    useEffect(() => {
        if (board) {
            setTitle(board.title);
        }
    }, [board]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
          toast.error("Title cannot be empty.");
            return;
        }
        if(title===board.title){
          onClose();
          return;
        }
        onUpdate(board._id, title);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-[#2E3944] rounded-4xl p-8 shadow-xl w-full max-w-md relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-white">Edit Board Title</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-gray-200 text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66]"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full mt-6 bg-[#124E66] hover:bg-opacity-80 text-gray-400 hover:text-white font-bold py-3 px-4 rounded-4xl transition-colors"
                        >
                            Save Changes
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


const EmptyState = ({ onOpenCreateModal }) => {
    return (
        <div className="text-center py-16 border-2 border-dashed border-gray-600 rounded-4xl">
            <h2 className="text-2xl font-semibold text-gray-200">Welcome to Swiftly!</h2>
            <p className="text-gray-300 mt-2">You don't have any boards yet. Get started by creating one.</p>
            <button 
                onClick={onOpenCreateModal}
                className="mt-6 bg-black hover:bg-opacity-80 text-gray-400 hover:text-white font-bold py-3 px-6 rounded-4xl shadow-md transition-colors"
            >
                Create Your First Board
            </button>
        </div>
    );
};


// --- Main Dashboard Component ---
const BoardsDashboard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [boardToEdit, setBoardToEdit] = useState(null); // State for the edit modal

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { data } = await axios.get('/api/boards');
        setBoards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError('Could not load your boards. Please try again later.');
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchBoards();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleCreateBoard = async (title) => {
    try {
      const { data: newBoard } = await axios.post('/api/boards', { title });
      setBoards(prevBoards => [...prevBoards, newBoard]);
      toast.success("Board Created Successfully");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating board:', err);
      toast.error("Error creating Board");
    }
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
        await axios.delete(`/api/boards/${boardToDelete._id}`);
        setBoards(prevBoards => prevBoards.filter(board => board._id !== boardToDelete._id));
        setBoardToDelete(null);
        toast.success("Board Deleted Successfully")
    } catch (err) {
        console.error("Failed to delete board:", err);
        toast.error("Error Deleting Board")
    }
  };

  
  const handleUpdateBoard = async (boardId, newTitle) => {
    try {
        const { data: updatedBoard } = await axios.put(`/api/boards/${boardId}`, { title: newTitle });
        setBoards(prevBoards => prevBoards.map(board => board._id === boardId ? updatedBoard : board));
        setBoardToEdit(null);
        toast.success("Board Updated Successfully");
    } catch (err) {
        console.error("Failed to update board:", err);
        toast.error("Error Updating Board");
    }
  };


  if (!user) {
    return null; 
  }

  return (
    <>
      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateBoard} 
      />
      <ConfirmationModal
        isOpen={!!boardToDelete}
        onClose={() => setBoardToDelete(null)}
        onConfirm={confirmDeleteBoard}
        boardTitle={boardToDelete?.title}
      />
      <EditBoardModal
        isOpen={!!boardToEdit}
        onClose={() => setBoardToEdit(null)}
        onUpdate={handleUpdateBoard}
        board={boardToEdit}
      />
      <div className="flex flex-col h-screen">
        <DashboardNavbar user={user} />
        <main className="flex-grow p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Your Boards</h1>
          
          {loading && <p>Loading boards...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && (
            <>
              {boards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {boards.map((board) => (
                    <div key={board._id} className="relative group">
                      <Link to={`/board/${board._id}`} className="block bg-[#D3D9D4] text-[#212A31] p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full">
                        <h2 className="font-bold text-xl">{board.title}</h2>
                      </Link>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBoardToEdit(board); }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 bg-white/50 hover:bg-white rounded-full"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBoardToDelete(board); }}
                          className="p-1.5 text-gray-500 hover:text-red-600 bg-white/50 hover:bg-white rounded-full"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#212121] hover:bg-opacity-80 text-gray-400 hover:text-white font-bold p-4 rounded-2xl shadow-md transition-colors border-2 border-dashed border-gray-400 hover:border-white flex flex-col items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create a new board
                  </button>
                </div>
              ) : (
                <EmptyState onOpenCreateModal={() => setIsCreateModalOpen(true)} />
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default BoardsDashboard;
