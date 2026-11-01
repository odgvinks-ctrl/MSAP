import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RouteProtegee({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent" />
          <p className="mt-3 text-sm text-gray-500">
            Vérification de votre session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to={
          ["super_admin", "admin_ministeriel"].includes(user.role)
            ? "/"
            : "/messages"
        }
        replace
      />
    );
  }

  return children;
}
