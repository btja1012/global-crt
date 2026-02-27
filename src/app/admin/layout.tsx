"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // refresh token every 5 min

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const lastActivity = useRef(Date.now());

  // Track user activity
  useEffect(() => {
    const update = () => { lastActivity.current = Date.now(); };
    window.addEventListener("mousemove", update, { passive: true });
    window.addEventListener("keydown", update, { passive: true });
    window.addEventListener("click", update, { passive: true });
    return () => {
      window.removeEventListener("mousemove", update);
      window.removeEventListener("keydown", update);
      window.removeEventListener("click", update);
    };
  }, []);

  // Refresh token if user was active in the last refresh interval
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const idle = Date.now() - lastActivity.current;
      if (idle < REFRESH_INTERVAL_MS) {
        await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
