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
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";

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
  cargoType: "Contenedor",
  serviceType: "Marítimo",
  notes: "",
  assignedTo: null,
  // Datos Generales
  supplier: "",
  fiscalWarehouse: "",
  forwarder: "",
  // Servicio
  direction: undefined,
  loadType: undefined,
  agencyName: "",
  requiresTransport: false,
  // Embarque
  supplierOrderNumber: "",
  transitTime: "",
  etaPort: "",
  blNumber: "",
  awbNumber: "",
  cpNumber: "",
  // Aduana
  requiresInspection: false,
  requiresSenasa: false,
  requiresProcomer: false,
  policyReceiptNumber: "",
  movementNumber: "",
  requiresPrevioExamen: false,
  requiresRevisionAforador: false,
  // Pagos
  paidDucaT: false,
  paidBodegaje: false,
  permitNumber: "",
  paidExoneracion: false,
  paidTransporteInterno: false,
  paidSeguro: false,
  paidDua: false,
  paidRetiroDocumento: false,
  paidTerceros: false,
  // Financiero
  invoiceNumber: "",
  hasTaxes: false,
  liquidationNumber: "",
  receiptNumber: "",
};

interface Props {
  existingTicket?: any;
  trigger?: React.ReactNode;
  defaultStatus?: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 pt-1">
      {children}
    </p>
  );
}

function CheckboxField({
  form,
  name,
  label,
}: {
  form: any;
  name: keyof FormValues;
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
        </FormItem>
      )}
    />
  );
}

export function CreateTicketDialog({ existingTicket, trigger, defaultStatus }: Props) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const { data: allTickets } = useTickets();
  const isEditing = !!existingTicket;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      if (existingTicket) {
        form.reset({
          ...EMPTY_DEFAULTS,
          ...existingTicket,
          cargoType: existingTicket.cargoType || "Contenedor",
          serviceType: existingTicket.serviceType || "Marítimo",
          notes: existingTicket.notes || "",
          assignedTo: existingTicket.assignedTo || null,
        });
      } else {
        const maxNum = allTickets && allTickets.length > 0
          ? Math.max(0, ...allTickets.map((t: any) => parseInt(t.trackingNumber) || 0))
          : 4687;
        form.reset({
          ...EMPTY_DEFAULTS,
          trackingNumber: String(maxNum + 1),
          status: defaultStatus || "Nuevo",
        });
      }
    }
  }, [open, existingTicket, form, defaultStatus, allTickets]);

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
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-new-ticket">
            <Plus className="w-4 h-4" />
            Nueva Orden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Orden" : "Nueva Orden de Ruteo"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Scrollable body */}
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

              <FormField control={form.control} name="clientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl><Input {...field} placeholder="Nombre del cliente" data-testid="input-client-name" /></FormControl>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="forwarder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forwarder</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Agente de carga" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fiscalWarehouse" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén Fiscal</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Almacén fiscal" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="supplier" render={({ field }) => (
                <FormItem>
                  <FormLabel>Suplido / Proveedor</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Nombre del proveedor" /></FormControl>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="serviceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Servicio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cargoType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mercancía</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["Contenedor", "Pallet", "Caja", "Vehículo", "Otro"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField control={form.control} name="agencyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agencia</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Nombre de la agencia" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="pb-2">
                  <CheckboxField form={form} name="requiresTransport" label="Transporte" />
                </div>
              </div>

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
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Fecha estimada de arribo" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="blNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marítimo BL#</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="BL#" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="awbNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aéreo AWB#</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="AWB#" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cpNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terrestre CP#</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="CP#" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              {/* ── ADUANA / DUCA ── */}
              <SectionTitle>Aduana / DUCA</SectionTitle>

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
                    <FormLabel>Liquidación # (LIQ)</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="LIQ #" /></FormControl>
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

            </div>{/* end scroll area */}

            {/* Sticky footer */}
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
