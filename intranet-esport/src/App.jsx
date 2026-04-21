import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Equipe from "./pages/Equipe";
import Scouting from "./pages/Scouting";

// import Planning from "./pages/Planning";
// import Documents from "./pages/Documents";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>

      {/* NAVBAR */}
      <Navbar />

      {/* POPUP LOGIN */}
      <LoginModal />

      {/* ROUTES */}
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* PRIVÉ */}
        <Route
          path="/equipe"
          element={
            <ProtectedRoute>
              <Equipe />
            </ProtectedRoute>
          }
        />

        {/* PRIVÉ + ROLE */}
        <Route
          path="/scouting"
          element={
            <ProtectedRoute>
              <Scouting />
            </ProtectedRoute>
          }
        />

        {/*
        <Route
          path="/planning"
          element={
            <ProtectedRoute>
              <Planning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        */}

      </Routes>

      {/* FOOTER */}
      <Footer />

    </BrowserRouter>
  );
}

export default App;