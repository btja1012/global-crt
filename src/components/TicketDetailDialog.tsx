"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddComment, useUploadAttachment, useDeleteComment, useTicketHistory } from "@/hooks/use-tickets";
import type { TicketWithDetails } from "@shared/schema";
import {
  MessageSquare, Paperclip, Send, FileText, Loader2,
  MapPin, Package, Calendar, Truck, Trash2, History, User, Printer, Eye, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  ticket: TicketWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_LABELS: Record<string, string> = {
  created: "Orden creada",
  updated: "Orden actualizada",
  deleted: "Orden eliminada",
  restored: "Orden restaurada",
};

const FIELD_LABELS: Record<string, string> = {
  status: "Estado",
  clientName: "Cliente",
  origin: "Origen",
  destination: "Destino",
  serviceType: "Tipo de servicio",
  cargoType: "Tipo de carga",
  notes: "Notas",
  assignedTo: "Asignado a",
  direction: "Dirección",
  etaPort: "ETA Puerto",
  blNumber: "BL",
  awbNumber: "AWB",
};

export function TicketDetailDialog({ ticket, open, onOpenChange }: Props) {
  const [commentText, setCommentText] = useState("");
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; isPdf: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openPreview = useCallback((url: string, name: string) => {
    const isPdf = /\.pdf$/i.test(name);
    setPreviewFile({ url, name, isPdf });
  }, []);
  const addComment = useAddComment();
  const uploadAttachment = useUploadAttachment();
  const deleteComment = useDeleteComment();
  const { data: history = [] } = useTicketHistory(ticket?.id ?? 0);

  if (!ticket) return null;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment.mutateAsync({ ticketId: ticket.id, content: commentText.trim() });
    setCommentText("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAttachment.mutateAsync({ ticketId: ticket.id, file });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Nuevo": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "En Proceso": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "Aduana": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "En Tránsito": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "Facturar": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Facturado": return "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold">{ticket.trackingNumber}</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">{ticket.clientName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
        </DialogHeader>

        <div className="px-6 pt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-1 w-fit">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="comments" className="gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Comentarios {ticket.comments?.length > 0 && `(${ticket.comments.length})`}
            </TabsTrigger>
            <TabsTrigger value="attachments" className="gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              Archivos {ticket.attachments?.length > 0 && `(${ticket.attachments.length})`}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              <History className="w-3.5 h-3.5" />
              Historial {history.length > 0 && `(${history.length})`}
            </TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Origen: </span><span className="font-medium">{ticket.origin}</span></div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Destino: </span><span className="font-medium">{ticket.destination}</span></div>
                </div>
                {ticket.serviceType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <div><span className="text-muted-foreground">Servicio: </span><span className="font-medium">{ticket.serviceType}</span></div>
                  </div>
                )}
                {ticket.cargoType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div><span className="text-muted-foreground">Carga: </span><span className="font-medium">{ticket.cargoType}</span></div>
                  </div>
                )}
                {ticket.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div><span className="text-muted-foreground">Creado: </span><span className="font-medium">{format(new Date(ticket.createdAt), "d MMM yyyy", { locale: es })}</span></div>
                  </div>
                )}
              </div>
              {ticket.notes && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm mt-4">
                  <p className="text-muted-foreground font-medium mb-1">Notas</p>
                  <p>{ticket.notes}</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* COMMENTS */}
          <TabsContent value="comments" className="flex-1 min-h-0 mt-0 flex flex-col">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-3">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group" data-testid={`comment-${comment.id}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {comment.userName?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          {comment.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: es })}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteComment.mutate(comment.id)}
                            disabled={deleteComment.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin comentarios</p>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                  data-testid="input-comment"
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addComment.isPending}
                  data-testid="button-send-comment"
                >
                  {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ATTACHMENTS */}
          <TabsContent value="attachments" className="flex-1 min-h-0 mt-0 flex flex-col">
            <div className="px-6 pt-4 pb-2 flex justify-end">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                data-testid="input-file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachment.isPending}
                data-testid="button-upload-file"
              >
                {uploadAttachment.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Paperclip className="w-4 h-4 mr-1" />}
                Subir archivo
              </Button>
            </div>
            <ScrollArea className="flex-1 px-6 pb-4">
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ticket.attachments.map((att) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName);
                    const isPdf = /\.pdf$/i.test(att.fileName);
                    const canPreview = isImage || isPdf;
                    return (
                      <div
                        key={att.id}
                        className="group relative rounded-lg border bg-muted/30 p-2 flex flex-col items-center gap-1 hover:bg-muted/60 transition-colors cursor-pointer"
                        onClick={() => canPreview ? openPreview(att.fileUrl, att.fileName) : window.open(att.fileUrl, "_blank")}
                        data-testid={`attachment-${att.id}`}
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={att.fileUrl} alt={att.fileName} className="w-full h-20 object-cover rounded" />
                        ) : (
                          <div className="w-full h-20 flex items-center justify-center relative">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                            {isPdf && (
                              <span className="absolute bottom-1 right-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1 rounded">PDF</span>
                            )}
                          </div>
                        )}
                        <span className="text-xs truncate w-full text-center text-muted-foreground">{att.fileName}</span>
                        {canPreview && (
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5">
                            <Eye className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5"
                        >
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Sin archivos adjuntos</p>
              )}
            </ScrollArea>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-6 py-4">
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((log) => {
                    const changes = log.changes ? JSON.parse(log.changes) as { field: string; from: unknown; to: unknown }[] : [];
                    return (
                      <div key={log.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{log.userName}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                            {log.createdAt && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                              </span>
                            )}
                          </div>
                          {changes.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {changes.map((c, i) => (
                                <p key={i} className="text-xs text-muted-foreground">
                                  <span className="font-medium">{FIELD_LABELS[c.field] || c.field}:</span>{" "}
                                  <span className="line-through opacity-60">{String(c.from ?? "—")}</span>
                                  {" → "}
                                  <span>{String(c.to ?? "—")}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Sin historial de cambios</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* File preview dialog */}
    {previewFile && (
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-sm font-medium truncate">{previewFile.name}</DialogTitle>
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 p-4">
            {previewFile.isPdf ? (
              <iframe
                src={previewFile.url}
                className="w-full rounded border"
                style={{ height: "70vh" }}
                title={previewFile.name}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
