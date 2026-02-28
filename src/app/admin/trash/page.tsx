"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useDeletedTickets, useRestoreTicket } from "@/hooks/use-tickets";
import { Loader2, RotateCcw, Trash2, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TrashPage() {
  const { data: deleted = [], isLoading } = useDeletedTickets();
  const restore = useRestoreTicket();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20 px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-muted-foreground" />
                Papelera
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Órdenes eliminadas — puedes restaurarlas en cualquier momento
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : deleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">La papelera está vacía</p>
              <p className="text-sm mt-1">Las órdenes eliminadas aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deleted.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary font-semibold">
                        {ticket.trackingNumber}
                      </span>
                      {ticket.serviceType && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {ticket.serviceType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{ticket.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.origin} → {ticket.destination}
                    </p>
                    {ticket.deletedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Eliminada el {format(new Date(ticket.deletedAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                    onClick={() => restore.mutate(ticket.id)}
                    disabled={restore.isPending}
                  >
                    {restore.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
