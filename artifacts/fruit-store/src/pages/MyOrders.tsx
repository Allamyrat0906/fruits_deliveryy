import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMyOrders } from "@workspace/api-client-react";
import { useAuth, authHeaders } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";

export default function MyOrders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  const { data: orders, isLoading } = useGetMyOrders({
    request: { headers: authHeaders() }
  });

  if (!user) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ОЖИДАНИЕ": return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20";
      case "ПОДТВЕРЖДЁН": return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20";
      case "ОТПРАВЛЕН": return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20";
      case "ДОСТАВЛЕН": return "bg-success/10 text-success hover:bg-success/20 border-success/20";
      case "ОТМЕНЁН": return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Мои заказы</h1>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 text-center border border-border/50">
            <PackageOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">У вас пока нет заказов</h3>
            <p className="text-muted-foreground mb-6">Сделайте свой первый заказ в нашем каталоге.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-border/50">
                  <div>
                    <h3 className="font-bold text-lg">Заказ #{order.id}</h3>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(order.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <span className="font-bold text-xl">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Состав заказа:</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.fruitName}</span>
                        <span className="text-muted-foreground">({item.weight}) x{item.quantity}</span>
                      </div>
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Адрес доставки:</span> {order.address}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
