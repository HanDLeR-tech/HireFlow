import { Routes, Route, Navigate } from "react-router";
import "./App.css";
import useAuth from "./hooks/useAuth.js";

import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage.jsx";
import ProblemsPage from "./pages/ProblemsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SessionPage from "./pages/SessionPage.jsx";
import ProblemPage from "./pages/ProblemPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <HomePage /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />} />

        <Route path="/problems" element={isAuthenticated ? <ProblemsPage /> : <Navigate to="/" />} />

        <Route path="/problem/:id" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/" />} />

        <Route path="/session/:id" element={isAuthenticated ? <SessionPage /> : <Navigate to="/" />} />
        
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />

        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
