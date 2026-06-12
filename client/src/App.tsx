import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { GuestRoute } from "./routes/GuestRoute";
import { AuthSessionBridge } from "./routes/AuthSessionBridge";
import { getHomePathForRole, LOGIN_PATH } from "./lib/auth-routes";
import { Loader } from "@/components/ui/loader";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/client/DashboardPage";
import { IssuesPage } from "./pages/client/IssuesPage";
import { NewIssuePage } from "./pages/client/NewIssuePage";
import { IssueDetailPage } from "./pages/client/IssueDetailPage";
import { ManagerAnalyticsPage } from "./pages/manager/ManagerAnalyticsPage";
import { ManagerIssuesPage } from "./pages/manager/ManagerIssuesPage";
import { ManagerIssueDetailPage } from "./pages/manager/ManagerIssueDetailPage";
import { Toaster } from "@/components/ui/sonner";
import { toastError, toastSuccess } from "@/lib/toast";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent) return;
      toastError(error, "Action failed");
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.successMessage;
      if (typeof message === "string") toastSuccess(message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader className="min-h-screen" label="Loading..." />;
  if (!user) return <Navigate to={LOGIN_PATH} replace />;
  return <Navigate to={getHomePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthSessionBridge />
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path={LOGIN_PATH} element={<LoginPage />} />
            </Route>

            <Route path="/" element={<HomeRedirect />} />

            <Route element={<ProtectedRoute roles={["CLIENT"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/new" element={<NewIssuePage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["MANAGER"]} />}>
              <Route path="/manager" element={<ManagerAnalyticsPage />} />
              <Route path="/manager/issues" element={<ManagerIssuesPage />} />
              <Route path="/manager/issues/:id" element={<ManagerIssueDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
