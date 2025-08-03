import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiX } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';


const DashboardNavbar = ({ user }) => {
  return (
    <header className="p-4 bg-[#212A31]">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Swiftly</div>
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">{user.name}</span>
          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
          <a 
            href="http://localhost:5001/auth/logout" 
            className="flex items-center gap-2 text-gray-300 hover:text-white border border-gray-600 hover:bg-red-600 hover:border-red-600 font-semibold py-2 px-4 rounded transition-all duration-200"
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
    if (!title.trim()) return;
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
            className="bg-[#2E3944] rounded-lg p-8 shadow-xl w-full max-w-md relative"
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
                className="w-full p-3 rounded-lg bg-gray-200 text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full mt-6 bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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




const BoardsDashboard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/boards', {
          withCredentials: true,
        });
        setBoards(data);
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError('Could not load your boards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleCreateBoard = async (title) => {
    try {
      const { data: newBoard } = await axios.post('http://localhost:5001/api/boards', 
        { title }, 
        { withCredentials: true }
      );
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setIsModalOpen(false); 
    } catch (err) {
      console.error('Error creating board:', err);
      
    }
  };

  if (!user) {
    return null; 
  }

  return (
    <>
      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateBoard} 
      />
      <div className="flex flex-col h-screen">
        <DashboardNavbar user={user} />
        <main className="flex-grow p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Your Boards</h1>
          
          {loading && <p>Loading boards...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {boards.map((board) => (
                <div key={board._id} className="bg-[#D3D9D4] text-[#212A31] p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                  <h2 className="font-bold text-xl">{board.title}</h2>
                </div>
              ))}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold p-4 rounded-lg shadow-md transition-colors border-2 border-dashed border-gray-400 hover:border-white flex flex-col items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create a new board
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default BoardsDashboard;
