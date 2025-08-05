import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiHome, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Draggable Card Component ---
const Card = ({ card }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card._id,
      data: { type: "Card", card },
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white text-[#212A31] p-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-grab"
    >
      {card.title}
    </div>
  );
};

// --- Sortable & Droppable List Component ---
const SortableList = ({ list, color, children }) => {
  const { setNodeRef } = useDroppable({ id: list._id, data: { type: "List" } });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list._id, data: { type: "List" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableNodeRef}
      style={style}
      className="flex flex-col w-full md:w-72 flex-shrink-0"
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex flex-col h-full ${color}/90 hover:bg-opacity-100 rounded-lg shadow-lg transition-colors cursor-grab`}
      >
        <div ref={setNodeRef} className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Add Card/List Forms (Unchanged) ---
const AddCardForm = ({ listId, onCardCreated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      const { data: newCard } = await axios.post("/api/cards", {
        title,
        listId,
      });
      onCardCreated(newCard, listId);
      setTitle("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };
  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-300 p-2 rounded-md transition-colors"
      >
        + Add a card
      </button>
    );
  }
  return (
    <form onSubmit={handleCreateCard}>
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        className="w-full p-2 rounded-md text-[#212A31] focus:outline-none focus:ring-2 focus:ring-[#124E66] resize-none"
        autoFocus
        onBlur={() => setIsEditing(false)}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Add Card
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
  );
};
const AddListForm = ({ boardId, onListCreated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      const { data: newList } = await axios.post("/api/lists", {
        title,
        boardId,
      });
      onListCreated(newList);
      setTitle("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating list:", error);
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

// --- Main BoardView Component ---
const BoardView = () => {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listColors = ["bg-light-content", "bg-list-blue", "bg-list-green"];

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/boards/${boardId}`);
        setBoard(data);
      } catch (err) {
        setError("Could not load the board.");
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  const handleListCreated = (newList) =>
    setBoard((prev) => ({ ...prev, lists: [...prev.lists, newList] }));
  const handleCardCreated = (newCard, listId) => {
    const updatedLists = board.lists.map((list) => {
      if (list._id === listId) {
        const cards = list.cards ? [...list.cards, newCard] : [newCard];
        return { ...list, cards };
      }
      return list;
    });
    setBoard((prev) => ({ ...prev, lists: updatedLists }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // --- Handle List Reordering ---
    if (activeType === "List" && overType === "List" && active.id !== over.id) {
      setBoard((prev) => {
        const oldIndex = prev.lists.findIndex((l) => l._id === active.id);
        const newIndex = prev.lists.findIndex((l) => l._id === over.id);
        const newLists = Array.from(prev.lists);
        const [movedList] = newLists.splice(oldIndex, 1);
        newLists.splice(newIndex, 0, movedList);

        // API Call
        axios
          .put(`/api/boards/${boardId}/reorder-lists`, {
            orderedListIds: newLists.map((l) => l._id),
          })
          .catch((err) => console.error("Failed to reorder lists", err));

        return { ...prev, lists: newLists };
      });
    }

    // --- Handle Card Moving ---
    if (activeType === "Card" && overType === "List") {
      const activeCard = active.data.current.card;
      const sourceListId = activeCard.list;
      const destListId = over.id;

      if (sourceListId === destListId) return; // Handled by list-level dnd later if needed

      setBoard((prev) => {
        const sourceList = prev.lists.find((l) => l._id === sourceListId);
        const destList = prev.lists.find((l) => l._id === destListId);
        const sourceCards = sourceList.cards.filter(
          (c) => c._id !== activeCard._id
        );
        const destCards = [
          ...(destList.cards || []),
          { ...activeCard, list: destListId },
        ];

        const newLists = prev.lists.map((l) => {
          if (l._id === sourceListId) return { ...l, cards: sourceCards };
          if (l._id === destListId) return { ...l, cards: destCards };
          return l;
        });
        return { ...prev, lists: newLists };
      });

      axios
        .put(`/api/cards/${activeCard._id}/move`, {
          boardId,
          sourceListId,
          destListId,
          sourceIndex: board.lists
            .find((l) => l._id === sourceListId)
            .cards.findIndex((c) => c._id === activeCard._id),
          destIndex: (board.lists.find((l) => l._id === destListId).cards || [])
            .length,
        })
        .catch((err) => console.error("Failed to move card", err));
    }
  };

  if (loading) return <div className="p-8 text-white">Loading board...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!board) return <div className="p-8 text-white">Board not found.</div>;

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#2E3944] to-[#212A31] text-white p-4">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="mb-4 flex-shrink-0 sticky top-0 z-10 p-2 -mx-2 rounded-lg bg-darker-bg/50 backdrop-blur-sm"
        >
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/boards"
                className="flex items-center gap-2 text-gray-300 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-40 p-2 rounded-md transition-colors"
              >
                <FiHome />
                <span className="hidden sm:inline">Back to Boards</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">{board.title}</h1>
            </div>
          </nav>
        </motion.header>

        <main className="flex-1 overflow-y-auto md:overflow-x-auto pb-4">
          <SortableContext
            items={board.lists.map((l) => l._id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="md:inline-flex md:h-full items-start gap-4 space-y-4 md:space-y-0">
              {board.lists.map((list, index) => (
                <SortableList
                  key={list._id}
                  list={list}
                  color={listColors[index % listColors.length]}
                >
                  <h2 className="font-bold text-[#212A31] p-3 border-b border-gray-500/50">
                    {list.title}
                  </h2>
                  <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                    {list.cards &&
                      list.cards.map((card) => (
                        <Card key={card._id} card={card} />
                      ))}
                    <AddCardForm
                      listId={list._id}
                      onCardCreated={handleCardCreated}
                    />
                  </div>
                </SortableList>
              ))}
              <AddListForm
                boardId={boardId}
                onListCreated={handleListCreated}
              />
            </div>
          </SortableContext>
        </main>
      </div>
    </DndContext>
  );
};

export default BoardView;
