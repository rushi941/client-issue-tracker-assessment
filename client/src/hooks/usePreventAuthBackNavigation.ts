import { useEffect } from "react";

/** Keeps unauthenticated users on the login screen after sign-out (blocks browser Back). */
export function usePreventAuthBackNavigation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const trapBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    trapBackNavigation();
    window.addEventListener("popstate", trapBackNavigation);

    return () => {
      window.removeEventListener("popstate", trapBackNavigation);
    };
  }, [enabled]);
}
