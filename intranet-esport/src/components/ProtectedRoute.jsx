import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ROUTES = {
  "/scouting":     ["admin", "CEO", "Director"],
  "/performances": ["admin", "CEO", "Director"],
  "/joueurs":      ["admin", "CEO", "Director"],
  "/documents":    ["admin", "CEO", "Director"],
  "/equipe":       ["admin", "CEO", "Director", "Manager"],
};

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Pas connecté → home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Rôle insuffisant → home
  const path = window.location.pathname;
  const allowedRoles = ROLE_ROUTES[path];

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;