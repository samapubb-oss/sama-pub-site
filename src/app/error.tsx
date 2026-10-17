"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur d'application capturée:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07162C] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
        Une erreur inattendue est survenue
      </h1>
      <p className="text-slate-300 max-w-md mb-8 text-sm sm:text-base">
        Nous nous excusons pour ce désagrément. Veuillez actualiser la page ou revenir à l'accueil.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sama-orange text-white font-bold text-sm hover:bg-sama-orange-hover transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all border border-white/20"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>
    </div>
  );
}
