"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTickets, useUpdateTicket, useDeleteTicket, useBulkTickets } from "@/hooks/use-tickets";
import { Navigation } from "@/components/Navigation";
import { CreateTicketDialog } from "@/components/CreateTicketDialog";
import { TicketDetailDialog } from "@/components/TicketDetailDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2, Search, MoreHorizontal, Pencil, Trash2,
  MessageSquare, Paperclip, MapPin, Package, Download,
  CheckSquare, Square, X, ChevronDown, ChevronLeft, ChevronRight, BarChart2, Upload, CheckCircle2, AlertCircle, Timer,
} from "lucide-react";
import {
  TICKET_STATUSES, SERVICE_TYPES, DIRECTION_TYPES,
  type TicketWithDetails, type TicketStatus,
} from "@shared/schema";

const COLUMN_COLORS: Record<string, string> = {
  "Nuevo": "border-t-slate-400",
  "En Proceso": "border-t-blue-500",
  "Aduana": "border-t-amber-500",
  "En Tránsito": "border-t-purple-500",
  "Facturar": "border-t-green-500",
  "Facturado": "border-t-teal-500",
};

const COLUMN_DOT_COLORS: Record<string, string> = {
  "Nuevo": "bg-slate-400",
  "En Proceso": "bg-blue-500",
  "Aduana": "bg-amber-500",
  "En Tránsito": "bg-purple-500",
  "Facturar": "bg-green-500",
  "Facturado": "bg-teal-500",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col pt-20 px-4 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 max-w-[1600px] mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">Panel de Control</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Gestiona las órdenes de ruteo de carga y logística</p>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-end gap-1 sm:gap-2 mb-3 flex-wrap">
            <Link href="/admin/trash">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Papelera</span>
              </Button>
            </Link>
            <Link href="/admin/metrics">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Métricas</span>
              </Button>
            </Link>
            <ImportCSVButton />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open("/api/tickets/export", "_blank")}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
            <CreateTicketDialog />
          </div>
          <ErrorBoundary>
            <KanbanBoard />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function ticketElapsed(updatedAt: string | Date | null | undefined, now: number): { label: string; color: string } | null {
  if (!updatedAt) return null;
  const ms = now - new Date(updatedAt).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 5) return null;
  if (minutes < 60) return { label: `${minutes}m`, color: "text-muted-foreground" };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `${hours}h`, color: "text-blue-500" };
  const days = Math.floor(hours / 24);
  if (days < 3) return { label: `${days}d`, color: "text-amber-500" };
  return { label: `${days}d`, color: "text-red-500" };
}

