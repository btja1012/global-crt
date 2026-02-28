"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ship, LogOut, LayoutDashboard, User, Menu, X, Moon, Sun } from "lucide-react";

const navT = {
  es: {
    services: "Servicios",
    contact: "Contacto",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    dashboard: "Panel",
  },
  en: {
    services: "Services",
    contact: "Contact",
    signIn: "Sign In",
    signOut: "Sign Out",
    dashboard: "Dashboard",
  },
};

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = usePathname();
  const { lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = navT[lang];
  const isTransparent = location === "/";
  const isHome = location === "/";

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300
        ${isTransparent ? "bg-background/80 border-transparent backdrop-blur-md" : "bg-background border-border shadow-sm"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Ship className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Global CR <span className="text-primary">Transport</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-2">
            {isHome && (
              <>
                <a href="#services">
                  <Button variant="ghost" size="sm">{t.services}</Button>
                </a>
                <a href="#contact">
                  <Button variant="ghost" size="sm">{t.contact}</Button>
                </a>
              </>
            )}

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="font-semibold text-xs tracking-widest px-3"
            >
              {lang === "es" ? "EN" : "ES"}
            </Button>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/admin">
                  <Button variant={location === "/admin" ? "secondary" : "ghost"} size="sm" className="gap-2" data-testid="link-dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    {t.dashboard}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20">
                        {user?.firstName?.[0] || <User className="w-4 h-4" />}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive" data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.signOut}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" data-testid="button-login">{t.signIn}</Button>
              </Link>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-1">
            {/* Language toggle mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="font-semibold text-xs tracking-widest px-2"
            >
              {lang === "es" ? "EN" : "ES"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {!isAuthenticated && (
              <Link href="/login">
                <Button variant="default" size="sm" data-testid="button-login">{t.signIn}</Button>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 py-4 flex flex-col gap-2">
          {isHome && (
            <>
              <a href="#services" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">{t.services}</Button>
              </a>
              <a href="#contact" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">{t.contact}</Button>
              </a>
            </>
          )}
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => { logout(); setMobileOpen(false); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.signOut}
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
