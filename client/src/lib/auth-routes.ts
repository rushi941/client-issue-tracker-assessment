import { Role } from "@/types";

export const LOGIN_PATH = "/login";

export function getHomePathForRole(role: Role): string {
  return role === "MANAGER" ? "/manager" : "/dashboard";
}

export function isPublicPath(pathname: string): boolean {
  return pathname === LOGIN_PATH;
}
