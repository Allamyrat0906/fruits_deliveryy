import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, Leaf, Package, LogOut, Shield, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useLogoutUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const logoutMutation = useLogoutUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Force local logout anyway
    }
    logout();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/shop", label: "Каталог" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md shadow-sm py-3" : "bg-background py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              Фруктовый<span className="text-primary">Магазин</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium text-sm transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/my-orders"
                className={`font-medium text-sm transition-colors hover:text-primary ${
                  location === "/my-orders" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Мои заказы
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <span className={`inline-flex items-center gap-1.5 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  location === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  Админ
                </span>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 p-0">
                    <User className="w-4 h-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                  <DropdownMenuLabel className="font-normal pb-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1">
                          <Shield className="w-3 h-3" /> Администратор
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                    <Link href="/my-orders" className="flex items-center w-full">
                      <Package className="mr-2 h-4 w-4" />
                      Мои заказы
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-primary focus:text-primary focus:bg-primary/10">
                      <Link href="/admin" className="flex items-center w-full">
                        <Shield className="mr-2 h-4 w-4" />
                        Панель администратора
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="default" size="sm" className="rounded-xl px-5">
                  Войти
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-b shadow-md"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium p-3 rounded-xl transition-colors ${
                    location === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/my-orders"
                  className={`flex items-center gap-2 font-medium p-3 rounded-xl transition-colors ${
                    location === "/my-orders" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  Мои заказы
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 font-semibold p-3 rounded-xl transition-colors ${
                    location === "/admin" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Панель администратора
                </Link>
              )}
              {!user ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl mt-2">Войти в аккаунт</Button>
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-medium p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из аккаунта
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
