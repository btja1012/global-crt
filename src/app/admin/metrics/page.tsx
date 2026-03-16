"use client";

import { useMemo } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { TICKET_STATUSES, SERVICE_TYPES } from "@shared/schema";
import { startOfMonth, subMonths, isAfter, isBefore } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  "Nuevo": "bg-slate-400",
  "En Proceso": "bg-blue-500",
  "Aduana": "bg-amber-500",
  "En Tránsito": "bg-purple-500",
  "Facturar": "bg-green-500",
  "Facturado": "bg-teal-500",
};

export default function MetricsPage() {
  const { data: tickets = [], isLoading } = useTickets();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    const byStatus = TICKET_STATUSES.map((status) => ({
      status,
      count: tickets.filter((t) => t.status === status).length,
    }));

    const byService = SERVICE_TYPES.map((type) => ({
      type,
      count: tickets.filter((t) => t.serviceType === type).length,
    }));

    const byDirection = [
      { dir: "Import", count: tickets.filter((t) => t.direction === "Import").length },
      { dir: "Export", count: tickets.filter((t) => t.direction === "Export").length },
      { dir: "Sin definir", count: tickets.filter((t) => !t.direction).length },
    ];

    const thisMonth = tickets.filter(
      (t) => t.createdAt && isAfter(new Date(t.createdAt), thisMonthStart),
    ).length;

    const lastMonth = tickets.filter((t) => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      return isAfter(d, lastMonthStart) && isBefore(d, thisMonthStart);
    }).length;

    const delivered = byStatus.find((s) => s.status === "Facturado")?.count || 0;
    const deliveryRate = tickets.length > 0 ? Math.round((delivered / tickets.length) * 100) : 0;

    // Top clients by ticket count
    const clientCounts: Record<string, number> = {};
    tickets.forEach((t) => {
      if (t.clientName) clientCounts[t.clientName] = (clientCounts[t.clientName] || 0) + 1;
    });
    const topClients = Object.entries(clientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Avg cycle time (Nuevo → Facturado) for completed tickets
    const completed = tickets.filter((t) => t.status === "Facturado" && t.createdAt && t.updatedAt);
    const avgCycleDays = completed.length > 0
      ? Math.round(
          completed.reduce((sum, t) => {
            return sum + (new Date(t.updatedAt!).getTime() - new Date(t.createdAt!).getTime());
          }, 0) / completed.length / 86400000
        )
      : null;

    // Bottleneck: which status has the most tickets
    const bottleneck = byStatus.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), byStatus[0]);

    // Missing ETA count
    const missingETA = tickets.filter(
      (t) => (t.status === "En Proceso" || t.status === "En Tránsito") && !t.etaPort
    ).length;

    return { byStatus, byService, byDirection, thisMonth, lastMonth, total: tickets.length, delivered, deliveryRate, topClients, avgCycleDays, bottleneck, missingETA };
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const maxStatusCount = Math.max(...stats.byStatus.map((s) => s.count), 1);
  const maxServiceCount = Math.max(...stats.byService.map((s) => s.count), 1);
  const monthDiff = stats.thisMonth - stats.lastMonth;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20 px-4 pb-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Panel
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Métricas</h1>
            <p className="text-muted-foreground text-sm">Resumen del estado de las órdenes</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <StatCard label="Total activas" value={stats.total} icon={<Package className="w-4 h-4" />} />
          <StatCard
            label="Este mes"
            value={stats.thisMonth}
            icon={monthDiff > 0
              ? <TrendingUp className="w-4 h-4 text-green-500" />
              : monthDiff < 0
              ? <TrendingDown className="w-4 h-4 text-red-500" />
              : <Minus className="w-4 h-4 text-muted-foreground" />}
            sub={stats.lastMonth > 0
              ? `${monthDiff >= 0 ? "+" : ""}${monthDiff} vs mes anterior`
              : undefined}
          />
          <StatCard label="Mes anterior" value={stats.lastMonth} />
          <StatCard label="Tasa de entrega" value={`${stats.deliveryRate}%`} sub={`${stats.delivered} entregadas`} />
        </div>

        {/* By status */}
        <Section title="Por estado">
          {stats.byStatus.map(({ status, count }) => (
            <BarRow
              key={status}
              label={status}
              count={count}
              max={maxStatusCount}
              color={STATUS_COLORS[status] || "bg-muted-foreground"}
            />
          ))}
        </Section>

        {/* By service type */}
        <Section title="Por tipo de servicio">
          {stats.byService.filter((s) => s.count > 0).length > 0 ? (
            stats.byService
              .filter((s) => s.count > 0)
              .map(({ type, count }) => (
                <BarRow key={type} label={type} count={count} max={maxServiceCount} color="bg-primary/70" />
              ))
          ) : (
            <p className="text-sm text-muted-foreground py-1">Sin datos</p>
          )}
        </Section>

        {/* By direction */}
        <Section title="Por dirección">
          <div className="flex gap-6">
            {stats.byDirection.filter((d) => d.count > 0).length > 0 ? (
              stats.byDirection
                .filter((d) => d.count > 0)
                .map(({ dir, count }) => (
                  <div key={dir} className="flex flex-col items-center gap-1">
                    <span className="text-3xl font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">{dir}</span>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground py-1">Sin datos</p>
            )}
          </div>
        </Section>

        {/* Top clients */}
        {stats.topClients.length > 0 && (
          <Section title="Clientes principales">
            {stats.topClients.map(({ name, count }) => (
              <BarRow
                key={name}
                label={name}
                count={count}
                max={stats.topClients[0]?.count || 1}
                color="bg-primary/60"
              />
            ))}
          </Section>
        )}

        {/* Cycle time & bottleneck */}
        <Section title="Análisis operacional">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tiempo ciclo promedio</p>
              <p className="text-2xl font-bold">
                {stats.avgCycleDays !== null ? `${stats.avgCycleDays}d` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Nuevo → Facturado</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cuello de botella</p>
              <p className="text-2xl font-bold">{stats.bottleneck?.status || "—"}</p>
              <p className="text-xs text-muted-foreground">{stats.bottleneck?.count || 0} órdenes</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sin ETA definido</p>
              <p className={`text-2xl font-bold ${stats.missingETA > 0 ? "text-amber-500" : ""}`}>
                {stats.missingETA}
              </p>
              <p className="text-xs text-muted-foreground">En proceso / tránsito</p>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-5 mb-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium w-8 text-right tabular-nums">{count}</span>
    </div>
  );
}
