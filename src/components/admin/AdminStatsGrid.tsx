"use client";

import React from "react";
import { TrendingUp, Clock, RotateCw, Send } from "lucide-react";

interface AdminStatsGridProps {
  totalLeads: number;
  pendingCount: number;
  inProgressCount: number;
  sentCount: number;
  activeFilter?: string;
  onFilterChange?: (status: string) => void;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  totalLeads,
  pendingCount,
  inProgressCount,
  sentCount,
  activeFilter = "all",
  onFilterChange,
}) => {
  const pad = (n: number) => (n === 0 ? "0" : n < 10 ? `0${n}` : `${n}`);

  const isAllActive = activeFilter === "all";
  const isPendingActive =
    activeFilter === "a_traiter" ||
    activeFilter === "nouveau" ||
    activeFilter === "new" ||
    activeFilter === "contacted";
  const isInProgressActive = activeFilter === "en_cours" || activeFilter === "won";
  const isSentActive = activeFilter === "devis_envoye" || activeFilter === "quote_sent";

  const handleCardClick = (statusKey: string) => {
    if (onFilterChange) {
      onFilterChange(statusKey);
    }
    // Smooth scroll to table
    const tableEl = document.getElementById("leads-table");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
      {/* 1. Demandes reçues (Toutes) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick("all")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick("all");
          }
        }}
        className={`group relative bg-white rounded-2xl p-3.5 sm:p-5 lg:p-6 border transition-all duration-300 ease-out cursor-pointer flex items-center justify-between overflow-hidden select-none ${
          isAllActive
            ? "border-orange-300 ring-2 ring-sama-orange/80 shadow-md shadow-orange-500/10 bg-orange-50/15"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour afficher toutes les demandes"
      >
        {/* Decorative background glow on hover */}
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/15 transition-all duration-300 pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              Demandes reçues
            </span>
            {isAllActive && (
              <span className="text-[9px] font-bold text-sama-orange bg-orange-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Tous
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {totalLeads}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block font-normal">
            {totalLeads > 0 ? "Total en base Supabase" : "Aucune pour l'instant"}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-1 text-xs sm:text-sm font-bold text-sama-orange self-center shrink-0 bg-orange-50/80 group-hover:bg-orange-100 px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-300 group-hover:scale-110" />
          <span>{totalLeads > 0 ? `+${totalLeads}` : "0"}</span>
        </div>
      </div>

      {/* 2. À traiter (Nouveaux devis sous 24h) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick("a_traiter")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick("a_traiter");
          }
        }}
        className={`group relative bg-white rounded-2xl p-3.5 sm:p-5 lg:p-6 border transition-all duration-300 ease-out cursor-pointer flex items-center justify-between overflow-hidden select-none ${
          isPendingActive
            ? "border-blue-300 ring-2 ring-blue-500/80 shadow-md shadow-blue-500/10 bg-blue-50/15"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour afficher tous les devis à traiter"
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/15 transition-all duration-300 pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              À traiter
            </span>
            {isPendingActive && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Filtré
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {pad(pendingCount)}
          </div>
          <span className="text-[10px] sm:text-xs text-blue-500/80 mt-0.5 hidden sm:block font-medium truncate">
            {pendingCount > 0 ? "À traiter sous 24h" : "À jour"}
          </span>
        </div>

        <div
          className={`relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-xs ${
            isPendingActive
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-500 group-hover:bg-blue-100 group-hover:text-blue-600"
          }`}
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* 3. En cours */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick("en_cours")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick("en_cours");
          }
        }}
        className={`group relative bg-white rounded-2xl p-3.5 sm:p-5 lg:p-6 border transition-all duration-300 ease-out cursor-pointer flex items-center justify-between overflow-hidden select-none ${
          isInProgressActive
            ? "border-sky-300 ring-2 ring-sky-500/80 shadow-md shadow-sky-500/10 bg-sky-50/15"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour afficher les devis en cours de qualification"
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/15 transition-all duration-300 pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              En cours
            </span>
            {isInProgressActive && (
              <span className="text-[9px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Filtré
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {pad(inProgressCount)}
          </div>
          <span className="text-[10px] sm:text-xs text-sky-600/80 mt-0.5 hidden sm:block font-medium truncate">
            {inProgressCount > 0 ? "En qualification" : "0 en cours"}
          </span>
        </div>

        <div
          className={`relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-180 shadow-xs ${
            isInProgressActive
              ? "bg-sky-600 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
          }`}
        >
          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
        </div>
      </div>

      {/* 4. Devis envoyés */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick("devis_envoye")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick("devis_envoye");
          }
        }}
        className={`group relative bg-white rounded-2xl p-3.5 sm:p-5 lg:p-6 border transition-all duration-300 ease-out cursor-pointer flex items-center justify-between overflow-hidden select-none ${
          isSentActive
            ? "border-emerald-300 ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/10 bg-emerald-50/15"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour afficher tous les devis envoyés"
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-all duration-300 pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              Devis envoyés
            </span>
            {isSentActive && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Filtré
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {pad(sentCount)}
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-600/80 mt-0.5 hidden sm:block font-medium truncate">
            {sentCount > 0 ? "Propositions actives" : "0 transmis"}
          </span>
        </div>

        <div
          className={`relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:translate-x-1 shadow-xs ${
            isSentActive
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"
          }`}
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};
