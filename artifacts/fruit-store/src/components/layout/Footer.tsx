import { Leaf, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground tracking-tight">
                Фруктовый<span className="text-primary">Магазин</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Самые свежие, натуральные и органические фрукты с доставкой прямо к вашему порогу.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Контакты</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>г. Минск, пр-т Независимости, 15<br/>Беларусь, 220013</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+375447014974" className="hover:text-primary transition-colors">+375 44 701 4974</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@fruitstore.ru</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Информация</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">О нас</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Условия доставки</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Политика возврата</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Частые вопросы</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Фруктовый Магазин. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-primary transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
