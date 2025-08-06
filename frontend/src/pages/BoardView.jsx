import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiX, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
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
const SortableList = ({ list, color, children, onUpdateListTitle }) => {
  const { setNodeRef } = useDroppable({ id: list._id, data: { type: 'List', list } });
  const { attributes, listeners, setNodeRef: setSortableNodeRef, transform, transition, isDragging } = useSortable({ id: list._id, data: { type: 'List' } });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== list.title) {
      onUpdateListTitle(list._id, title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div ref={setSortableNodeRef} style={style} className="flex flex-col w-full md:w-72 flex-shrink-0">
      <div className={`flex flex-col h-full ${color}/90 rounded-lg shadow-lg`}>
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="font-bold text-[#212A31] p-3 bg-white border-2 border-[#124E66] rounded-t-lg focus:outline-none"
            autoFocus
          />
        ) : (
          <div {...attributes} {...listeners} className="flex items-center justify-between p-3 border-b border-gray-500/50 cursor-grab">
            <h2 className="font-bold text-[#212A31]">{list.title}</h2>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag from starting when clicking edit
                setIsEditingTitle(true);
              }} 
              className="text-gray-600 hover:text-black p-1 rounded hover:bg-gray-400/50"
            >
              <FiEdit2 size={16} />
            </button>
          </div>
        )}
        <div ref={setNodeRef} className="flex-grow p-3 space-y-3 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};


