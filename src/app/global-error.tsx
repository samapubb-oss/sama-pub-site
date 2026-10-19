"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#07162C] text-white flex flex-col items-center justify-center px-4 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
          Une erreur globale est survenue
        </h1>
        <p className="text-slate-300 max-w-md mb-8 text-sm sm:text-base">
          Nous nous excusons pour ce désagrément. Veuillez recharger la page.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#E05E00] transition-all cursor-pointer shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Recharger l'application</span>
        </button>
      </body>
    </html>
  );
}
