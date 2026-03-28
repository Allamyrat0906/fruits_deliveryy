import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  fruitId: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  quantity: number;
  weight: string;
  weightMultiplier: number;
  unitPrice: number; // Base price per kg
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (fruitId: number, weight: string) => void;
  updateQuantity: (fruitId: number, weight: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("fruit_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("fruit_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.fruitId === newItem.fruitId && item.weight === newItem.weight
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prev];
        newItems[existingItemIndex].quantity += newItem.quantity;
        return newItems;
      }
      return [...prev, newItem];
    });

    toast({
      title: "Добавлено в корзину",
      description: `${newItem.name} (${newItem.weight}) x${newItem.quantity}`,
    });
  };

  const removeFromCart = (fruitId: number, weight: string) => {
    setItems((prev) => prev.filter((item) => !(item.fruitId === fruitId && item.weight === weight)));
  };

  const updateQuantity = (fruitId: number, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(fruitId, weight);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.fruitId === fruitId && item.weight === weight ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.weightMultiplier * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
