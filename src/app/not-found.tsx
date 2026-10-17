import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07162C] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sama-orange/20 border border-sama-orange/40 flex items-center justify-center text-sama-orange mb-6 text-2xl font-black">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
        Page introuvable
      </h1>
      <p className="text-slate-300 max-w-md mb-8 text-sm sm:text-base">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sama-orange text-white font-bold text-sm hover:bg-sama-orange-hover transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l'accueil SAMA PUB</span>
      </Link>
    </div>
  );
}
