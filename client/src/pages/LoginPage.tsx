import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, UserCog } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getHomePathForRole } from "@/lib/auth-routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  {
    role: "Client",
    email: "client@demo.com",
    password: "demo123",
    icon: User,
  },
  {
    role: "Manager",
    email: "manager@demo.com",
    password: "demo123",
    icon: UserCog,
  },
] as const;

function DemoCredentialButton({
  role,
  email,
  password,
  icon: Icon,
  onSelect,
  className,
}: {
  role: string;
  email: string;
  password: string;
  icon: typeof User;
  onSelect: (email: string, password: string, role: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(email, password, role)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition-all",
        "hover:border-accent/40 hover:bg-white/10 hover:shadow-lg hover:shadow-accent/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 transition-colors group-hover:bg-accent/20">
        <Icon className="h-4 w-4 text-accent" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-primary-foreground">{role} demo</span>
        <span className="mt-0.5 block text-xs text-primary-foreground/70">
          {email} · {password}
        </span>
        <span className="mt-1 block text-[10px] uppercase tracking-wide text-accent opacity-0 transition-opacity group-hover:opacity-100">
          Click to autofill
        </span>
      </span>
    </button>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fillDemo = (email: string, password: string, role: string) => {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    toastSuccess(`${role} credentials filled`, "Click Sign in to continue");
  };

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data.email, data.password);
      toastSuccess("Signed in successfully", `Welcome back, ${user.name}`);
      navigate(getHomePathForRole(user.role), { replace: true });
    } catch (e) {
      toastError(e, "Sign in failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="login-glow pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="login-glow pointer-events-none absolute bottom-1/4 right-0 h-56 w-56 rounded-full bg-secondary/25 blur-3xl" />

        <div className="relative z-10">
          <div className="login-slide-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-primary-foreground/80">
            <Sparkles className="login-float h-3.5 w-3.5 text-accent" />
            Pixel Future SaaS
          </div>

          <h1 className="login-slide-in login-slide-in-delay-1 text-4xl font-bold leading-tight">
            Client Issue Tracker
          </h1>
          <p className="login-slide-in login-slide-in-delay-2 mt-4 max-w-md text-lg text-primary-foreground/80">
            Monitor websites, report issues, and track resolution — built for modern support teams.
          </p>

          <div className="login-slide-in login-slide-in-delay-3 mt-10 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/50">
              Demo accounts — click to autofill
            </p>
            {DEMO_ACCOUNTS.map((account) => (
              <DemoCredentialButton
                key={account.email}
                {...account}
                onSelect={fillDemo}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 space-y-2 border-t pt-6 lg:hidden">
              <p className="text-xs font-medium text-muted-foreground">Quick demo login</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 text-xs"
                    onClick={() => fillDemo(account.email, account.password, account.role)}
                  >
                    {account.role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