// --- Add Card/List Forms ---
const AddCardForm = ({ listId, onCardCreated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const handleCreateCard = async (e) => { e.preventDefault(); if (!title.trim()) { setIsEditing(false); return; } try { const { data: newCard } = await axios.post('/api/cards', { title, listId }); onCardCreated(newCard, listId); setTitle(''); setIsEditing(false); } catch (error) { console.error('Error creating card:', error); } };
  
  if (!isEditing) { return (<button onClick={() => setIsEditing(true)} className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-300 p-2 rounded-md transition-colors">+ Add a card</button>); }
  
  return (<form onSubmit={handleCreateCard}><textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for this card..." className="w-full p-2 rounded-md text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66] resize-none" autoFocus /><div className="mt-2 flex items-center gap-2"><button type="submit" className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Card</button><button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button></div></form>);
};
const AddListForm = ({ boardId, onListCreated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim() || !boardId) {
      setIsEditing(false);
      return;
    }
    try {
      const { data: newList } = await axios.post('/api/lists', { title, boardId });
      onListCreated(newList);
      setTitle('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
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
    const fetchBoard = async () => { try { setLoading(true); const { data } = await axios.get(`/api/boards/${boardId}`); setBoard(data); } catch (err) { setError('Could not load the board.'); } finally { setLoading(false); } };
    fetchBoard();
  }, [boardId]);

  useEffect(() => {
    const socket = io('/');
    socket.emit('joinBoard', boardId);
    socket.on('listCreated', (newList) => setBoard(prev => prev ? { ...prev, lists: [...prev.lists, newList] } : null));
    socket.on('cardCreated', ({ newCard, listId }) => {
      setBoard(prev => {
        if (!prev) return null;
        const newLists = prev.lists.map(list => {
          if (list._id === listId) { return { ...list, cards: [...(list.cards || []), newCard] }; }
          return list;
        });
        return { ...prev, lists: newLists };
      });
    });
    socket.on('listsReordered', ({ orderedListIds }) => {
        setBoard(prev => {
            if (!prev) return null;
            const listMap = new Map(prev.lists.map(list => [list._id, list]));
            const newLists = orderedListIds.map(id => listMap.get(id));
            return { ...prev, lists: newLists };
        });
    });
    socket.on('cardsReordered', ({ listId, orderedCardIds }) => {
        setBoard(prev => {
            if (!prev) return null;
            const newLists = prev.lists.map(list => {
                if (list._id === listId) {
                    const cardMap = new Map(list.cards.map(c => [c._id, c]));
                    const reorderedCards = orderedCardIds.map(id => cardMap.get(id));
                    return { ...list, cards: reorderedCards };
                }
                return list;
            });
            return { ...prev, lists: newLists };
        });
    });
    socket.on('listUpdated', ({ listId, newTitle }) => {
        setBoard(prev => {
            if (!prev) return null;
            const newLists = prev.lists.map(list => {
                if (list._id === listId) {
                    return { ...list, title: newTitle };
                }
                return list;
            });
            return { ...prev, lists: newLists };
        });
    });
    return () => {
      socket.emit('leaveBoard', boardId);
      socket.disconnect();
    };
  }, [boardId]);

  const handleListCreated = (newList) => setBoard(prev => ({ ...prev, lists: [...prev.lists, newList] }));
  const handleCardCreated = (newCard, listId) => {
    const updatedLists = board.lists.map(list => {
      if (list._id === listId) {
        const cards = list.cards ? [...list.cards, newCard] : [newCard];
        return { ...list, cards };
      }
      return list;
    });
    setBoard(prev => ({ ...prev, lists: updatedLists }));
  };

  const handleUpdateListTitle = (listId, newTitle) => {
    setBoard(prev => {
        if (!prev) return null;
        const newLists = prev.lists.map(list => {
            if (list._id === listId) {
                return { ...list, title: newTitle };
            }
            return list;
        });
        return { ...prev, lists: newLists };
    });
    axios.put(`/api/lists/${listId}`, { title: newTitle, boardId }).catch(err => console.error("Failed to update list title", err));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Guard clause: do nothing if an item is dropped in a non-droppable area
    if (!over) {
      return;
    }

    // Deconstruct active and over data for easier access
    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type;
    
    // Prevent action if dropping on the same item
    if (activeId === overId) {
        return;
    }

    // --- 1. Handle LIST Reordering ---
    const isListDrag = activeType === 'List';
    if (isListDrag) {
      setBoard(prev => {
        if (!prev) return null;
        
        const oldIndex = prev.lists.findIndex(l => l._id === activeId);
        const newIndex = prev.lists.findIndex(l => l._id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return prev;
        
        const newLists = arrayMove(prev.lists, oldIndex, newIndex);

        // Optimistic UI update
        axios.put(`/api/boards/${boardId}/reorder-lists`, { orderedListIds: newLists.map(l => l._id) })
             .catch(err => {
                console.error("Failed to reorder lists", err);
                // Optionally revert state on error
             });

        return { ...prev, lists: newLists };
      });
      return; // End execution for list drag
    }


    // --- 2. Handle CARD Reordering & Moving ---
    const isCardDrag = activeType === 'Card';
    if (isCardDrag) {
      setBoard(prev => {
        if (!prev) return prev;

        // Find the source list and the active card
        const sourceListId = active.data.current.card.list;
        const sourceList = prev.lists.find(l => l._id === sourceListId);
        const sourceCardIndex = sourceList?.cards.findIndex(c => c._id === activeId);

        if (sourceList === undefined || sourceCardIndex === -1) {
            console.error("Source list or card not found!");
            return prev;
        }

        // Find the destination list
        const overData = over.data.current;
        const destListId = overData.type === 'Card' ? overData.card.list : over.id;
        const destList = prev.lists.find(l => l._id === destListId);

        if (destList === undefined) {
            console.error("Destination list not found!");
            return prev;
        }

        // Create a deep copy to avoid direct state mutation issues
        const newLists = JSON.parse(JSON.stringify(prev.lists));
        const sourceListInNew = newLists.find(l => l._id === sourceListId);
        const destListInNew = newLists.find(l => l._id === destListId);

        // A. SAME LIST REORDERING
        if (sourceListId === destListId) {
            const listToReorder = sourceListInNew;
            
            // Determine the target index for the card
            const overCardIndex = listToReorder.cards.findIndex(c => c._id === overId);
            if (overCardIndex === -1) {
                 console.error("Target card not found in the same list!");
                 return prev;
            }

            // Use arrayMove for simplicity and correctness
            const reorderedCards = arrayMove(listToReorder.cards, sourceCardIndex, overCardIndex);
            listToReorder.cards = reorderedCards;

            // Optimistic UI update & API call
            axios.put(`/api/lists/${sourceListId}/reorder-cards`, {
                orderedCardIds: reorderedCards.map(c => c._id),
                boardId
            }).catch(err => console.error("Failed to reorder cards", err));

        // B. CROSS-LIST MOVING
        } else {
            // Remove card from the source list
            const [movedCard] = sourceListInNew.cards.splice(sourceCardIndex, 1);
            
            // Update the card's own list property
            movedCard.list = destListId;

            // Determine insert position in destination list
            // Can be dropped on a card or on the list container itself
            const overCardIndex = destListInNew.cards.findIndex(c => c._id === overId);
            const newCardIndex = overCardIndex !== -1 ? overCardIndex : destListInNew.cards.length;
            
            // Add card to the destination list
            destListInNew.cards.splice(newCardIndex, 0, movedCard);

             // Optimistic UI update & API call
            axios.put(`/api/cards/${activeId}/move`, {
                boardId,
                sourceListId,
                destListId,
                // Your backend might need the new arrays for its own reordering
                // sourceCardIds: sourceListInNew.cards.map(c => c._id),
                // destCardIds: destListInNew.cards.map(c => c._id)
            }).catch(err => console.error("Failed to move card", err));
        }

        return { ...prev, lists: newLists };
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
              <h1 className="text-xl sm:text-2xl font-bold">{board.title}</h1>
            </div>
          </nav>
        </motion.header>

        <main className="flex-1 overflow-y-auto md:overflow-x-auto pb-4">
          <SortableContext items={board.lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
            <div className="md:inline-flex md:h-full items-start gap-4 space-y-4 md:space-y-0">
              {board.lists.map((list, index) => (
                <SortableList 
                  key={list._id} 
                  list={list} 
                  color={listColors[index % listColors.length]}
                  onUpdateListTitle={handleUpdateListTitle}
                >
                  <SortableContext items={(list.cards || []).map(c => c._id)} strategy={verticalListSortingStrategy}>
                    {(list.cards || []).map(card => <SortableCard key={card._id} card={card} />)}
                  </SortableContext>
                  <AddCardForm listId={list._id} onCardCreated={handleCardCreated} />
                </SortableList>
              ))}
              <AddListForm boardId={boardId} onListCreated={handleListCreated} />
            </div>
          </SortableContext>
        </main>
      </div>
    </DndContext>
  );
};

export default BoardView;
