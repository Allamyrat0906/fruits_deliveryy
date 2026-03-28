import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authHeaders } from "@/lib/auth-helpers";
import { useGetFruits, useCreateFruit, useUpdateFruit, useDeleteFruit, useUpdateOrderStatus, Fruit, Order } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit2, Plus, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.role !== "ADMIN") {
      setLocation("/");
      toast({ variant: "destructive", title: "Доступ запрещен", description: "Требуются права администратора" });
    }
  }, [user, setLocation, toast]);

  const { data: fruitsData, isLoading: fruitsLoading } = useGetFruits({ limit: 100 });
  const createFruitMut = useCreateFruit({ request: { headers: authHeaders() } });
  const updateFruitMut = useUpdateFruit({ request: { headers: authHeaders() } });
  const deleteFruitMut = useDeleteFruit({ request: { headers: authHeaders() } });
  const updateOrderMut = useUpdateOrderStatus({ request: { headers: authHeaders() } });

  // Custom fetch for all orders since it wasn't in OpenAPI, fallback to generic fetch
  const { data: ordersData, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders/my", { headers: authHeaders() }); // Fallback to my orders if /api/orders doesn't exist
      if (!res.ok) return [];
      return res.json();
    }
  });

  const [isFruitModalOpen, setIsFruitModalOpen] = useState(false);
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null);

  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", price: 0, stock: 0, category: "МЕСТНЫЕ" as any, organic: false, imageUrl: ""
  });

  const handleOpenModal = (fruit?: Fruit) => {
    if (fruit) {
      setEditingFruit(fruit);
      setFormData({
        name: fruit.name, slug: fruit.slug, description: fruit.description || "",
        price: fruit.price, stock: fruit.stock, category: fruit.category,
        organic: fruit.organic, imageUrl: fruit.imageUrl || ""
      });
    } else {
      setEditingFruit(null);
      setFormData({
        name: "", slug: "", description: "", price: 0, stock: 100, category: "МЕСТНЫЕ", organic: false, imageUrl: ""
      });
    }
    setIsFruitModalOpen(true);
  };

  const handleFruitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFruit) {
        await updateFruitMut.mutateAsync({ id: editingFruit.id, data: formData });
        toast({ title: "Обновлено", description: "Товар успешно обновлен" });
      } else {
        await createFruitMut.mutateAsync({ data: formData });
        toast({ title: "Создано", description: "Товар успешно создан" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/fruits"] });
      setIsFruitModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить товар" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить товар?")) {
      try {
        await deleteFruitMut.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ["/api/fruits"] });
        toast({ title: "Удалено" });
      } catch (err) {
        toast({ variant: "destructive", title: "Ошибка удаления" });
      }
    }
  };

  const handleOrderStatus = async (id: number, status: any) => {
    try {
      await updateOrderMut.mutateAsync({ id, data: { status } });
      refetchOrders();
      toast({ title: "Статус обновлен" });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка обновления статуса" });
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Панель управления</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card border border-border/50 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg">Товары</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg">Заказы</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Управление товарами</h2>
                <Dialog open={isFruitModalOpen} onOpenChange={setIsFruitModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenModal()} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/> Добавить товар</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingFruit ? "Редактировать товар" : "Новый товар"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFruitSubmit} className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Название</Label>
                          <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Slug (URL)</Label>
                          <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Описание</Label>
                        <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Цена (₽)</Label>
                          <Input type="number" required min="0" value={formData.price || ""} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Остаток (кг)</Label>
                          <Input type="number" required min="0" value={formData.stock || ""} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Категория</Label>
                        <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="МЕСТНЫЕ">МЕСТНЫЕ</SelectItem>
                            <SelectItem value="ТРОПИЧЕСКИЕ">ТРОПИЧЕСКИЕ</SelectItem>
                            <SelectItem value="ОРГАНИЧЕСКИЕ">ОРГАНИЧЕСКИЕ</SelectItem>
                            <SelectItem value="ИМПОРТНЫЕ">ИМПОРТНЫЕ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>URL картинки (Unsplash)</Label>
                        <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="admin-org" checked={formData.organic} onCheckedChange={(c) => setFormData({...formData, organic: !!c})} />
                        <Label htmlFor="admin-org">Органический продукт</Label>
                      </div>

                      <Button type="submit" className="w-full mt-4" disabled={createFruitMut.isPending || updateFruitMut.isPending}>Сохранить</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {fruitsLoading ? <div className="animate-pulse h-64 bg-muted rounded-xl"></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">ID</th>
                        <th className="px-4 py-3">Товар</th>
                        <th className="px-4 py-3">Цена</th>
                        <th className="px-4 py-3">Остаток</th>
                        <th className="px-4 py-3 text-right rounded-tr-xl">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fruitsData?.fruits.map(fruit => (
                        <tr key={fruit.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">{fruit.id}</td>
                          <td className="px-4 py-3 font-medium">{fruit.name}</td>
                          <td className="px-4 py-3">{fruit.price} ₽</td>
                          <td className="px-4 py-3">{fruit.stock}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(fruit)}><Edit2 className="w-4 h-4 text-blue-500"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(fruit.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Управление заказами</h2>
                <Button variant="outline" onClick={() => refetchOrders()}><RefreshCw className="w-4 h-4 mr-2"/> Обновить</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-xl">Заказ ID</th>
                      <th className="px-4 py-3">Клиент ID</th>
                      <th className="px-4 py-3">Сумма</th>
                      <th className="px-4 py-3">Адрес</th>
                      <th className="px-4 py-3 rounded-tr-xl">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData?.map(order => (
                      <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium">#{order.id}</td>
                        <td className="px-4 py-4">{order.userId}</td>
                        <td className="px-4 py-4 font-bold">{order.totalPrice} ₽</td>
                        <td className="px-4 py-4 truncate max-w-[200px]" title={order.address}>{order.address}</td>
                        <td className="px-4 py-4">
                          <Select 
                            defaultValue={order.status} 
                            onValueChange={(val) => handleOrderStatus(order.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ОЖИДАНИЕ">ОЖИДАНИЕ</SelectItem>
                              <SelectItem value="ПОДТВЕРЖДЁН">ПОДТВЕРЖДЁН</SelectItem>
                              <SelectItem value="ОТПРАВЛЕН">ОТПРАВЛЕН</SelectItem>
                              <SelectItem value="ДОСТАВЛЕН">ДОСТАВЛЕН</SelectItem>
                              <SelectItem value="ОТМЕНЁН">ОТМЕНЁН</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!ordersData?.length && <div className="p-4 text-center text-muted-foreground">Нет заказов</div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
