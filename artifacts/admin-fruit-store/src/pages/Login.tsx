import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store, Lock } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("admin@fruitstore.ru");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginUser();

  useEffect(() => {
    if (user?.role === "ADMIN") setLocation("/products");
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({
        data: { email, password },
      });
      if (result.user.role !== "ADMIN") {
        toast({ variant: "destructive", title: "Доступ запрещён", description: "Только для администраторов" });
        return;
      }
      login(result.token, result.user);
      setLocation("/products");
    } catch {
      toast({ variant: "destructive", title: "Ошибка входа", description: "Неверный email или пароль" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Store className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Фруктовый Магазин · Администратор</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fruitstore.ru"
                required
                className="h-11"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block text-sm">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Вход...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Войти
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Аккаунт: admin@fruitstore.ru / admin123
        </p>
      </div>
    </div>
  );
}
