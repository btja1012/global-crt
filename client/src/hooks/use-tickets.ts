import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { TicketWithDetails } from "@shared/schema";

export function useTickets() {
  return useQuery<TicketWithDetails[]>({
    queryKey: ["/api/tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets", { credentials: "include" });
      if (res.status === 401) throw new Error("401: Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
  });
}

export function useTicket(id: number) {
  return useQuery<TicketWithDetails>({
    queryKey: ["/api/tickets", id],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/tickets/:id", { id }), { credentials: "include" });
      if (res.status === 401) throw new Error("401: Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear ticket");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number;[key: string]: any }) => {
      const res = await fetch(buildUrl("/api/tickets/:id", { id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl("/api/tickets/:id", { id }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket eliminado" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: number; content: string }) => {
      const res = await fetch(buildUrl("/api/tickets/:ticketId/comments", { ticketId }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al agregar comentario");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, file }: { ticketId: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(buildUrl("/api/tickets/:ticketId/attachments", { ticketId }), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al subir archivo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
  });
}
