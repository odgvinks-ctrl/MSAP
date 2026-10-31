import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RouteProtegee({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={["super_admin", "admin_ministeriel"].includes(user.role) ? "/" : "/messages"} replace />;
  }

  return children;
}
