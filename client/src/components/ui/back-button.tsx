import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackTo: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackTo, label = "Back", className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className ?? "-ml-2 h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"}
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function useGoBack(fallbackTo: string) {
  const navigate = useNavigate();

  return () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };
}
