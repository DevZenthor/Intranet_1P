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
import Creators from "./pages/Creators";
import Videos from "./pages/Videos";
import Annonces from "./pages/Annonces";
import Compta from "./pages/Compta";
import Profil from "./pages/Profil";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Planning from "./pages/Planning";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        {/* PRIVÉ */}
        <Route path="/equipe" element={
          <ProtectedRoute><Equipe /></ProtectedRoute>
        } />

        <Route path="/scouting" element={
          <ProtectedRoute><Scouting /></ProtectedRoute>
        } />

        <Route path="/documents" element={
          <ProtectedRoute><Documents /></ProtectedRoute>
        } />

        <Route path="/joueurs" element={
          <ProtectedRoute><Joueurs /></ProtectedRoute>
        } />

        <Route path="/performances" element={
          <ProtectedRoute><Performances /></ProtectedRoute>
        } />

        <Route path="/creators" element={
          <ProtectedRoute><Creators /></ProtectedRoute>
        } />

        <Route path="/videos" element={
          <ProtectedRoute><Videos /></ProtectedRoute>
        } />

        <Route path="/annonces" element={
          <ProtectedRoute><Annonces /></ProtectedRoute>
        } />

        <Route path="/compta" element={
          <ProtectedRoute><Compta /></ProtectedRoute>
        } />

        <Route path="/profil" element={
          <ProtectedRoute><Profil /></ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/planning" element={
          <ProtectedRoute><Planning /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;