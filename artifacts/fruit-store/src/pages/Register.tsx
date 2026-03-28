import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegisterUser();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerMutation.mutateAsync({ data: { name, email, password } });
      login(res.token, res.user);
      toast({ title: "Регистрация успешна", description: "Добро пожаловать в Фруктовый Магазин!" });
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Ошибка", 
        description: err instanceof Error ? err.message : "Ошибка при регистрации" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-border/50 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">Создать аккаунт</h1>
        <p className="text-center text-muted-foreground mb-8">Присоединяйтесь к любителям свежих фруктов</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input 
              id="name" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 h-12 rounded-xl"
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 h-12 rounded-xl"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль (мин. 6 символов)</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 h-12 rounded-xl"
              placeholder="••••••••"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-md"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт? <Link href="/login" className="text-primary font-semibold hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
}
