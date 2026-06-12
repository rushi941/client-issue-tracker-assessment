export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type UnauthorizedHandler = (() => void | Promise<void>) | null;

let unauthorizedHandler: UnauthorizedHandler = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const isAuthEndpoint =
      path.includes("/auth/login") ||
      path.includes("/auth/me") ||
      path.includes("/auth/logout");

    if (res.status === 401 && unauthorizedHandler && !isAuthEndpoint) {
      await unauthorizedHandler();
    }
    throw new ApiError(res.status, json.error ?? "Request failed");
  }

  return json.data as T;
}
