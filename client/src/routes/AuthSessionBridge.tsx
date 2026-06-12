import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { setUnauthorizedHandler } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/lib/auth-routes";

/** Redirects to login when the API returns 401 (expired/invalid session). */
export function AuthSessionBridge() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await refresh();
      queryClient.clear();
      navigate(LOGIN_PATH, { replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [refresh, navigate, queryClient]);

  return null;
}
