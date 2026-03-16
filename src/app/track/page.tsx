"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Ship, Search, Package, MapPin, Clock,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, Truck, Globe,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { TICKET_STATUSES } from "@shared/schema";

type TicketStatus = typeof TICKET_STATUSES[number];

interface PublicTicket {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: TicketStatus;
  cargoType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const STATUS_CONFIG: Record<TicketStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  badgeClass: string;
  label: string;
  description: string;
}> = {
  "Nuevo": {
    icon: Package,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Nuevo",
    description: "Envío registrado en el sistema",
  },
  "En Proceso": {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    label: "En Proceso",
    description: "Carga siendo procesada",
  },
  "Aduana": {
    icon: Globe,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    label: "En Aduana",
    description: "En proceso de despacho aduanero",
  },
  "En Tránsito": {
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    label: "En Tránsito",
    description: "Carga en camino al destino",
  },
  "Facturar": {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    label: "Por Facturar",
    description: "Carga entregada, pendiente de facturación",
  },
  "Facturado": {
    icon: CheckCircle2,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    label: "Facturado",
    description: "Carga entregada y facturada exitosamente",
  },
};

async function fetchPublicTicket(trackingNumber: string): Promise<PublicTicket | null> {
  const res = await fetch(`/api/track/${encodeURIComponent(trackingNumber)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al buscar el envío");
  return res.json();
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState(searchParams.get("number") || "");
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const number = searchParams.get("number");
    if (number) {
      performSearch(number);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await fetchPublicTicket(trimmed);
      setTicket(result);
      if (!result) {
        setError(`No se encontró ningún envío con el número "${trimmed}". Verifique el número e intente nuevamente.`);
      }
    } catch {
      setError("Error al buscar el envío. Por favor intente más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.replace(`/track?number=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
    performSearch(inputValue);
  };

  const currentStatusIndex = ticket
    ? TICKET_STATUSES.indexOf(ticket.status)
    : -1;

  return (
    <div className="container max-w-3xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 pt-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
          <Ship className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Seguimiento de Envío</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Ingrese su número de seguimiento para ver el estado de su carga
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="mb-8 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ej: CR-2025-0001"
                  className="pl-9 h-12 text-base font-mono"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 text-base font-semibold gap-2"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isLoading ? "Buscando..." : "Rastrear"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasSearched && error && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Si necesita ayuda, contáctenos por WhatsApp.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {ticket && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Ticket Header */}
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Número de Seguimiento
                    </p>
                    <CardTitle className="text-2xl font-mono text-primary">
                      {ticket.trackingNumber}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`px-3 py-1 text-sm font-semibold border ${STATUS_CONFIG[ticket.status]?.badgeClass}`}
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Origen</p>
                    <p className="font-semibold text-sm">{ticket.origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destino</p>
                    <p className="font-semibold text-sm">{ticket.destination}</p>
                  </div>
                </div>
                {ticket.cargoType && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo de Carga</p>
                      <p className="font-semibold text-sm">{ticket.cargoType}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Estado del Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-700"
                    style={{
                      height: `${currentStatusIndex <= 0 ? 0 : (currentStatusIndex / (TICKET_STATUSES.length - 1)) * 100}%`,
                    }}
                  />
                  <div className="space-y-6 relative">
                    {TICKET_STATUSES.map((status, index) => {
                      const config = STATUS_CONFIG[status];
                      const StatusIcon = config.icon;
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="flex items-center gap-4"
                        >
                          <div
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCompleted
                                ? `${config.bgColor} ${config.color} border-current`
                                : "bg-background border-muted text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                          >
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                              {config.label}
                              {isCurrent && (
                                <span className="ml-2 text-xs font-normal text-primary">(Estado actual)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">¿Tiene alguna pregunta?</p>
                  <p className="text-xs text-muted-foreground">Contáctenos por WhatsApp</p>
                </div>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50622222222"}?text=Consulta%20sobre%20env%C3%ADo%20${ticket.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="default" className="gap-2">
                    Contactar
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20 pb-16">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <TrackingContent />
        </Suspense>
      </main>
    </div>
  );
}
