import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [, setLocation] = useLocation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const deliveryCost = totalPrice > 3000 ? 0 : 350;
  const finalTotal = totalPrice + deliveryCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center bg-background">
        <img 
          src={`${import.meta.env.BASE_URL}images/empty-cart.png`} 
          alt="Пустая корзина" 
          className="w-64 h-64 object-contain mb-8 opacity-80"
        />
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Ваша корзина пуста</h1>
        <p className="text-muted-foreground mb-8 text-lg">Похоже, вы еще ничего не добавили.</p>
        <Link href="/shop">
          <Button size="lg" className="rounded-xl px-8 h-14 text-lg">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          Корзина
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div 
                key={`${item.fruitId}-${item.weight}`} 
                className="bg-card p-4 sm:p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary/10" />
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <Link href={`/product/${item.slug}`} className="font-display font-semibold text-lg hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1">Вес: {item.weight}</p>
                  <div className="text-primary font-bold mt-2 sm:hidden">
                    {formatPrice(item.unitPrice * item.weightMultiplier * item.quantity)}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-background rounded-xl p-1 border border-border">
                    <button 
                      onClick={() => updateQuantity(item.fruitId, item.weight, item.quantity - 1)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.fruitId, item.weight, item.quantity + 1)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="hidden sm:block w-32 text-right font-bold text-lg">
                    {formatPrice(item.unitPrice * item.weightMultiplier * item.quantity)}
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.fruitId, item.weight)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-lg sticky top-32">
              <h2 className="font-display font-bold text-xl mb-6">Сумма заказа</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Товары ({items.length})</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Доставка</span>
                  <span>{deliveryCost === 0 ? "Бесплатно" : formatPrice(deliveryCost)}</span>
                </div>
                {totalPrice < 3000 && (
                  <p className="text-xs text-secondary mt-1">
                    Добавьте товаров на {formatPrice(3000 - totalPrice)} для бесплатной доставки
                  </p>
                )}
              </div>

              <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-end">
                <span className="font-semibold text-lg">Итого:</span>
                <span className="text-3xl font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>

              <Button 
                onClick={() => setLocation("/checkout")} 
                size="lg" 
                className="w-full h-14 rounded-xl text-lg shadow-md bg-primary hover:bg-primary/90"
              >
                Оформить заказ <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
