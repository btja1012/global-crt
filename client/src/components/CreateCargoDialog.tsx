import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCargoSchema } from "@shared/schema";
import { z } from "zod";
import { useCreateCargo, useUpdateCargo } from "@/hooks/use-cargos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, Plus, PenSquare } from "lucide-react";

// Add validation for required fields
const formSchema = insertCargoSchema.extend({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  clientName: z.string().min(1, "Client name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  existingCargo?: any; // If provided, it's an edit mode
  trigger?: React.ReactNode;
}

export function CreateCargoDialog({ existingCargo, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCargo();
  const updateMutation = useUpdateCargo();
  
  const isEditing = !!existingCargo;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: "",
      clientName: "",
      origin: "",
      destination: "",
      status: "Pending",
      cargoType: "Container",
      notes: "",
      estimatedDelivery: undefined,
    },
  });

  // Reset form when opening/closing or changing existingCargo
  useEffect(() => {
    if (open) {
      if (existingCargo) {
        form.reset({
          ...existingCargo,
          estimatedDelivery: existingCargo.estimatedDelivery ? new Date(existingCargo.estimatedDelivery) : undefined,
          // Handle nulls
          cargoType: existingCargo.cargoType || "",
          notes: existingCargo.notes || "",
        });
      } else {
        form.reset({
          trackingNumber: `TRK-${Math.floor(Math.random() * 1000000)}`, // Auto-generate suggestion
          clientName: "",
          origin: "",
          destination: "",
          status: "Pending",
          cargoType: "Container",
          notes: "",
        });
      }
    }
  }, [open, existingCargo, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: existingCargo.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="w-4 h-4" />
            New Shipment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="TRK-123456" disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Customs">Customs</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Global Corp Ltd." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San José, CR" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Miami, USA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="cargoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Container">Container</SelectItem>
                        <SelectItem value="Pallet">Pallet</SelectItem>
                        <SelectItem value="Box">Box</SelectItem>
                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Fragile, Handle with care..." value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Shipment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
