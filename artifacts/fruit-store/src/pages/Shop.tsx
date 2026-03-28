import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetFruits } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const CATEGORIES = ["Все", "МЕСТНЫЕ", "ТРОПИЧЕСКИЕ", "ОРГАНИЧЕСКИЕ", "ИМПОРТНЫЕ"];

export default function Shop() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "Все");
  const [organic, setOrganic] = useState<boolean>(searchParams.get("organic") === "true");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [page, setPage] = useState(1);

  // Debounced search for API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = {
    page,
    limit: 12,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category !== "Все" && { category: category as any }),
    ...(organic && { organic: true }),
    ...(priceRange[1] < 5000 && { maxPrice: priceRange[1] }),
    ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
  };

  const { data, isLoading } = useGetFruits(queryParams);

  const resetFilters = () => {
    setSearch("");
    setCategory("Все");
    setOrganic(false);
    setPriceRange([0, 5000]);
    setPage(1);
  };

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
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-foreground flex justify-between">
          <span>Цена (₽/кг)</span>
          <span className="text-sm font-normal text-muted-foreground">до {priceRange[1]} ₽</span>
        </h3>
        <Slider
          defaultValue={[0, 5000]}
          max={5000}
          step={100}
          value={priceRange}
          onValueChange={(val) => { setPriceRange(val); setPage(1); }}
          className="py-4"
        />
      </div>

      <Button variant="outline" className="w-full rounded-xl" onClick={resetFilters}>
        <X className="w-4 h-4 mr-2" /> Сбросить фильтры
      </Button>
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
            <p className="text-muted-foreground mt-2">Свежие фрукты со всего мира</p>
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
