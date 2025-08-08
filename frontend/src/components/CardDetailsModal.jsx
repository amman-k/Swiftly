import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFileText } from 'react-icons/fi';

const CardDetailsModal = ({ card, isOpen, onClose, onUpdateCard, boardId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // --- CORRECTED: This useEffect now correctly updates the state ---
  // It runs every time the 'card' prop changes.
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || ''); // Use description from the card, or an empty string
    }
  }, [card]);

  if (!isOpen || !card) {
    return null;
  }

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedDetails = {
      title,
      description,
      boardId,
    };

    onUpdateCard(card._id, updatedDetails);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-100 rounded-lg p-6 shadow-2xl w-full max-w-2xl text-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start mb-4">
            <FiFileText size={24} className="mr-3 mt-1 text-gray-500" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-accent rounded-md p-1 -ml-1"
            />
            <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-700"><FiX size={24} /></button>
          </div>

          {/* Description */}
          <div className="ml-9">
            <h3 className="font-semibold mb-2">Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-accent"
              rows="4"
            />
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end mt-6 ml-9">
            <button 
              onClick={handleSave}
              className="bg-primary-accent hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardDetailsModal;
