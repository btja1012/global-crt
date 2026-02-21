import { motion } from "framer-motion";
import { Check, Truck, Package, Ship, MapPin } from "lucide-react";
import { format } from "date-fns";

type Status = 'Pending' | 'In Transit' | 'Customs' | 'Delivered';

const STEPS: { status: Status; icon: any; label: string }[] = [
  { status: 'Pending', icon: Package, label: 'Order Processed' },
  { status: 'In Transit', icon: Ship, label: 'In Transit' },
  { status: 'Customs', icon: MapPin, label: 'Customs Clearance' },
  { status: 'Delivered', icon: Truck, label: 'Delivered' },
];

export function TrackingTimeline({ status, date }: { status: string; date?: string | Date }) {
  const currentStepIndex = STEPS.findIndex((s) => s.status === status);
  const normalizedIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(normalizedIndex / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, index) => {
          const isCompleted = index <= normalizedIndex;
          const isCurrent = index === normalizedIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-4 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : 'bg-background border-muted text-muted-foreground'}
                `}
              >
                {isCompleted ? <step.icon className="w-5 h-5" /> : <step.icon className="w-5 h-5 opacity-50" />}
              </motion.div>
              
              <div className="absolute top-14 w-32 text-center">
                <p className={`text-sm font-semibold transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                {isCurrent && date && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    {format(new Date(date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
