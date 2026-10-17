"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import { X } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";

export const WhatsAppFloat: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    "Bonjour SAMA PUB, je souhaite discuter d'un projet publicitaire pour mon entreprise."
  )}`;

  return (
    <aside aria-label="Contact direct WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip bubble on desktop */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-full shadow-xl border border-slate-200 animate-in fade-in slide-in-from-right-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Une question ? Échangez sur WhatsApp</span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 ml-1 p-0.5 rounded-full"
            aria-label="Fermer l'infobulle"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter directement avec SAMA PUB sur WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 relative group"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sama-orange rounded-full border-2 border-white" />
        <WhatsAppIcon className="w-8 h-8 shrink-0" />
      </a>
    </aside>
  );
};
