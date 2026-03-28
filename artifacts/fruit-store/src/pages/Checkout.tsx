import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { authHeaders } from "@/lib/auth-helpers";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const createOrderMutation = useCreateOrder({
    request: { headers: authHeaders() }
  });

  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!user) {
      toast({ title: "Необходима авторизация", description: "Пожалуйста, войдите в аккаунт для оформления заказа." });
      setLocation("/login?redirect=/checkout");
    } else if (items.length === 0) {
      setLocation("/cart");
    }
  }, [user, items, setLocation, toast]);

  if (!user || items.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price);
  };

  const deliveryCost = totalPrice > 3000 ? 0 : 350;
  const finalTotal = totalPrice + deliveryCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast({ variant: "destructive", title: "Ошибка", description: "Введите адрес доставки" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        address,
        items: items.map(item => ({
          fruitId: item.fruitId,
          quantity: item.quantity,
          weight: item.weight
        }))
      };

      await createOrderMutation.mutateAsync({ data: orderData });
      
      clearCart();
      setLocation("/order-success");
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка оформления", description: "Что-то пошло не так. Попробуйте позже." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/cart" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться в корзину
        </Link>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <MapPin className="text-primary w-5 h-5" /> Адрес доставки
              </h2>
              <form onSubmit={handleSubmit} id="checkout-form">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">Получатель</Label>
                    <Input id="name" value={user.name} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label htmlFor="address" className="mb-2 block">Полный адрес</Label>
                    <Input 
                      id="address" 
                      placeholder="г. Москва, ул. Примерная, д. 1, кв. 1" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm opacity-70">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <CreditCard className="text-muted-foreground w-5 h-5" /> Способ оплаты
              </h2>
              <p className="text-muted-foreground">В данный момент доступна только оплата картой курьеру при получении.</p>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-lg sticky top-32">
              <h3 className="font-display font-bold text-lg mb-4">Ваш заказ</h3>
              
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={`${item.fruitId}-${item.weight}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium shrink-0">{formatPrice(item.unitPrice * item.weightMultiplier * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Товары</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Доставка</span>
                  <span>{deliveryCost === 0 ? "Бесплатно" : formatPrice(deliveryCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-foreground mt-4 pt-4 border-t border-border/50">
                  <span>Итого:</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isSubmitting ? "Обработка..." : "Подтвердить заказ"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
