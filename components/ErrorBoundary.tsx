'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error && parsedError.error.includes("insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check your account settings.";
        }
      } catch (e) {
        // Not a JSON error, use default
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 font-sans text-3xl font-bold text-neutral-900">Application Error</h1>
          <p className="mb-8 max-w-md text-neutral-500">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
