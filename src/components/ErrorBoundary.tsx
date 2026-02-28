"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="font-semibold">Algo salió mal</p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message || "Error inesperado en el panel"}
            </p>
          </div>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            Reintentar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
