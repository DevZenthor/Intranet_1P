import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ROUTES = {
  "/equipe":       ["admin", "CEO", "Director", "Manager", "Coach"],
  "/annonces":     ["admin", "CEO", "Director", "Manager", "Coach"],
  "/scouting":     ["admin", "CEO", "Director"],
  "/performances": ["admin", "CEO", "Director", "Coach"],
  "/joueurs":      ["admin", "CEO", "Director", "Coach"],
  "/documents":    ["admin", "CEO", "Director"],
  "/compta":       ["admin", "CEO", "Director"],
  "/creators":     ["admin", "CEO", "Director", "Manager"],
  "/videos":       ["admin", "CEO", "Director", "Manager"],
};

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const path = window.location.pathname;
  const allowedRoles = ROLE_ROUTES[path];

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;