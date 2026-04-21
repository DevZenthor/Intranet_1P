import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Equipe from "./pages/Equipe";

// import Planning from "./pages/Planning";
// import Documents from "./pages/Documents";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* PAGE PUBLIQUE */}
        <Route path="/" element={<Home />} />

        {/* PAGE PRIVÉE */}
        <Route
          path="/equipe"
          element={
            <ProtectedRoute>
              <Equipe />
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

      <Footer />

    </BrowserRouter>
  );
}

export default App;