import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";

const BoardsDashboard = () => (
  <h1 className="text-white text-3xl">Boards Dashboard</h1>
);
const BoardView = () => (
  <h1 className="text-white text-3xl">Single Board View</h1>
);
const LoginPage = () => <h1 className="text-white text-3xl">Login Page</h1>;

function App() {
  return (
    <AuthProvider>
      <div className="bg-[#2E3944] min-h-screen font-sans text-white">
        <BrowserRouter>
          <Routes>
            {/* This now points to our full LandingPage.jsx component */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/boards" element={<BoardsDashboard />} />
            <Route path="/board/:id" element={<BoardView />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
