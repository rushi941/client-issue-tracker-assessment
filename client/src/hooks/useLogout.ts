import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/lib/auth-routes";

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await logout();
    queryClient.clear();
    navigate(LOGIN_PATH, { replace: true });
  }, [logout, navigate, queryClient]);
}
