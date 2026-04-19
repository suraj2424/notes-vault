'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const err = event.error;
      if (err) {
        console.error('Uncaught error:', err);
        setError(err);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

   if (hasError) {
     let errorMessage = "Something went wrong. Please try again later.";
     
     try {
       const parsedError = JSON.parse(error?.message || "");
       if (parsedError.error && parsedError.error.includes("insufficient permissions")) {
         errorMessage = "You don't have permission to perform this action. Please check your account settings.";
       }
     } catch (e) {
       // Not a JSON error, use default
     }

     return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-[#0f0f0f]">
         <div className="mb-6 flex h-20 w-20 items-center justify-center border border-neutral-200 text-neutral-400 dark:border-[#2a2a2a] dark:text-[#555555]">
           <AlertCircle className="h-10 w-10" />
         </div>
         <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#ededed]">Application Error</h1>
         <p className="mb-8 max-w-md text-neutral-500 dark:text-[#888888]">{errorMessage}</p>
         <button
           onClick={() => window.location.reload()}
           className="flex items-center gap-2 border border-neutral-200 bg-[#1a1a1a] px-8 py-3 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
         >
           <RefreshCcw className="h-4 w-4" />
           Reload Application
         </button>
       </div>
     );
   }

  return children;
}
