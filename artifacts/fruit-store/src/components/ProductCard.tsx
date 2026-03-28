import { Link } from "wouter";
import { Fruit } from "@workspace/api-client-react";
import { Leaf, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { motion } from "framer-motion";

export function ProductCard({ fruit }: { fruit: Fruit }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Default to 1kg representation
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    setIsAdding(true);
    addToCart({
      fruitId: fruit.id,
      name: fruit.name,
      slug: fruit.slug,
      imageUrl: fruit.imageUrl,
      quantity: 1,
      weight: "1кг",
      weightMultiplier: 1,
      unitPrice: fruit.price,
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Link href={`/product/${fruit.slug}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative"
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {fruit.organic && (
            <Badge className="bg-primary/90 hover:bg-primary text-white border-none px-3 py-1 flex items-center gap-1 shadow-md">
              <Leaf className="w-3 h-3" />
              Органика
            </Badge>
          )}
          {fruit.stock <= 5 && fruit.stock > 0 && (
            <Badge variant="destructive" className="px-3 py-1 shadow-md">
              Осталось мало
            </Badge>
          )}
          {fruit.stock === 0 && (
            <Badge variant="secondary" className="px-3 py-1 bg-muted text-muted-foreground shadow-md">
              Нет в наличии
            </Badge>
          )}
        </div>

        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {fruit.imageUrl ? (
            <img 
              src={fruit.imageUrl} 
              alt={fruit.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
              <Leaf className="w-12 h-12 opacity-50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {fruit.category}
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-1">
            {fruit.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {fruit.description || "Свежие и вкусные фрукты высшего качества."}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <div>
              <span className="font-bold text-xl text-foreground">
                {formatPrice(fruit.price)}
              </span>
              <span className="text-muted-foreground text-sm"> / кг</span>
            </div>
            
            <Button 
              onClick={handleAdd}
              disabled={fruit.stock === 0}
              size="icon"
              className={`rounded-full shadow-md transition-all duration-300 ${
                isAdding ? "bg-secondary hover:bg-secondary text-secondary-foreground" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isAdding ? <ShoppingCart className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
