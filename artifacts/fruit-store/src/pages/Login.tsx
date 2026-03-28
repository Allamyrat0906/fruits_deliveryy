import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLoginUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Shield, User as UserIcon } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { User } from "@workspace/api-client-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function GoogleSignInButton() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const { credential } = credentialResponse;
    if (!credential) return;
    try {
      const res = await fetch("/api/auth/google/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) {
        const data = await res.json() as { message?: string };
        throw new Error(data.message || "Google вход не удался");
      }
      const data = await res.json() as { token: string; user: User };
      login(data.token, data.user);
      const searchParams = new URLSearchParams(window.location.search);
      setLocation(searchParams.get("redirect") || "/");
      toast({ title: "Успешный вход через Google" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ошибка Google входа",
        description: err instanceof Error ? err.message : "Попробуйте войти через email",
      });
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        toast({ variant: "destructive", title: "Ошибка Google входа", description: "Попробуйте другой способ" });
      }}
      useOneTap={false}
      width="100%"
      text="signin_with"
      shape="rectangular"
      locale="ru"
    />
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser();

  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(window.location.search);
      setLocation(searchParams.get("redirect") || "/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ data: { email, password } });
      login(res.token, res.user);
      toast({ title: "Успешный вход", description: `С возвращением, ${res.user.name}!` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: err instanceof Error ? err.message : "Неверный email или пароль",
      });
    }
  };

  const fillAdmin = () => {
    setEmail("admin@fruitstore.ru");
    setPassword("admin123");
  };

  const fillCustomer = () => {
    setEmail("ivan@example.ru");
    setPassword("customer123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-24">
      <div className="w-full max-w-md space-y-4">
        {/* Test accounts hint */}
        <div className="bg-muted/60 border border-border rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Тестовые аккаунты</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={fillAdmin}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors text-left"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">Администратор</p>
                <p className="text-[10px] text-primary/70">admin@fruitstore.ru</p>
              </div>
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border rounded-xl px-3 py-2.5 text-xs font-medium transition-colors text-left"
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">Покупатель</p>
                <p className="text-[10px] text-muted-foreground">ivan@example.ru</p>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl">
              <Leaf className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">С возвращением</h1>
          <p className="text-center text-muted-foreground mb-8">Войдите в свой аккаунт для покупок</p>

          {GOOGLE_CLIENT_ID && (
            <div className="mb-6">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleSignInButton />
              </GoogleOAuthProvider>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">или</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12 rounded-xl"
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12 rounded-xl"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-md"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Зарегистрируйтесь
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
