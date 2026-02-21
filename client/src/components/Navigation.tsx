import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ship, LogOut, LayoutDashboard, User } from "lucide-react";

export function Navigation({ lang, setLang }: { lang?: 'en' | 'es', setLang?: (l: 'en' | 'es') => void }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isTransparent = location === "/";

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300
        ${isTransparent ? 'bg-background/80 border-transparent backdrop-blur-md' : 'bg-background border-border shadow-sm'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Ship className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Global CR <span className="text-primary">Transport</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {setLang && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="text-xs font-bold"
              >
                {lang === 'en' ? 'ES' : 'EN'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
