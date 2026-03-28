import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Truck, ShieldCheck, Leaf, Tag } from "lucide-react";
import { useGetFruits } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function Home() {
  const { data, isLoading } = useGetFruits({ limit: 4 });
  const { data: saleData, isLoading: saleLoading } = useGetFruits({ onSale: true, limit: 4 });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 text-secondary-foreground font-medium text-sm mb-6 border border-secondary/30">
                🌱 100% Натуральные Продукты
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground leading-tight mb-6">
                Свежесть природы <br/>
                <span className="text-primary relative">
                  в каждом кусочке
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Доставляем отборные, спелые и органические фрукты напрямую с лучших ферм к вашему столу. Заботимся о вашем здоровье и вкусе.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop">
                  <Button size="lg" className="rounded-xl px-8 h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                    В каталог <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img 
                  src={`${import.meta.env.BASE_URL}images/hero-banner.png`} 
                  alt="Свежие фрукты" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-border/50"
              >
                <div className="bg-success/10 p-3 rounded-full text-success">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Быстрая доставка</p>
                  <p className="text-xs text-muted-foreground">По всей Беларуси</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Органическое качество</h3>
              <p className="text-muted-foreground">Только сертифицированные продукты без пестицидов.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="bg-secondary/10 p-4 rounded-2xl text-secondary-foreground mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Свежесть гарантирована</h3>
              <p className="text-muted-foreground">Тщательный контроль каждой партии перед отправкой.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-600 mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Доставка до двери</h3>
              <p className="text-muted-foreground">Аккуратная и быстрая транспортировка в удобное время.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Популярное <span className="text-primary">сегодня</span>
              </h2>
              <p className="text-muted-foreground text-lg">Выбор наших покупателей</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="hidden md:flex rounded-xl">
                Смотреть все <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card rounded-2xl aspect-[3/4] animate-pulse border border-border/50" />
              ))}
            </div>
          ) : data?.fruits && data.fruits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.fruits.map((fruit, idx) => (
                <motion.div
                  key={fruit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard fruit={fruit} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Нет доступных товаров
            </div>
          )}
          
          <div className="mt-8 flex justify-center md:hidden">
             <Link href="/shop">
              <Button variant="outline" className="rounded-xl">
                Смотреть все <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sale Section */}
      {(saleLoading || (saleData?.fruits && saleData.fruits.length > 0)) && (
        <section className="py-20 bg-red-50/50 dark:bg-red-950/10 border-y border-red-200/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="w-6 h-6 text-red-500" />
                  <span className="text-red-500 font-bold text-sm uppercase tracking-widest">Специальные предложения</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Акции <span className="text-red-500">со скидкой</span>
                </h2>
                <p className="text-muted-foreground text-lg">Успейте купить по выгодным ценам</p>
              </div>
              <Link href="/shop?onSale=true">
                <Button variant="outline" className="hidden md:flex rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                  Все акции <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {saleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card rounded-2xl aspect-[3/4] animate-pulse border border-border/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(saleData?.fruits ?? []).map((fruit, idx) => (
                  <motion.div
                    key={fruit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ProductCard fruit={fruit} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center md:hidden">
              <Link href="/shop?onSale=true">
                <Button variant="outline" className="rounded-xl">
                  Все акции <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-primary shadow-xl">
            <div className="absolute inset-0 z-0">
               <img 
                  src={`${import.meta.env.BASE_URL}images/promo-organic.png`} 
                  alt="Organic orchard" 
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
            </div>
            <div className="relative z-10 px-8 py-16 md:py-24 md:px-16 lg:w-2/3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 mb-6 text-sm backdrop-blur-sm">
                Специальное предложение
              </Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Сезон местных яблок <br/> уже начался!
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-md">
                Хрустящие, сочные и невероятно полезные. Скидка 20% на все яблоки из местных ферм до конца недели.
              </p>
              <Link href="/shop?category=МЕСТНЫЕ">
                <Button size="lg" variant="secondary" className="rounded-xl px-8 h-14 text-lg font-semibold shadow-lg">
                  Перейти к покупкам
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
