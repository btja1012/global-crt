import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CargoInput, type CargoUpdateInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch all cargos (Admin)
export function useCargos() {
  return useQuery({
    queryKey: [api.cargos.list.path],
    queryFn: async () => {
      const res = await fetch(api.cargos.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch cargos");
      return api.cargos.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single cargo by ID (Admin)
export function useCargo(id: number) {
  return useQuery({
    queryKey: [api.cargos.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cargos.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cargo");
      return api.cargos.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Public tracking endpoint
export function useTrackCargo(trackingNumber: string) {
  return useQuery({
    queryKey: [api.cargos.track.path, trackingNumber],
    queryFn: async () => {
      const url = buildUrl(api.cargos.track.path, { trackingNumber });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to track cargo");
      return api.cargos.track.responses[200].parse(await res.json());
    },
    enabled: !!trackingNumber && trackingNumber.length > 0,
    retry: false,
  });
}

// Create new cargo (Admin)
export function useCreateCargo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CargoInput) => {
      const res = await fetch(api.cargos.create.path, {
        method: api.cargos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to create shipment");
      }
      return api.cargos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cargos.list.path] });
      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update cargo (Admin)
export function useUpdateCargo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & CargoUpdateInput) => {
      const url = buildUrl(api.cargos.update.path, { id });
      const res = await fetch(url, {
        method: api.cargos.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to update shipment");
      }
      return api.cargos.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cargos.list.path] });
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete cargo (Admin)
export function useDeleteCargo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cargos.delete.path, { id });
      const res = await fetch(url, {
        method: api.cargos.delete.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to delete shipment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cargos.list.path] });
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
