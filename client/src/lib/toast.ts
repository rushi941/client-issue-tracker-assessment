import { toast } from "sonner";
import { ApiError } from "../api/client";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function toastError(error: unknown, title = "Error") {
  toast.error(title, { id: "app-error", description: getErrorMessage(error) });
}

export function toastSuccess(message: string, description?: string) {
  toast.success(message, description ? { description } : undefined);
}
