"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema, TICKET_STATUSES, SERVICE_TYPES, DIRECTION_TYPES, LOAD_TYPES } from "@shared/schema";
import { z } from "zod";
import { useCreateTicket, useUpdateTicket, useTickets } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Clock, Check } from "lucide-react";

const formSchema = insertTicketSchema.extend({
  trackingNumber: z.string().min(1, "Número de seguimiento requerido"),
  clientName: z.string().min(1, "Nombre del cliente requerido"),
  origin: z.string().min(1, "Origen requerido"),
  destination: z.string().min(1, "Destino requerido"),
  requiresTransport: z.boolean().optional().default(false),
  requiresInspection: z.boolean().optional().default(false),
  requiresSenasa: z.boolean().optional().default(false),
  requiresProcomer: z.boolean().optional().default(false),
  requiresPrevioExamen: z.boolean().optional().default(false),
  requiresRevisionAforador: z.boolean().optional().default(false),
  paidDucaT: z.boolean().optional().default(false),
  paidBodegaje: z.boolean().optional().default(false),
  paidExoneracion: z.boolean().optional().default(false),
  paidTransporteInterno: z.boolean().optional().default(false),
  paidSeguro: z.boolean().optional().default(false),
  paidDua: z.boolean().optional().default(false),
  paidRetiroDocumento: z.boolean().optional().default(false),
  paidTerceros: z.boolean().optional().default(false),
  hasTaxes: z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const EMPTY_DEFAULTS: FormValues = {
  trackingNumber: "",
  clientName: "",
  origin: "",
  destination: "",
  status: "Nuevo",
  cargoType: null,
  serviceType: undefined,
  notes: "",
  assignedTo: null,
  supplier: "",
  fiscalWarehouse: "",
  forwarder: "",
  direction: undefined,
  loadType: undefined,
  agencyName: "",
  requiresTransport: false,
  supplierOrderNumber: "",
  transitTime: "",
  etaPort: "",
  blNumber: "",
  awbNumber: "",
  cpNumber: "",
  requiresInspection: false,
  requiresSenasa: false,
  requiresProcomer: false,
  policyReceiptNumber: "",
  movementNumber: "",
  requiresPrevioExamen: false,
  requiresRevisionAforador: false,
  paidDucaT: false,
  paidBodegaje: false,
  permitNumber: "",
  paidExoneracion: false,
  paidTransporteInterno: false,
  paidSeguro: false,
  paidDua: false,
  paidRetiroDocumento: false,
  paidTerceros: false,
  invoiceNumber: "",
  hasTaxes: false,
  liquidationNumber: "",
  receiptNumber: "",
};

// Aduana quick-select presets
const ADUANA_PRESETS = [
  {
    label: "Estándar",
    values: { requiresInspection: true, requiresSenasa: false, requiresProcomer: false, requiresPrevioExamen: false, requiresRevisionAforador: false },
  },
  {
    label: "Agrícola",
    values: { requiresInspection: true, requiresSenasa: true, requiresPrevioExamen: true, requiresRevisionAforador: true, requiresProcomer: false },
  },
  {
    label: "Electrónica",
    values: { requiresProcomer: true, requiresInspection: true, requiresSenasa: false, requiresPrevioExamen: false, requiresRevisionAforador: false },
  },
  {
    label: "Limpiar",
    values: { requiresInspection: false, requiresSenasa: false, requiresProcomer: false, requiresPrevioExamen: false, requiresRevisionAforador: false },
  },
];

interface Props {
  existingTicket?: any;
  trigger?: React.ReactNode;
  defaultStatus?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  prefill?: Partial<FormValues>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 pt-1">
      {children}
    </p>
  );
}

function CheckboxField({ form, name, label }: { form: any; name: keyof FormValues; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
        </FormItem>
      )}
    />
  );
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "hace menos de 1 min";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h ${minutes % 60}min`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

export function CreateTicketDialog({
  existingTicket,
  trigger,
  defaultStatus,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  prefill,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const [lastOpenedLabel, setLastOpenedLabel] = useState<string | null>(null);
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const { data: allTickets } = useTickets();
  const isEditing = !!existingTicket;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const selectedService = form.watch("serviceType");
  const requiresTransport = form.watch("requiresTransport");

  // Autocomplete suggestions from historical data
  const uniqueClients = useMemo(
    () => [...new Set((allTickets || []).map((t: any) => t.clientName).filter(Boolean))].sort() as string[],
    [allTickets],
  );
  const uniqueSuppliers = useMemo(
    () => [...new Set((allTickets || []).map((t: any) => t.supplier).filter(Boolean))].sort() as string[],
    [allTickets],
  );

  // Payment progress
  const paymentValues = form.watch([
    "paidDucaT", "paidBodegaje", "paidExoneracion", "paidTransporteInterno",
    "paidSeguro", "paidDua", "paidRetiroDocumento", "paidTerceros",
  ]);
  const paidCount = paymentValues.filter(Boolean).length;

  // Smart form: which shipment number fields to show
  const showBL = !selectedService || selectedService === "Marítimo" || selectedService === "Agencia Aduanal";
  const showAWB = !selectedService || selectedService === "Aéreo" || selectedService === "Agencia Aduanal";
  const showCP = !selectedService || selectedService === "Terrestre" || selectedService === "Agencia Aduanal";

  useEffect(() => {
    if (open) {
      if (existingTicket) {
        if (existingTicket.updatedAt) {
          const elapsed = Date.now() - new Date(existingTicket.updatedAt).getTime();
          setLastOpenedLabel(formatElapsed(elapsed));
        } else {
          setLastOpenedLabel(null);
        }
        form.reset({
          ...EMPTY_DEFAULTS,
          ...existingTicket,
          cargoType: existingTicket.cargoType || null,
          serviceType: existingTicket.serviceType || undefined,
          notes: existingTicket.notes || "",
          assignedTo: existingTicket.assignedTo || null,
        });
      } else {
        setLastOpenedLabel(null);
        const maxNum = allTickets && allTickets.length > 0
          ? Math.max(0, ...allTickets.map((t: any) => parseInt(t.trackingNumber) || 0))
          : 4687;
        form.reset({
          ...EMPTY_DEFAULTS,
          ...(prefill || {}),
          trackingNumber: String(maxNum + 1),
          status: defaultStatus || "Nuevo",
        });
      }
    }
  }, [open, existingTicket, defaultStatus, allTickets]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: existingTicket.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
    } catch {}
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2" data-testid="button-new-ticket">
              <Plus className="w-4 h-4" />
              Nueva Orden
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Orden" : "Nueva Orden de Ruteo"}</DialogTitle>
          {isEditing && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              {lastOpenedLabel ?? "Cargando..."}
            </p>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="overflow-y-auto max-h-[72vh] pr-2 space-y-5">

              {/* ── DATOS GENERALES ── */}
              <SectionTitle>Datos Generales</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Orden (ROGT)</FormLabel>
                    <FormControl><Input {...field} disabled={isEditing} data-testid="input-tracking-number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TICKET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Cliente con autocomplete */}
              <FormField control={form.control} name="clientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <>
                      <Input {...field} list="client-suggestions" placeholder="Nombre del cliente" data-testid="input-client-name" />
                      <datalist id="client-suggestions">
                        {uniqueClients.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Transporte + modo */}
              <div>
                <CheckboxField form={form} name="requiresTransport" label="Transporte" />
                {requiresTransport && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(["Marítimo", "Terrestre", "Aéreo"] as const).map((type) => {
                      const active = selectedService === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => form.setValue("serviceType", active ? undefined : type as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Suplidor con autocomplete */}
              <FormField control={form.control} name="supplier" render={({ field }) => (
                <FormItem>
                  <FormLabel>Suplido / Proveedor</FormLabel>
                  <FormControl>
                    <>
                      <Input {...field} value={field.value || ""} list="supplier-suggestions" placeholder="Nombre del proveedor" />
                      <datalist id="supplier-suggestions">
                        {uniqueSuppliers.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="origin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>País Salida</FormLabel>
                    <FormControl><Input {...field} placeholder="Ej: Colombia" data-testid="input-origin" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="destination" render={({ field }) => (
                  <FormItem>
                    <FormLabel>País Entrada</FormLabel>
                    <FormControl><Input {...field} placeholder="Ej: Costa Rica" data-testid="input-destination" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="fiscalWarehouse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacén Fiscal</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Almacén fiscal" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              {/* ── SERVICIO ── */}
              <SectionTitle>Servicio</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="direction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Import / Export" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {DIRECTION_TYPES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="loadType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contenedor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="FCL / LCL" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LOAD_TYPES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="agencyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Agencia</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Nombre de la agencia" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              {/* ── EMBARQUE ── */}
              <SectionTitle>Datos de Embarque</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="supplierOrderNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Orden Proveedor</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="N° de orden" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="transitTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo Tránsito</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Ej: 15 días" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="etaPort" render={({ field }) => (
                <FormItem>
                  <FormLabel>ETA Puerto CR</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} className="cursor-pointer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Smart form: show only relevant shipment number fields */}
              {(showBL || showAWB || showCP) && (
                <div className={`grid gap-4 ${[showBL, showAWB, showCP].filter(Boolean).length === 1 ? "grid-cols-1" : [showBL, showAWB, showCP].filter(Boolean).length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {showBL && (
                    <FormField control={form.control} name="blNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marítimo BL#</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="BL#" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {showAWB && (
                    <FormField control={form.control} name="awbNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aéreo AWB#</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="AWB#" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  {showCP && (
                    <FormField control={form.control} name="cpNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terrestre CP#</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="CP#" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              <Separator />

              {/* ── ADUANA / DUCA — SERVICIOS ADICIONALES ── */}
              <SectionTitle>Aduana / DUCA — Servicios Adicionales</SectionTitle>

              {/* Quick-select presets */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Selección rápida</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ADUANA_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        Object.entries(preset.values).forEach(([key, val]) => {
                          form.setValue(key as keyof FormValues, val);
                        });
                      }}
                      className="px-3 py-1 rounded-full border text-xs font-medium bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Requerimientos</p>
                <div className="grid grid-cols-3 gap-3">
                  <CheckboxField form={form} name="requiresInspection" label="Inspección" />
                  <CheckboxField form={form} name="requiresSenasa" label="SENASA" />
                  <CheckboxField form={form} name="requiresProcomer" label="PROCOMER" />
                  <CheckboxField form={form} name="requiresPrevioExamen" label="Previo-Examen" />
                  <CheckboxField form={form} name="requiresRevisionAforador" label="Revisión Aforador" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="policyReceiptNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel># Recibo Póliza</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="# Recibo" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="movementNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel># de Movimiento</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="# Movimiento" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              {/* ── PAGOS REALIZADOS ── */}
              <SectionTitle>Pagos Realizados</SectionTitle>

              {/* Payment progress bar */}
              <div className="mb-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{paidCount} de 8 pagos registrados</span>
                  <span className={paidCount === 8 ? "text-green-500 font-medium" : ""}>{Math.round((paidCount / 8) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${paidCount === 8 ? "bg-green-500" : paidCount >= 5 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${(paidCount / 8) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <CheckboxField form={form} name="paidDucaT" label="DUCA-T" />
                <CheckboxField form={form} name="paidBodegaje" label="Bodegaje" />
                <CheckboxField form={form} name="paidExoneracion" label="Exoneración" />
                <CheckboxField form={form} name="paidTransporteInterno" label="Transporte Interno" />
                <CheckboxField form={form} name="paidSeguro" label="Seguro" />
                <CheckboxField form={form} name="paidDua" label="DUA" />
                <CheckboxField form={form} name="paidRetiroDocumento" label="Retiro Documento" />
                <CheckboxField form={form} name="paidTerceros" label="Pagos a Terceros" />
              </div>

              <FormField control={form.control} name="permitNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Permiso #</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="# de permiso" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              {/* ── DATOS FINANCIEROS ── */}
              <SectionTitle>Datos Financieros</SectionTitle>

              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factura #</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Ej: 3246-553" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="pb-2">
                  <CheckboxField form={form} name="hasTaxes" label="Impuestos" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="liquidationNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota de Débito #</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="ND #" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="receiptNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recibo #</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Recibo #" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              {/* ── ANOTACIONES ── */}
              <SectionTitle>Anotaciones</SectionTitle>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Anotaciones adicionales..."
                      data-testid="input-notes"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-ticket">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Crear Orden"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
