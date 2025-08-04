import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';


const AddListForm = ({ boardId, onListCreated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      const { data: newList } = await axios.post('/api/lists', {
        title,
        boardId,
      });
      onListCreated(newList);
      setTitle('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  if (!isEditing) {
    return (
      <motion.button
        onClick={() => setIsEditing(true)}
        className="w-full md:w-72 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-semibold p-3 rounded-lg transition-colors flex-shrink-0"
      >
        + Add another list
      </motion.button>
    );
  }

  return (
    <div className="w-full md:w-72 bg-light-content/90 p-3 rounded-lg flex-shrink-0">
      <form onSubmit={handleCreateList}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full p-2 rounded-md text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66]"
          autoFocus
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Add List
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};



const BoardView = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listColors = ['bg-light-content', 'bg-list-blue', 'bg-list-green'];

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/boards/${id}`);
        setBoard(data);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Could not load the board. It might not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

  const handleListCreated = (newList) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      lists: [...prevBoard.lists, newList]
    }));
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return <div className="p-8 text-white">Loading board...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  if (!board) {
    return <div className="p-8 text-white">Board not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#2E3944] to-[#212A31] text-white p-4">
      <motion.header 
        initial={{ y: -100 }} animate={{ y: 0 }}
        className="mb-4 flex-shrink-0 sticky top-0 z-10 p-2 -mx-2 rounded-lg bg-darker-bg/50 backdrop-blur-sm"
      >
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/boards" className="flex items-center gap-2 text-gray-300 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-40 p-2 rounded-md transition-colors">
              <FiHome />
              <span className="hidden sm:inline">Back to Boards</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold">{board.title}</h1>
          </div>
        </nav>
      </motion.header>

      <main className="flex-1 overflow-y-auto md:overflow-x-auto pb-4">
        <motion.div 
          className="md:inline-flex md:h-full items-start gap-4 space-y-4 md:space-y-0"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {board.lists.map((list, index) => (
            <motion.div 
              key={list._id} 
              variants={fadeInUp}
              className={`flex flex-col w-full md:w-72 ${listColors[index % listColors.length]}/90 hover:bg-opacity-100 rounded-lg shadow-lg flex-shrink-0 transition-colors`}
            >
              <h2 className="font-bold text-[#212A31] p-3 border-b border-gray-500/50">{list.title}</h2>
              <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                {list.cards.map(card => (
                  <div key={card._id} className="bg-white text-[#212A31] p-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {card.title}
                  </div>
                ))}
                <button className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-300 p-2 rounded-md transition-colors">
                  + Add a card
                </button>
              </div>
            </motion.div>
          ))}
          <motion.div variants={fadeInUp}>
            <AddListForm boardId={id} onListCreated={handleListCreated} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default BoardView;
