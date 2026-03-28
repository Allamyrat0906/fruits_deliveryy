import { useState } from "react";
import {
  useGetFruits,
  useCreateFruit,
  useUpdateFruit,
  useDeleteFruit,
} from "@workspace/api-client-react";
import type { Fruit, CreateFruitInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Tag, Leaf, Search } from "lucide-react";

const CATEGORIES = ["МЕСТНЫЕ", "ТРОПИЧЕСКИЕ", "ОРГАНИЧЕСКИЕ", "ИМПОРТНЫЕ"] as const;
type Category = typeof CATEGORIES[number];

interface FruitForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  category: Category;
  organic: boolean;
  imageUrl: string;
  images: string;
}

const defaultForm: FruitForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "10",
  category: "МЕСТНЫЕ",
  organic: false,
  imageUrl: "",
  images: "",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-а-яё]/gi, "")
    || name.toLowerCase().replace(/\s+/g, "-");
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

export default function Products() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editFruit, setEditFruit] = useState<Fruit | null>(null);
  const [form, setForm] = useState<FruitForm>(defaultForm);

  const { data, isLoading, refetch } = useGetFruits({ page, limit: 10, ...(search ? { search } : {}) });
  const createMutation = useCreateFruit();
  const updateMutation = useUpdateFruit();
  const deleteMutation = useDeleteFruit();

  const openCreate = () => {
    setEditFruit(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (fruit: Fruit) => {
    setEditFruit(fruit);
    setForm({
      name: fruit.name,
      slug: fruit.slug,
      description: fruit.description || "",
      price: String(fruit.price),
      discountPrice: fruit.discountPrice ? String(fruit.discountPrice) : "",
      stock: String(fruit.stock),
      category: fruit.category as Category,
      organic: fruit.organic || false,
      imageUrl: fruit.imageUrl || "",
      images: fruit.images?.join("\n") || "",
    });
    setDialogOpen(true);
  };

  const buildPayload = (): CreateFruitInput => ({
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || undefined,
    price: parseFloat(form.price),
    discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
    stock: parseInt(form.stock, 10),
    category: form.category,
    organic: form.organic,
    imageUrl: form.imageUrl.trim() || undefined,
    images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
  });

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ variant: "destructive", title: "Заполните обязательные поля", description: "Название и цена обязательны" });
      return;
    }
    try {
      const data = buildPayload();
      if (editFruit) {
        await updateMutation.mutateAsync({ id: editFruit.id, data });
        toast({ title: "Товар обновлён" });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Товар добавлен" });
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить товар";
      toast({ variant: "destructive", title: "Ошибка", description: message });
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Товар удалён" });
      setDeleteId(null);
      refetch();
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить товар" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Товары</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {data ? `Всего: ${data.total} товаров` : "Загрузка..."}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Добавить товар
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Товар</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Категория</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Цена</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Скидка</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Остаток</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.fruits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                data?.fruits.map((fruit) => (
                  <tr key={fruit.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {fruit.imageUrl ? (
                          <img src={fruit.imageUrl} alt={fruit.name} className="w-9 h-9 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{fruit.name}</p>
                          <p className="text-xs text-muted-foreground">{fruit.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fruit.category}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(fruit.price)}</td>
                    <td className="px-4 py-3 text-right">
                      {fruit.discountPrice ? (
                        <span className="text-red-500 font-medium">{fmt(fruit.discountPrice)}</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={fruit.stock === 0 ? "text-red-500" : fruit.stock <= 5 ? "text-orange-500" : "text-foreground"}>
                        {fruit.stock} кг
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {fruit.organic && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary gap-1 px-1.5 py-0.5">
                            <Leaf className="w-3 h-3" /> Органика
                          </Badge>
                        )}
                        {fruit.discountPrice && (
                          <Badge variant="outline" className="text-xs border-red-200 text-red-500 gap-1 px-1.5 py-0.5">
                            <Tag className="w-3 h-3" /> Акция
                          </Badge>
                        )}
                        {fruit.stock === 0 && (
                          <Badge variant="secondary" className="text-xs">Нет</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(fruit)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(fruit.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editFruit ? "Редактировать товар" : "Добавить товар"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Название *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({
                  ...f,
                  name: e.target.value,
                  slug: editFruit ? f.slug : slugify(e.target.value)
                }))}
                placeholder="Яблоко Голден"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Слаг (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="yabloko-golden"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Категория</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Цена (₽/кг) *</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="199"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Цена со скидкой (₽/кг)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.discountPrice}
                onChange={(e) => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                placeholder="Оставьте пустым, если нет скидки"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Остаток (кг)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="10"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="organic"
                checked={form.organic}
                onCheckedChange={(v) => setForm(f => ({ ...f, organic: v }))}
              />
              <Label htmlFor="organic" className="cursor-pointer">Органический товар</Label>
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание товара..."
                rows={2}
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">URL изображения</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Дополнительные изображения (каждое с новой строки)</Label>
              <Textarea
                value={form.images}
                onChange={(e) => setForm(f => ({ ...f, images: e.target.value }))}
                placeholder={"https://...\nhttps://..."}
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Сохранение..." : editFruit ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Товар будет удалён из каталога.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
