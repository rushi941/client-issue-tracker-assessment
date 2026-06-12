import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { getHomePathForRole, LOGIN_PATH } from "@/lib/auth-routes";
import { Loader } from "@/components/ui/loader";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader className="min-h-screen" label="Loading..." />;
  }

  if (!user) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
