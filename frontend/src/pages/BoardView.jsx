import React from 'react'
import { useParams, Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const BoardView = () => {
    const {id}=useParams();
    return (
    <div className="p-8">
      <nav className="mb-6">
        <Link to="/boards" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
          <FiHome />
          <span>Back to Boards</span>
        </Link>
      </nav>
      <h1 className="text-3xl font-bold text-white">Board View</h1>
      <p className="text-gray-400 mt-2">
        You are viewing the board with ID: <span className="font-mono text-lg text-white">{id}</span>
      </p>

      {/* The lists and cards for this board will be rendered here in the future. */}
    </div>
  );
}

export default BoardView