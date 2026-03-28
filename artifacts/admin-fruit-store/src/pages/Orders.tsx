import { useState } from "react";
import { useGetAllOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import type { AdminOrder, OrderItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronDown, Phone, MapPin, Mail, Eye, Wallet, ReceiptText } from "lucide-react";

const STATUSES = ["ОЖИДАНИЕ", "ПОДТВЕРЖДЁН", "ОТПРАВЛЕН", "ДОСТАВЛЕН", "ОТМЕНЁН"] as const;
type Status = typeof STATUSES[number];

const STATUS_CONFIG: Record<Status, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  ОЖИДАНИЕ:    { label: "Ожидание",    variant: "outline",     color: "text-orange-600 border-orange-200 bg-orange-50" },
  ПОДТВЕРЖДЁН: { label: "Подтверждён", variant: "default",     color: "text-blue-600 border-blue-200 bg-blue-50" },
  ОТПРАВЛЕН:   { label: "Отправлен",   variant: "secondary",   color: "text-violet-600 border-violet-200 bg-violet-50" },
  ДОСТАВЛЕН:   { label: "Доставлен",   variant: "default",     color: "text-green-700 border-green-200 bg-green-50" },
  ОТМЕНЁН:     { label: "Отменён",     variant: "destructive", color: "text-red-600 border-red-200 bg-red-50" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

export default function Orders() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading, refetch } = useGetAllOrders({ page, limit: 20 });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, status: Status) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, data: { status } });
      toast({ title: "Статус обновлён" });
      refetch();
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось изменить статус" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заказы</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {data ? `Всего: ${data.total} заказов` : "Загрузка..."}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">№</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Клиент</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Сумма</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Заказов пока нет
                  </td>
                </tr>
              ) : (
                data?.orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as Status] || STATUS_CONFIG["ОЖИДАНИЕ"];
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v as Status)}
                        >
                          <SelectTrigger className={`h-7 text-xs w-36 border font-medium ${cfg.color}`}>
                            <SelectValue />
                            <ChevronDown className="w-3 h-3 ml-1 opacity-50 shrink-0" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {STATUS_CONFIG[s].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-sm text-muted-foreground">Страница {page} из {data.totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</Button>
              <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Вперёд</Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (() => {
            const order = selectedOrder;
            const cfg = STATUS_CONFIG[order.status as Status] || STATUS_CONFIG["ОЖИДАНИЕ"];
            const changeDue = order.paidAmount && order.paidAmount > order.totalPrice
              ? order.paidAmount - order.totalPrice
              : null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    Заказ #{order.id}
                    <Badge className={`text-xs font-medium border ${cfg.color}`} variant="outline">
                      {cfg.label}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  {/* Customer Info */}
                  <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                    <h3 className="font-semibold text-sm mb-3">Клиент</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{order.customerName}</span>
                      <span className="text-muted-foreground">({order.customerEmail})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-muted-foreground" />
                      Состав заказа
                    </h3>
                    <div className="space-y-1.5">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                          <span className="text-foreground">
                            {item.fruitName} · {item.weight} × {item.quantity}
                          </span>
                          <span className="font-medium">{fmt(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-muted/40 rounded-xl p-4">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      Оплата
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Сумма заказа</span>
                        <span className="font-semibold">{fmt(order.totalPrice)}</span>
                      </div>
                      {order.paidAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Оплачено</span>
                          <span>{fmt(order.paidAmount)}</span>
                        </div>
                      )}
                      {changeDue !== null && (
                        <div className="flex justify-between pt-1.5 border-t border-border">
                          <span className="font-medium text-primary">Сдача</span>
                          <span className="font-bold text-primary text-base">{fmt(changeDue)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Status */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Изменить статус</h3>
                    <Select
                      value={order.status}
                      onValueChange={(v) => {
                        handleStatusChange(order.id, v as Status);
                        setSelectedOrder({ ...order, status: v });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
