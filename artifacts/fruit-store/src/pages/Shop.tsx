import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetFruits } from "@workspace/api-client-react";
import type { GetFruitsCategory } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, Tag, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const CATEGORIES = ["Все", "МЕСТНЫЕ", "ТРОПИЧЕСКИЕ", "ОРГАНИЧЕСКИЕ", "ИМПОРТНЫЕ"];

export default function Shop() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "Все");
  const [organic, setOrganic] = useState<boolean>(searchParams.get("organic") === "true");
  const [onSale, setOnSale] = useState<boolean>(searchParams.get("onSale") === "true");
  const [page, setPage] = useState(1);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const categoryFilter: GetFruitsCategory | undefined =
    category !== "Все" ? (category as GetFruitsCategory) : undefined;

  const { data, isLoading } = useGetFruits({
    page,
    limit: 12,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(organic && { organic: true }),
    ...(onSale && { onSale: true }),
  });

  const resetFilters = () => {
    setSearch("");
    setCategory("Все");
    setOrganic(false);
    setOnSale(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search) || category !== "Все" || organic || onSale;

  const FiltersContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-foreground">Поиск</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Найти фрукты..." 
            className="pl-10 rounded-xl bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-foreground">Категории</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat}`} 
                checked={category === cat}
                onCheckedChange={() => { setCategory(cat); setPage(1); }}
              />
              <Label htmlFor={`cat-${cat}`} className="font-medium cursor-pointer">
                {cat === "Все" ? "Все категории" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-foreground">Особенности</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="organic" 
              checked={organic}
              onCheckedChange={(checked) => { setOrganic(!!checked); setPage(1); }}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="organic" className="font-medium cursor-pointer">
              Только органические
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="onSale" 
              checked={onSale}
              onCheckedChange={(checked) => { setOnSale(!!checked); setPage(1); }}
              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
            />
            <Label htmlFor="onSale" className="font-medium cursor-pointer flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-500" />
              <span>Только акционные</span>
            </Label>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full rounded-xl" onClick={resetFilters}>
          <X className="w-4 h-4 mr-2" /> Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Каталог продуктов
            </h1>
            <p className="text-muted-foreground mt-2">
              {onSale ? "Акционные товары" : "Свежие фрукты из Беларуси и со всего мира"}
            </p>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden rounded-xl">
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Фильтры</SheetTitle>
              </SheetHeader>
              <FiltersContent />
            </SheetContent>
          </Sheet>
        </div>

        {onSale && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/40 rounded-xl text-red-600 text-sm font-medium">
            <Tag className="w-4 h-4" />
            Показаны товары со скидкой
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
              <FiltersContent />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-card rounded-2xl aspect-[3/4] animate-pulse border border-border/50" />
                ))}
              </div>
            ) : data?.fruits && data.fruits.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.fruits.map((fruit) => (
                    <ProductCard key={fruit.id} fruit={fruit} />
                  ))}
                </div>
                
                {data.totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="rounded-xl"
                    >
                      Назад
                    </Button>
                    <div className="flex items-center px-4 font-medium text-muted-foreground">
                      {page} из {data.totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={page === data.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-xl"
                    >
                      Вперед
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Товары не найдены</h3>
                <p className="text-muted-foreground mb-6">Попробуйте изменить параметры фильтрации</p>
                <Button onClick={resetFilters} className="rounded-xl">Сбросить фильтры</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
