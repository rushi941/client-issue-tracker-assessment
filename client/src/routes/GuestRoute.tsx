import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePreventAuthBackNavigation } from "@/hooks/usePreventAuthBackNavigation";
import { getHomePathForRole } from "@/lib/auth-routes";
import { Loader } from "@/components/ui/loader";

export function GuestRoute() {
  const { user, loading } = useAuth();

  usePreventAuthBackNavigation(!loading && !user);

  if (loading) {
    return <Loader className="min-h-screen" label="Loading..." />;
  }

  if (user) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
