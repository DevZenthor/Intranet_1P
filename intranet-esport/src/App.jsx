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
import Scouting from "./pages/Scouting";
import Documents from "./pages/Documents";
import Joueurs from "./pages/Joueurs";
import Performances from "./pages/Performances";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

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

        <Route
          path="/scouting"
          element={
            <ProtectedRoute>
              <Scouting />
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
          path="/joueurs"
          element={
            <ProtectedRoute>
              <Joueurs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/performances"
          element={
            <ProtectedRoute>
              <Performances />
            </ProtectedRoute>
          }
        />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;