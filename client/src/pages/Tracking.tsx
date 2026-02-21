import { useRoute, Link } from "wouter";
import { useTrackCargo } from "@/hooks/use-cargos";
import { Navigation } from "@/components/Navigation";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Box, MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Tracking() {
  const [, params] = useRoute("/track/:trackingNumber");
  const trackingNumber = params?.trackingNumber || "";
  
  const { data: cargo, isLoading, error } = useTrackCargo(trackingNumber);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container max-w-5xl mx-auto px-4 py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-6 -ml-4 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : error || !cargo ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Shipment Not Found</AlertTitle>
            <AlertDescription>
              We couldn't find a shipment with tracking number <strong>{trackingNumber}</strong>. 
              Please verify the number and try again.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Card */}
            <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                  Tracking Number
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary font-mono tracking-tight">
                  {cargo.trackingNumber}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Box className="w-4 h-4" />
                  <span>{cargo.cargoType || "Standard Cargo"}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground font-semibold mb-1">Current Status</div>
                <div className={`
                  inline-flex px-4 py-1 rounded-full text-sm font-bold border
                  ${cargo.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' : 
                    cargo.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'}
                `}>
                  {cargo.status}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline status={cargo.status} date={cargo.createdAt?.toString()} />
              </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Route Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-dashed">
                    <span className="text-muted-foreground">Origin</span>
                    <span className="font-semibold text-lg">{cargo.origin}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-dashed">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="font-semibold text-lg">{cargo.destination}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    Delivery Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-dashed">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="font-semibold">
                      {cargo.estimatedDelivery 
                        ? format(new Date(cargo.estimatedDelivery), "MMMM d, yyyy") 
                        : "Calculating..."}
                    </span>
                  </div>
                  {cargo.notes && (
                    <div className="py-3">
                      <span className="text-muted-foreground block mb-2">Notes</span>
                      <p className="text-sm bg-muted p-3 rounded-lg border">
                        {cargo.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
