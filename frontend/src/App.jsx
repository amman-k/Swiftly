import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import BoardsDashboard from "./pages/BoardsDashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import BoardView from './pages/BoardView';
import {Toaster} from 'react-hot-toast';

const LoginPage = () => <h1 className="text-white text-3xl">Login Page</h1>;

function App() {
  return (
    <AuthProvider>
      <Toaster/>
      <div className="bg-[#2E3944] min-h-screen font-sans text-white">
        <BrowserRouter>
          <Routes>
            {/* This now points to our full LandingPage.jsx component */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/boards" element={<ProtectedRoute><BoardsDashboard /></ProtectedRoute>} />
            <Route path="/board/:id" element={<ProtectedRoute><BoardView /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
