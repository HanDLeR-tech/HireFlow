import { Routes, Route, Navigate } from "react-router";
import "./App.css";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";

import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage.jsx";
import ProblemsPage from "./pages/ProblemsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SessionPage from "./pages/SessionPage.jsx";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return null; // or a loading spinner, etc.
  }

  return (
    <>
      <Routes>
        {/* <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />} /> */}
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />} /> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />} /> */}
        <Route path="/problems" element={<ProblemsPage />} />
        {/* <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />} /> */}
        <Route path="/problem/:id" element={<ProblemPage />} />
        {/* <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to="/" />} /> */}
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;

// function App() {
//   return <h1>Hello World</h1>;
// }

// export default App;
