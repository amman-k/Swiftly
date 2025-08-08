import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DndContext, closestCorners } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import io from 'socket.io-client';
import CardDetailsModal from '../components/CardDetailsModal'; 

const AnimatedBlobs = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
    <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-primary-accent/20 rounded-full blur-3xl animate-pulse opacity-40"></div>
    <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-list-green/20 rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
  </div>
);

/* ---------------------------------- Card ---------------------------------- */
const SortableCard = ({ card, onDeleteCard, onCardClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { type: 'Card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="bg-white text-gray-800 p-3 rounded-xl shadow hover:shadow-lg transition-all group relative"
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    >
      <div {...listeners} {...attributes} className="cursor-grab select-none w-full">{card.title}</div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onCardClick(card)}
          className="p-1 text-gray-400 hover:text-blue-500"
          aria-label="Edit card"
        >
          <FiEdit2 size={16} />
        </button>
        <button
          onClick={() => onDeleteCard(card._id, card.list)}
          className="p-1 text-gray-400 hover:text-red-500"
          aria-label="Delete card"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* ---------------------------------- List ---------------------------------- */
const SortableList = ({ list, color, children, onUpdateListTitle, onDeleteList }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  useEffect(() => setTitle(list.title), [list.title]);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: list._id,
    data: { type: 'List', list },
    disabled: isEditingTitle,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleTitleBlur = () => {
    if (title.trim() && title !== list.title) onUpdateListTitle(list._id, title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleBlur();
    if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col w-full md:w-72 flex-shrink-0">
      <div className={`h-full flex flex-col ${color}/80 rounded-xl shadow-md backdrop-blur-sm`}>
        {isEditingTitle ? (
          <div className="p-3 border-b border-gray-300">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full text-sm font-semibold text-gray-800 focus:outline-none border border-primary-accent rounded-lg p-1"
            />
          </div>
        ) : (
          <div {...attributes} {...listeners} className="flex justify-between items-center w-full cursor-grab p-3 border-b border-gray-300">
            <h2 className="text-md font-bold text-gray-800">{list.title}</h2>
          </div>
        )}
        <div className="flex-grow p-3 space-y-3 overflow-y-auto bg-white/80">
          {children}
        </div>
        <div className="border-t border-gray-300 p-2 flex items-center justify-evenly">
          <button onClick={() => setIsEditingTitle(true)} className="flex items-center text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700 p-1 rounded-xl">
            <FiEdit2 className="mr-1" /> Edit
          </button>
          <button onClick={() => onDeleteList(list._id)} className="flex items-center text-sm text-gray-500 hover:bg-red-100 hover:text-red-400 p-1 rounded-xl">
            <FiTrash2 className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------- Add Forms ------------------------------ */
const AddCardForm = ({ listId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setIsEditing(false);
    try {
      await axios.post('/api/cards', { title, listId });
      setTitle('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-xl w-full">
        + Add a card
      </button>
    );
  }

  return (
    <form onSubmit={handleCreateCard} className="space-y-2">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm text-black p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-accent resize-none"
        placeholder="Enter a title for this card..."
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button type="submit" className="bg-black text-gray-400 text-sm px-4 py-2 rounded-xl hover:bg-opacity-80 hover:text-white transition">
          Add Card
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
      </div>
    </form>
  );
};

const AddListForm = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setIsEditing(false);
    try {
      await axios.post('/api/lists', { title, boardId });
      setTitle('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white px-4 py-3 rounded-lg transition w-full md:w-72 text-left font-semibold">
        + Add another list
      </button>
    );
  }

  return (
    <div className="w-full md:w-72 bg-white p-3 rounded-2xl shadow-md">
      <form onSubmit={handleCreateList}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full p-2 rounded border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-accent"
          autoFocus
        />
        <div className="flex items-center gap-2 mt-2">
          <button type="submit" className="bg-black text-gray-400 px-4 py-2 rounded text-sm hover:text-white transition">
            Add List
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------------------------- Main Board View ---------------------------- */
const BoardView = () => {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const listColors = ['bg-white'];

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await axios.get(`/api/boards/${boardId}`);
        setBoard(data);
      } catch {
        setError('Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    if (boardId) fetchBoard();
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;
    const socket = io('/');
    socket.emit('joinBoard', boardId);

    const updateBoard = (updateFn) => setBoard((prev) => (prev ? updateFn(prev) : null));

    socket.on('listCreated', (newList) => updateBoard(prev => ({ ...prev, lists: [...prev.lists, newList] })));
    socket.on('cardCreated', ({ newCard, listId }) => updateBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => l._id === listId ? { ...l, cards: [...(l.cards || []), newCard] } : l),
    })));
    socket.on('listsReordered', ({ orderedListIds }) => updateBoard(prev => {
      const listMap = new Map(prev.lists.map(l => [l._id, l]));
      return { ...prev, lists: orderedListIds.map(id => listMap.get(id)) };
    }));
    socket.on('cardsReordered', ({ listId, orderedCardIds }) => updateBoard(prev => {
      const cardMap = new Map(prev.lists.flatMap(l => l.cards).map(c => [c._id, c]));
      return {
        ...prev,
        lists: prev.lists.map(l => l._id === listId ? {
          ...l,
          cards: orderedCardIds.map(id => cardMap.get(id)).filter(Boolean)
        } : l),
      };
    }));
    socket.on('listUpdated', ({ listId, newTitle }) => updateBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => l._id === listId ? { ...l, title: newTitle } : l),
    })));
    socket.on('cardDeleted', ({ cardId, listId }) => updateBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => l._id === listId ? {
        ...l,
        cards: l.cards.filter(c => c._id !== cardId)
      } : l),
    })));
    socket.on('listDeleted', ({ listId }) => updateBoard(prev => ({
      ...prev,
      lists: prev.lists.filter(l => l._id !== listId),
    })));
    socket.on('cardUpdated', ({ updatedCard }) => updateBoard(prev => ({
        ...prev,
        lists: prev.lists.map(list => list._id === updatedCard.list ? { ...list, cards: list.cards.map(c => c._id === updatedCard._id ? updatedCard : c) } : list)
    })));

    return () => {
      socket.emit('leaveBoard', boardId);
      socket.disconnect();
    };
  }, [boardId]);

  const handleUpdateListTitle = (listId, newTitle) => {
    axios.put(`/api/lists/${listId}`, { title: newTitle, boardId }).catch(console.error);
  };

  const handleDeleteCard = (cardId, listId) => {
    axios.delete(`/api/cards/${cardId}`, { params: { boardId, listId } }).catch(console.error);
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Delete this list and all its cards?')) {
      axios.delete(`/api/lists/${listId}`, { params: { boardId } }).catch(console.error);
    }
  };

  const handleUpdateCard = (cardId, updatedDetails) => {
    axios.put(`/api/cards/${cardId}`, updatedDetails).catch(console.error);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    
    if (activeType === 'List') {
        setBoard(prev => {
            const oldIndex = prev.lists.findIndex(l => l._id === active.id);
            const newIndex = prev.lists.findIndex(l => l._id === over.id);
            const reorderedLists = arrayMove(prev.lists, oldIndex, newIndex);
            axios.put(`/api/boards/${boardId}/reorder-lists`, { orderedListIds: reorderedLists.map(l => l._id) });
            return { ...prev, lists: reorderedLists };
        });
    }

    if (activeType === 'Card') {
        const sourceListId = active.data.current.card.list;
        const destListId = over.data.current?.type === 'Card' ? over.data.current.card.list : over.id;

        setBoard(prev => {
            const sourceList = prev.lists.find(l => l._id === sourceListId);
            const destList = prev.lists.find(l => l._id === destListId);
            if (!sourceList || !destList) return prev;
            
            if (sourceListId === destListId) {
                const oldCardIndex = sourceList.cards.findIndex(c => c._id === active.id);
                const newCardIndex = destList.cards.findIndex(c => c._id === over.id);
                if (oldCardIndex === -1 || newCardIndex === -1) return prev;
                
                const reorderedCards = arrayMove(sourceList.cards, oldCardIndex, newCardIndex);
                axios.put(`/api/lists/${sourceListId}/reorder-cards`, { boardId, orderedCardIds: reorderedCards.map(c => c._id) });
                
                return {...prev, lists: prev.lists.map(l => l._id === sourceListId ? {...l, cards: reorderedCards} : l)};
            } 
            
            else {
                const movedCard = active.data.current.card;
                axios.put(`/api/cards/${active.id}/move`, { boardId, sourceListId, destListId });

                const newLists = prev.lists.map(list => {
                    if (list._id === sourceListId) {
                        return { ...list, cards: (list.cards || []).filter(c => c._id !== active.id) };
                    }
                    if (list._id === destListId) {
                        const overCardIndex = (list.cards || []).findIndex(c => c._id === over.id);
                        const insertIndex = overCardIndex !== -1 ? overCardIndex : (list.cards || []).length;
                        
                        const newCards = [...(list.cards || [])];
                        newCards.splice(insertIndex, 0, { ...movedCard, list: destListId });
                        return { ...list, cards: newCards };
                    }
                    return list;
                });
                return { ...prev, lists: newLists };
            }
        });
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <>
      <CardDetailsModal 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
        card={selectedCard}
        onUpdateCard={handleUpdateCard}
        boardId={boardId}
      />
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="relative flex flex-col h-screen bg-darker-bg text-white p-4 overflow-hidden">
          <AnimatedBlobs />
          <motion.header className="mb-4 sticky top-0 z-10 bg-gray-700 backdrop-blur-sm rounded-2xl p-3">
            <nav className="flex justify-left gap-2 items-center">
              <Link to="/boards" className="flex items-center gap-2 bg-black text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition">
                <FiHome /><span className="hidden sm:inline">Boards</span>
              </Link>
              <h1 className="text-xl font-bold">{board?.title}</h1>
            </nav>
          </motion.header>

          <main className="flex-1 overflow-x-auto">
            <SortableContext items={board ? board.lists.map(l => l._id) : []} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-4 items-start">
                {board && board.lists.map((list, i) => (
                  <SortableList
                    key={list._id}
                    list={list}
                    color={listColors[i % listColors.length]}
                    onUpdateListTitle={handleUpdateListTitle}
                    onDeleteList={handleDeleteList}
                  >
                    <SortableContext items={(list.cards || []).map(c => c._id)} strategy={verticalListSortingStrategy}>
                      {(list.cards || []).map(card => (
                        <SortableCard key={card._id} card={card} onDeleteCard={handleDeleteCard} onCardClick={setSelectedCard} />
                      ))}
                    </SortableContext>
                    <AddCardForm listId={list._id} />
                  </SortableList>
                ))}
                <AddListForm boardId={boardId} />
              </div>
            </SortableContext>
          </main>
        </div>
      </DndContext>
    </>
  );
};

export default BoardView;
