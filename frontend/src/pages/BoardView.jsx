import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import io from 'socket.io-client';

// --- Sortable & Draggable Card Component ---
const SortableCard = ({ card }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { type: 'Card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-white text-[#212A31] p-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-grab">
      {card.title}
    </div>
  );
};

// --- Sortable & Droppable List Component ---
const SortableList = ({ list, color, children, onUpdateListTitle, onDeleteList }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: list._id, 
    data: { type: 'List', list },
    disabled: isEditingTitle,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== list.title) {
      onUpdateListTitle(list._id, title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleBlur();
    else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col w-full md:w-72 flex-shrink-0">
      <div className={`flex flex-col h-full ${color}/90 rounded-lg shadow-lg`}>
        {isEditingTitle ? (
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur} onKeyDown={handleKeyDown}
            className="font-bold text-[#212A31] p-3 bg-white border-2 border-[#124E66] rounded-t-lg focus:outline-none" autoFocus
          />
        ) : (
          <div {...attributes} {...listeners} className="flex items-center justify-between p-3 border-b border-gray-500/50 cursor-grab">
            <h2 className="font-bold text-[#212A31]">{list.title}</h2>
            <button onClick={() => setIsEditingTitle(true)} className="text-gray-600 hover:text-black p-1 rounded hover:bg-gray-400/50">
              <FiEdit2 size={16} />
            </button>
          </div>
        )}
        <div className="flex-grow p-3 space-y-3 overflow-y-auto">
          {children}
        </div>
        <div className="p-2 border-t border-gray-500/20">
            <button 
                onClick={() => onDeleteList(list._id)}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600 hover:bg-gray-300 p-1 rounded-md transition-colors"
            >
                <FiTrash2 />
                Delete List
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Add Card/List Forms ---
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
    } catch (error) { console.error('Error creating card:', error); }
  };

  if (!isEditing) { return (<button onClick={() => setIsEditing(true)} className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-300 p-2 rounded-md transition-colors">+ Add a card</button>); }
  
  return (<form onSubmit={handleCreateCard}><textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for this card..." className="w-full p-2 rounded-md text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66] resize-none" autoFocus /><div className="mt-2 flex items-center gap-2"><button type="submit" className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Card</button><button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button></div></form>);
};

const AddListForm = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim() || !boardId) return setIsEditing(false);
    try {
      await axios.post('/api/lists', { title, boardId });
      setTitle('');
      setIsEditing(false);
    } catch (error) { console.error('Error creating list:', error); }
  };

  if (!isEditing) { return (<motion.button onClick={() => setIsEditing(true)} className="w-full md:w-72 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-semibold p-3 rounded-lg transition-colors flex-shrink-0">+ Add another list</motion.button>); }
  
  return (<div className="w-full md:w-72 bg-light-content/90 p-3 rounded-lg flex-shrink-0"><form onSubmit={handleCreateList}><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter list title..." className="w-full p-2 rounded-md text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66]" autoFocus /><div className="mt-2 flex items-center gap-2"><button type="submit" className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors">Add List</button><button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button></div></form></div>);
};

// --- Main BoardView Component ---
const BoardView = () => {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const listColors = ['bg-light-content', 'bg-list-blue', 'bg-list-green'];

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/boards/${boardId}`);
        setBoard(data);
      } catch (err) {
        setError('Could not load the board.');
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

    const handleStateUpdate = (updateFn) => setBoard((prev) => (prev ? updateFn(prev) : null));

    socket.on('listCreated', (newList) => handleStateUpdate(prev => ({ ...prev, lists: [...prev.lists, newList] })));
    socket.on('cardCreated', ({ newCard, listId }) => handleStateUpdate(prev => ({ ...prev, lists: prev.lists.map(list => list._id === listId ? { ...list, cards: [...(list.cards || []), newCard] } : list) })));
    socket.on('listsReordered', ({ orderedListIds }) => handleStateUpdate(prev => {
      const listMap = new Map(prev.lists.map(list => [list._id, list]));
      return { ...prev, lists: orderedListIds.map(id => listMap.get(id)).filter(Boolean) };
    }));
    socket.on('cardsReordered', ({ listId, orderedCardIds }) => handleStateUpdate(prev => {
      const allCards = prev.lists.flatMap(l => l.cards || []).filter(Boolean);
      const allCardsMap = new Map(allCards.map(c => [c._id, c]));
      return { ...prev, lists: prev.lists.map(list => list._id === listId ? { ...list, cards: orderedCardIds.map(id => allCardsMap.get(id)).filter(Boolean) } : list) };
    }));
    socket.on('listUpdated', ({ listId, newTitle }) => handleStateUpdate(prev => ({ ...prev, lists: prev.lists.map(list => (list._id === listId ? { ...list, title: newTitle } : list)) })));
    socket.on('cardDeleted', ({ cardId, listId }) => handleStateUpdate(prev => ({ ...prev, lists: prev.lists.map(list => list._id === listId ? { ...list, cards: list.cards.filter(c => c._id !== cardId) } : list) })));
    
    // --- NEW: Listen for 'listDeleted' event ---
    socket.on('listDeleted', ({ listId }) => handleStateUpdate(prev => ({
        ...prev,
        lists: prev.lists.filter(l => l._id !== listId)
    })));

    return () => {
      socket.emit('leaveBoard', boardId);
      socket.disconnect();
    };
  }, [boardId]);

  const handleUpdateListTitle = (listId, newTitle) => {
    axios.put(`/api/lists/${listId}`, { title: newTitle, boardId }).catch(err => console.error("Failed to update list title", err));
  };

  const handleDeleteCard = (cardId, listId) => {
    axios.delete(`/api/cards/${cardId}`, { params: { boardId, listId } })
         .catch(err => console.error("Failed to delete card", err));
  };

  // --- NEW: Handler for deleting a list ---
  const handleDeleteList = (listId) => {
    if (window.confirm("Are you sure you want to delete this list and all its cards?")) {
        axios.delete(`/api/lists/${listId}`, { params: { boardId } })
             .catch(err => console.error("Failed to delete list", err));
    }
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
            } else {
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

  if (loading) return <div className="p-8 text-white">Loading board...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!board) return <div className="p-8 text-white">Board not found.</div>;

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#2E3944] to-[#212A31] text-white p-4">
        <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="mb-4 flex-shrink-0 sticky top-0 z-10 p-2 -mx-2 rounded-lg bg-darker-bg/50 backdrop-blur-sm">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/boards" className="flex items-center gap-2 text-gray-300 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-40 p-2 rounded-md transition-colors"><FiHome /><span className="hidden sm:inline">Back to Boards</span></Link>
              <h1 className="text-xl sm:text-2xl font-bold">{board?.title}</h1>
            </div>
          </nav>
        </motion.header>
        <main className="flex-1 overflow-y-auto md:overflow-x-auto pb-4">
          <SortableContext items={board ? board.lists.map(l => l._id) : []} strategy={horizontalListSortingStrategy}>
            <div className="md:inline-flex md:h-full items-start gap-4 space-y-4 md:space-y-0">
              {board && board.lists.map((list, index) => (
                <SortableList 
                  key={list._id} 
                  list={list} 
                  color={listColors[index % listColors.length]} 
                  onUpdateListTitle={handleUpdateListTitle}
                  onDeleteList={handleDeleteList}
                >
                  <SortableContext items={(list.cards || []).map(c => c._id)} strategy={verticalListSortingStrategy}>
                    {(list.cards || []).map(card => <SortableCard key={card._id} card={card} onDeleteCard={handleDeleteCard} />)}
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
  );
};

export default BoardView;
