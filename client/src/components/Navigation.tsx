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

export function Navigation() {
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
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <Button variant={location === "/admin" ? "secondary" : "ghost"} className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20">
                        {user?.firstName?.[0] || <User className="w-4 h-4" />}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <a href="/api/login">
                <Button variant="default" className="shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Employee Login
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
