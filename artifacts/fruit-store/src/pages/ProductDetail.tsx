import { useState } from "react";
import { useRoute } from "wouter";
import { useGetFruitBySlug, useGetFruits } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Minus, Plus, ShoppingCart, ArrowLeft, Truck, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";

const WEIGHT_OPTIONS = [
  { label: "500г", value: "500г", mult: 0.5 },
  { label: "1кг", value: "1кг", mult: 1 },
  { label: "2кг", value: "2кг", mult: 2 },
];

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  
  const { data: fruit, isLoading, isError } = useGetFruitBySlug(slug);
  const { data: relatedData } = useGetFruits({ limit: 4, category: fruit?.category });
  
  const { addToCart } = useCart();
  
  const [selectedWeight, setSelectedWeight] = useState(WEIGHT_OPTIONS[1]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">Загрузка...</div>;
  }

  if (isError || !fruit) {
    return (
      <div className="min-h-screen pt-24 pb-20 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
        <Link href="/shop"><Button>Вернуться в каталог</Button></Link>
      </div>
    );
  }

  const currentPrice = fruit.price * selectedWeight.mult;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAdd = () => {
    setIsAdding(true);
    addToCart({
      fruitId: fruit.id,
      name: fruit.name,
      slug: fruit.slug,
      imageUrl: fruit.imageUrl,
      quantity,
      weight: selectedWeight.value,
      weightMultiplier: selectedWeight.mult,
      unitPrice: fruit.price,
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад в каталог
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image side */}
            <div className="bg-muted aspect-square md:aspect-auto relative">
              {fruit.imageUrl ? (
                <img src={fruit.imageUrl} alt={fruit.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Нет изображения</div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                {fruit.organic && (
                  <Badge className="bg-primary/90 text-white px-4 py-1.5 text-sm shadow-md">
                    <Leaf className="w-4 h-4 mr-2" /> Органика
                  </Badge>
                )}
              </div>
            </div>

            {/* Content side */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-2 text-sm font-medium text-primary uppercase tracking-wider">
                {fruit.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                {fruit.name}
              </h1>
              
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
                <span className="text-muted-foreground text-lg pb-1">/ {selectedWeight.label}</span>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8 flex-grow">
                {fruit.description || "Свежий и вкусный продукт, тщательно отобранный для вашего стола. Идеально подходит для здорового питания всей семьи."}
              </p>

              <div className="space-y-6">
                {/* Weight selection */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Выберите вес:</h3>
                  <div className="flex gap-3">
                    {WEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedWeight(opt)}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border-2 ${
                          selectedWeight.value === opt.value 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  {/* Quantity */}
                  <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <Button 
                    size="lg" 
                    onClick={handleAdd}
                    disabled={fruit.stock === 0}
                    className={`flex-1 h-14 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 ${
                      isAdding ? "bg-secondary hover:bg-secondary text-secondary-foreground" : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isAdding ? "В корзине!" : <><ShoppingCart className="w-5 h-5 mr-2" /> Добавить в корзину</>}
                  </Button>
                </div>
                
                {fruit.stock === 0 && (
                  <p className="text-destructive text-sm font-medium mt-2">К сожалению, товар закончился.</p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Быстрая доставка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>Гарантия свежести</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedData?.fruits && relatedData.fruits.length > 1 && (
          <div>
            <h2 className="text-2xl font-display font-bold mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedData.fruits.filter(f => f.id !== fruit.id).slice(0, 4).map(f => (
                <ProductCard key={f.id} fruit={f} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
