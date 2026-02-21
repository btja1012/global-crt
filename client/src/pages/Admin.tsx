import { useAuth } from "@/hooks/use-auth";
import { redirectToLogin } from "@/lib/auth-utils";
import { useEffect, useState } from "react";
import { useCargos, useDeleteCargo } from "@/hooks/use-cargos";
import { Navigation } from "@/components/Navigation";
import { CreateCargoDialog } from "@/components/CreateCargoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Auth Check
  useEffect(() => {
    if (!authLoading && !user) {
      redirectToLogin((props) => toast(props));
    }
  }, [user, authLoading, toast]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navigation />
      <main className="container max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipment Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all ongoing logistics operations.
            </p>
          </div>
          <CreateCargoDialog />
        </div>

        <CargosTable />
      </main>
    </div>
  );
}

function CargosTable() {
  const { data: cargos, isLoading } = useCargos();
  const deleteMutation = useDeleteCargo();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filter cargos
  const filteredCargos = cargos?.filter((cargo) => 
    cargo.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    cargo.clientName.toLowerCase().includes(search.toLowerCase()) ||
    cargo.origin.toLowerCase().includes(search.toLowerCase()) ||
    cargo.destination.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-xl bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search shipments..." 
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px]">Tracking Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCargos.map((cargo) => (
                <TableRow key={cargo.id} className="group hover:bg-muted/30">
                  <TableCell className="font-medium font-mono text-primary">
                    {cargo.trackingNumber}
                  </TableCell>
                  <TableCell>{cargo.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground">{cargo.origin}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{cargo.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${cargo.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        cargo.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {cargo.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {cargo.estimatedDelivery ? (
                      format(new Date(cargo.estimatedDelivery), "MMM d, yyyy")
                    ) : (
                      <span className="text-muted-foreground text-xs italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <CreateCargoDialog 
                          existingCargo={cargo} 
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(cargo.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
