"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAddComment, useUploadAttachment } from "@/hooks/use-tickets";
import type { TicketWithDetails } from "@shared/schema";
import { MessageSquare, Paperclip, Send, FileText, Loader2, MapPin, Package, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  ticket: TicketWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailDialog({ ticket, open, onOpenChange }: Props) {
  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addComment = useAddComment();
  const uploadAttachment = useUploadAttachment();

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
      case "Entregado": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
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

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Origen: </span>
                <span className="font-medium">{ticket.origin}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Destino: </span>
                <span className="font-medium">{ticket.destination}</span>
              </div>
            </div>
            {ticket.cargoType && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Tipo: </span>
                  <span className="font-medium">{ticket.cargoType}</span>
                </div>
              </div>
            )}
            {ticket.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Creado: </span>
                  <span className="font-medium">{format(new Date(ticket.createdAt), "d MMM yyyy", { locale: es })}</span>
                </div>
              </div>
            )}
          </div>

          {ticket.notes && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm mb-4">
              <p className="text-muted-foreground font-medium mb-1">Notas</p>
              <p>{ticket.notes}</p>
            </div>
          )}

          <Separator />

          {/* Attachments */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Archivos adjuntos ({ticket.attachments?.length || 0})
              </h3>
              <div>
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
                  {uploadAttachment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Paperclip className="w-4 h-4 mr-1" />
                  )}
                  Subir archivo
                </Button>
              </div>
            </div>
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ticket.attachments.map((att) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName);
                  return (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-lg border bg-muted/30 p-2 flex flex-col items-center gap-1 hover:bg-muted/60 transition-colors"
                      data-testid={`attachment-${att.id}`}
                    >
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={att.fileUrl} alt={att.fileName} className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="w-full h-20 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-xs truncate w-full text-center text-muted-foreground">{att.fileName}</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin archivos adjuntos</p>
            )}
          </div>

          <Separator />

          {/* Comments */}
          <div className="py-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" />
              Comentarios ({ticket.comments?.length || 0})
            </h3>
            <div className="space-y-3">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
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
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Sin comentarios</p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Comment Input */}
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
      </DialogContent>
    </Dialog>
  );
}
