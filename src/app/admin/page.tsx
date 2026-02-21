"use client";

import { useState } from "react";
import { useTickets, useUpdateTicket, useDeleteTicket } from "@/hooks/use-tickets";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { CreateTicketDialog } from "@/components/CreateTicketDialog";
import { TicketDetailDialog } from "@/components/TicketDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Search, MoreHorizontal, Pencil, Trash2, MessageSquare, Paperclip, MapPin, Package, UserPlus, Users } from "lucide-react";
import { TICKET_STATUSES, type TicketWithDetails, type TicketStatus } from "@shared/schema";

const COLUMN_COLORS: Record<string, string> = {
  "Nuevo": "border-t-slate-400",
  "En Proceso": "border-t-blue-500",
  "Aduana": "border-t-amber-500",
  "En Tránsito": "border-t-purple-500",
  "Entregado": "border-t-green-500",
};

const COLUMN_DOT_COLORS: Record<string, string> = {
  "Nuevo": "bg-slate-400",
  "En Proceso": "bg-blue-500",
  "Aduana": "bg-amber-500",
  "En Tránsito": "bg-purple-500",
  "Entregado": "bg-green-500",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col pt-20 px-4 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 max-w-[1600px] mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">Panel de Control</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Gestiona los tickets de carga y logística</p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          <Tabs defaultValue="tickets" className="flex-1 flex flex-col">
            <TabsList className="w-fit mb-4">
              <TabsTrigger value="tickets" className="gap-2">
                <Package className="w-4 h-4" /> Tickets
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="gap-2">
                <Users className="w-4 h-4" /> Usuarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="flex-1 flex flex-col mt-0">
              <div className="flex justify-end mb-3">
                <CreateTicketDialog />
              </div>
              <KanbanBoard />
            </TabsContent>

            <TabsContent value="usuarios" className="mt-0">
              <UsersPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

function UsersPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/auth/users"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json();
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(json.message || "Error al crear usuario");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      setForm({ email: "", password: "", firstName: "", lastName: "" });
      setError("");
    },
    onError: (e: any) => setError(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/auth/users?id=${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      setDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createUser.mutate(form);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
      {/* Add user form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5" /> Agregar Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input placeholder="Juan" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Apellido</Label>
                <Input placeholder="Pérez" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Correo electrónico *</Label>
              <Input type="email" placeholder="usuario@global-crt.com" required value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Contraseña *</Label>
              <Input type="password" placeholder="••••••••" required value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={createUser.isPending}>
              {createUser.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creando...</> : "Crear Usuario"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" /> Usuarios ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No hay usuarios registrados</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{u.firstName || ""} {u.lastName || ""}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteId(u.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteUser.mutate(deleteId)} className="bg-destructive">
              {deleteUser.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KanbanBoard() {
  const { data: tickets, isLoading } = useTickets();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<TicketWithDetails | null>(null);

  const filteredTickets = tickets?.filter((t) =>
    t.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.clientName.toLowerCase().includes(search.toLowerCase()) ||
    (t.origin || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.destination || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDragStart = (e: React.DragEvent, ticket: TicketWithDetails) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== status) {
      await updateTicket.mutateAsync({ id: draggedTicket.id, status });
    }
    setDraggedTicket(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto w-full mb-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-tickets"
          />
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full overflow-x-auto">
        <div className="flex gap-4 min-w-[1000px] h-full pb-4">
          {TICKET_STATUSES.map((status) => {
            const columnTickets = filteredTickets.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className={`flex-1 min-w-[240px] bg-card/50 rounded-xl border border-t-4 ${COLUMN_COLORS[status]} flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                data-testid={`column-${status}`}
              >
                {/* Column Header */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_DOT_COLORS[status]}`} />
                    <h3 className="font-semibold text-sm">{status}</h3>
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {columnTickets.length}
                    </span>
                  </div>
                  <CreateTicketDialog
                    defaultStatus={status}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <span className="text-lg leading-none">+</span>
                      </Button>
                    }
                  />
                </div>

                {/* Cards */}
                <ScrollArea className="flex-1 px-2 pb-2">
                  <div className="space-y-2">
                    {columnTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket)}
                        onDragEnd={handleDragEnd}
                        className="bg-card rounded-lg border p-3 cursor-pointer hover:border-primary/30 transition-colors group"
                        onClick={() => setSelectedTicket(ticket)}
                        data-testid={`ticket-card-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className="text-xs font-mono text-primary font-semibold">{ticket.trackingNumber}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <CreateTicketDialog
                                existingTicket={ticket}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => { e.stopPropagation(); setDeleteId(ticket.id); }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm font-medium mb-1 line-clamp-1">{ticket.clientName}</p>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{ticket.origin} → {ticket.destination}</span>
                        </div>

                        {ticket.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.notes}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.comments?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {ticket.attachments?.length || 0}
                          </span>
                          {ticket.cargoType && (
                            <span className="flex items-center gap-1 ml-auto">
                              <Package className="w-3 h-3" />
                              {ticket.cargoType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el ticket y todos sus comentarios y archivos adjuntos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteTicket.mutate(deleteId)}
              className="bg-destructive"
            >
              {deleteTicket.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
