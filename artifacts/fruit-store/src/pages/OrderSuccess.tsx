import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-card p-8 md:p-12 rounded-3xl border border-border/50 shadow-xl text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 text-success rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Заказ успешно оформлен!
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Спасибо за ваш заказ. Мы уже начали его собирать. Вы можете отслеживать статус в личном кабинете.
        </p>

        <div className="space-y-3">
          <Link href="/my-orders">
            <Button className="w-full h-12 rounded-xl text-md">Мои заказы</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full h-12 rounded-xl text-md">Вернуться в магазин</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