function KanbanBoard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileStatus, setMobileStatus] = useState<TicketStatus>(TICKET_STATUSES[0]);
  const [serviceType, setServiceType] = useState("");
  const [direction, setDirection] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<TicketWithDetails | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingTicket, setEditingTicket] = useState<TicketWithDetails | null>(null);
  const suppressCardClick = useRef(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: tickets, isLoading } = useTickets({
    search: debouncedSearch,
    serviceType,
    direction,
  });
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const bulkTickets = useBulkTickets();

  // Debounce search — update after 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
  }, []);

  const isSelecting = selectedIds.size > 0;

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatus = async (status: TicketStatus) => {
    await bulkTickets.mutateAsync({ ids: Array.from(selectedIds), action: "update", status });
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await bulkTickets.mutateAsync({ ids: Array.from(selectedIds), action: "delete" });
    clearSelection();
    setBulkDeleteOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, ticket: TicketWithDetails) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => setDraggedTicket(null);

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

  const hasFilters = debouncedSearch || serviceType || direction;

  return (
    <>
      {/* Filters bar */}
      <div className="max-w-[1600px] mx-auto w-full mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar órdenes..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            data-testid="input-search-tickets"
          />
        </div>

        <Select value={serviceType || "all"} onValueChange={(v) => setServiceType(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Tipo de servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los servicios</SelectItem>
            {SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={direction || "all"} onValueChange={(v) => setDirection(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Import / Export</SelectItem>
            {DIRECTION_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => { setSearch(""); setDebouncedSearch(""); setServiceType(""); setDirection(""); }}
          >
            <X className="w-3 h-3" /> Limpiar
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {isSelecting && (
        <div className="max-w-[1600px] mx-auto w-full mb-3 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-primary">{selectedIds.size} seleccionadas</span>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1" disabled={bulkTickets.isPending}>
                  Mover a <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {TICKET_STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkTickets.isPending}
            >
              <Trash2 className="w-3 h-3" /> Eliminar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Mobile list view (hidden on md+) ── */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        {/* Status tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {TICKET_STATUSES.map((status) => {
            const count = (tickets || []).filter((t) => t.status === status).length;
            const active = mobileStatus === status;
            return (
              <button
                key={status}
                onClick={() => setMobileStatus(status)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-card border-primary text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${COLUMN_DOT_COLORS[status]}`} />
                {status}
                <span className="text-xs font-semibold">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Ticket list */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pb-20">
            {(tickets || []).filter((t) => t.status === mobileStatus).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">Sin órdenes en este estado</p>
                <CreateTicketDialog
                  defaultStatus={mobileStatus}
                  trigger={
                    <Button variant="outline" size="sm" className="mt-3 gap-1">
                      <span className="text-base leading-none">+</span> Nueva orden
                    </Button>
                  }
                />
              </div>
            ) : (
              (tickets || [])
                .filter((t) => t.status === mobileStatus)
                .map((ticket) => {
                  const isSelected = selectedIds.has(ticket.id);
                  return (
                    <div
                      key={ticket.id}
                      className={`bg-card rounded-lg border p-3 cursor-pointer transition-colors ${
                        isSelected ? "border-primary/60 bg-primary/5" : "hover:border-primary/30"
                      }`}
                      onClick={() => {
                        if (suppressCardClick.current) return;
                        isSelecting
                          ? toggleSelect(ticket.id, { stopPropagation: () => {} } as React.MouseEvent)
                          : setSelectedTicket(ticket);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={(e) => toggleSelect(ticket.id, e)}
                            className="flex-shrink-0 text-muted-foreground"
                          >
                            {isSelected
                              ? <CheckSquare className="w-4 h-4 text-primary" />
                              : <Square className="w-4 h-4 opacity-40" />}
                          </button>
                          <span className="text-xs font-mono text-primary font-semibold">{ticket.trackingNumber}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { suppressCardClick.current = true; setEditingTicket(ticket); setTimeout(() => { suppressCardClick.current = false; }, 300); }}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{ticket.origin} → {ticket.destination}</span>
                      </div>
                      {ticket.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{ticket.notes}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />{ticket.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{ticket.attachments?.length || 0}
                        </span>
                        {(() => {
                          const elapsed = ticketElapsed(ticket.updatedAt, now);
                          return elapsed ? (
                            <span className={`flex items-center gap-0.5 ml-auto font-medium ${elapsed.color}`}>
                              <Timer className="w-3 h-3" />
                              {elapsed.label}
                            </span>
                          ) : ticket.serviceType ? (
                            <span className="ml-auto text-xs text-muted-foreground">{ticket.serviceType}</span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── Desktop Kanban (hidden on mobile) ── */}
      <div className="hidden md:block flex-1 max-w-[1600px] mx-auto w-full overflow-x-auto">
        <div className="flex gap-4 min-w-[1000px] h-full pb-4">
          {TICKET_STATUSES.map((status) => {
            const columnTickets = (tickets || []).filter((t) => t.status === status);
            const canCollapse = status === "Facturado";
            const isCollapsed = canCollapse && collapsedColumns.has(status);
            const toggleCollapse = () => {
              setCollapsedColumns((prev) => {
                const next = new Set(prev);
                next.has(status) ? next.delete(status) : next.add(status);
                return next;
              });
            };

            if (isCollapsed) {
              return (
                <div
                  key={status}
                  className={`flex-shrink-0 w-10 bg-card/50 rounded-xl border border-t-4 ${COLUMN_COLORS[status]} flex flex-col items-center py-3 gap-2 cursor-pointer hover:bg-card transition-colors`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                  onClick={toggleCollapse}
                  data-testid={`column-${status}`}
                  title={`Expandir ${status}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLUMN_DOT_COLORS[status]}`} />
                  <span className="bg-muted text-muted-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {columnTickets.length}
                  </span>
                  <span
                    className="text-xs font-semibold text-muted-foreground mt-1"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
                  >
                    {status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-auto" />
                </div>
              );
            }

            return (
              <div
                key={status}
                className={`flex-1 min-w-[240px] bg-card/50 rounded-xl border border-t-4 ${COLUMN_COLORS[status]} flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                data-testid={`column-${status}`}
              >
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_DOT_COLORS[status]}`} />
                    <h3 className="font-semibold text-sm">{status}</h3>
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {columnTickets.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {canCollapse && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs text-muted-foreground"
                        onClick={toggleCollapse}
                        title="Minimizar columna"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        Min
                      </Button>
                    )}
                    <CreateTicketDialog
                      defaultStatus={status}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <span className="text-lg leading-none">+</span>
                        </Button>
                      }
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1 px-2 pb-2">
                  <div className="space-y-2">
                    {columnTickets.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Package className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-xs">Sin órdenes</p>
                      </div>
                    )}
                    {columnTickets.map((ticket) => {
                      const isSelected = selectedIds.has(ticket.id);
                      return (
                        <div
                          key={ticket.id}
                          draggable={!isSelecting}
                          onDragStart={(e) => handleDragStart(e, ticket)}
                          onDragEnd={handleDragEnd}
                          className={`bg-card rounded-lg border p-3 cursor-pointer transition-colors group ${
                            isSelected ? "border-primary/60 bg-primary/5" : "hover:border-primary/30"
                          }`}
                          onClick={() => {
                            if (suppressCardClick.current) return;
                            isSelecting ? toggleSelect(ticket.id, { stopPropagation: () => {} } as any) : setSelectedTicket(ticket);
                          }}
                          data-testid={`ticket-card-${ticket.id}`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                onClick={(e) => toggleSelect(ticket.id, e)}
                                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                              >
                                {isSelected
                                  ? <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                  : <Square className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60" />
                                }
                              </button>
                              <span className="text-xs font-mono text-primary font-semibold truncate">{ticket.trackingNumber}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => { suppressCardClick.current = true; setEditingTicket(ticket); setTimeout(() => { suppressCardClick.current = false; }, 300); }}>
                                  <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                            {(() => {
                              const elapsed = ticketElapsed(ticket.updatedAt, now);
                              return elapsed ? (
                                <span className={`flex items-center gap-0.5 ml-auto font-medium ${elapsed.color}`}>
                                  <Timer className="w-3 h-3" />
                                  {elapsed.label}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      );
                    })}
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

      {/* Single delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar orden de ruteo</AlertDialogTitle>
            <AlertDialogDescription>
              La orden será eliminada y podrá ser recuperada si es necesario.
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

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {selectedIds.size} órdenes</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {selectedIds.size} órdenes seleccionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive">
              {bulkTickets.isPending ? "Eliminando..." : "Eliminar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit ticket — key forces remount each time so Radix dialog state resets cleanly */}
      <CreateTicketDialog
        key={editingTicket ? `edit-${editingTicket.id}` : "no-edit"}
        existingTicket={editingTicket}
        open={!!editingTicket}
        onOpenChange={(o) => { if (!o) setEditingTicket(null); }}
      />
    </>
  );
}

function ImportCSVButton() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("csv", file);
    try {
      const res = await fetch("/api/tickets/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      }
    } catch {
      setResult({ imported: 0, skipped: 0, errors: ["Error de conexión"] });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Importar CSV</span>
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar órdenes desde CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con las órdenes a importar.
            </DialogDescription>
          </DialogHeader>

          {!result ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground mb-2">Formato esperado (primera fila = encabezados):</p>
                <code className="block bg-muted rounded p-2 text-[11px] leading-relaxed">
                  clientName,origin,destination,status,serviceType,direction,cargoType
                </code>
                <p className="mt-2"><span className="font-medium text-foreground">Requeridos:</span> clientName, origin, destination</p>
                <p><span className="font-medium text-foreground">Opcionales:</span> status (default: Nuevo), serviceType, direction, cargoType</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                {file ? file.name : "Seleccionar archivo CSV"}
              </Button>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleImport} disabled={!file || importing}>
                  {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando...</> : "Importar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{result.imported} órdenes importadas</p>
                  {result.skipped > 0 && (
                    <p className="text-sm text-muted-foreground">{result.skipped} filas omitidas</p>
                  )}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    Errores
                  </div>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{err}</p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-xs text-muted-foreground">...y {result.errors.length - 5} más</p>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleClose}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
