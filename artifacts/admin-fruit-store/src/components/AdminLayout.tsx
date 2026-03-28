import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, ClipboardList, LogOut, Store, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/products", label: "Товары", icon: ShoppingBag },
  { href: "/orders", label: "Заказы", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Store className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sidebar-foreground font-semibold text-sm leading-tight">Фруктовый</p>
              <p className="text-sidebar-foreground/50 text-xs">Магазин · Админ</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">{user?.name}</p>
              <p className="text-sidebar-foreground/50 text-xs truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
