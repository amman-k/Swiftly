import React from "react";
import { useAuth } from "../context/AuthContext";
import { FiLogOut } from 'react-icons/fi';

const DashboardNavbar = ({ user }) => {
  return (
    <header className="p-4 bg-[#212A31]">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Swiftly</div>
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">{user.name}</span>
          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
          {/* --- Improved Logout Button --- */}
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

const BoardsDashboard = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  return (
    <div className="flex flex-col h-screen">
      <DashboardNavbar user={user} />
      <main className="flex-grow p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Boards</h1>

        {/* Board grid will go here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Example of a board card */}
          <div className="bg-[#D3D9D4] text-[#212A31] p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
            <h2 className="font-bold text-xl">Example Project Board</h2>
          </div>

          {/* "Create new board" button */}
          <button className="bg-[#124E66] hover:bg-opacity-80 text-white font-bold p-4 rounded-lg shadow-md transition-colors">
            + Create a new board
          </button>
        </div>
      </main>
    </div>
  );
};

export default BoardsDashboard;
