import React from "react";
import { BrowserRoutes, Route, Routes } from "react-router-dom";

const LandingPage = () => <h1 className="text-white text-3xl">Landing Page</h1>;
const BoardsDashboard = () => (
  <h1 className="text-white text-3xl">Boards Dashboard</h1>
);
const BoardView = () => (
  <h1 className="text-white text-3xl">Single Board View</h1>
);
const LoginPage = () => <h1 className="text-white text-3xl">Login Page</h1>;

const App = () => {
  <div className="bg-[#2E3944] min-h-screen">
    <BrowserRoutes>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/boards" element={<BoardsDashboard />}></Route>
        <Route path="/boards/id:" element={<BoardView />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRoutes>
  </div>;
};

export default App;
