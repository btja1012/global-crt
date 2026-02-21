import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema, TICKET_STATUSES } from "@shared/schema";
import { z } from "zod";
import { useCreateTicket, useUpdateTicket } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";

const formSchema = insertTicketSchema.extend({
  trackingNumber: z.string().min(1, "Número de seguimiento requerido"),
  clientName: z.string().min(1, "Nombre del cliente requerido"),
  origin: z.string().min(1, "Origen requerido"),
  destination: z.string().min(1, "Destino requerido"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  existingTicket?: any;
  trigger?: React.ReactNode;
  defaultStatus?: string;
}

export function CreateTicketDialog({ existingTicket, trigger, defaultStatus }: Props) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const isEditing = !!existingTicket;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: "",
      clientName: "",
      origin: "",
      destination: "",
      status: defaultStatus || "Nuevo",
      cargoType: "Contenedor",
      notes: "",
      assignedTo: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (existingTicket) {
        form.reset({
          ...existingTicket,
          cargoType: existingTicket.cargoType || "",
          notes: existingTicket.notes || "",
          assignedTo: existingTicket.assignedTo || null,
        });
      } else {
        form.reset({
          trackingNumber: `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          clientName: "",
          origin: "",
          destination: "",
          status: defaultStatus || "Nuevo",
          cargoType: "Contenedor",
          notes: "",
          assignedTo: null,
        });
      }
    }
  }, [open, existingTicket, form, defaultStatus]);

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
            Nuevo Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Ticket" : "Crear Nuevo Ticket"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Seguimiento</FormLabel>
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
                  <FormLabel>Origen</FormLabel>
                  <FormControl><Input {...field} placeholder="Miami, USA" data-testid="input-origin" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl><Input {...field} placeholder="San José, CR" data-testid="input-destination" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="cargoType" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Carga</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["Contenedor", "Pallet", "Caja", "Vehículo", "Otro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (Opcional)</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} placeholder="Detalles adicionales..." data-testid="input-notes" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-ticket">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Guardar" : "Crear Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
