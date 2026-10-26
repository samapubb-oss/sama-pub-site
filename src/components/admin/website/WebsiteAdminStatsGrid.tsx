"use client";

import React from "react";
import { Globe, Clock, RotateCw, Send } from "lucide-react";

interface WebsiteAdminStatsGridProps {
  totalLeads: number;
  pendingCount: number;
  inProgressCount: number;
  sentCount: number;
  activeFilter?: string;
  onFilterChange?: (status: string) => void;
}

export const WebsiteAdminStatsGrid: React.FC<WebsiteAdminStatsGridProps> = ({
  totalLeads,
  pendingCount,
  inProgressCount,
  sentCount,
  activeFilter = "all",
  onFilterChange,
}) => {
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
    const tableEl = document.getElementById("website-leads-table");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
      {/* 1. Demandes Web reçues (Toutes) */}
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
            ? "border-sky-300 ring-2 ring-sky-500/80 shadow-md shadow-sky-500/10 bg-sky-50/20"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour afficher toutes les demandes de sites web"
      >
        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              Demandes Web
            </span>
            {isAllActive && (
              <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Toutes
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {totalLeads}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block font-normal">
            {totalLeads > 0 ? "Total commandes web" : "Aucune pour l'instant"}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-600 self-center shrink-0 bg-sky-50 group-hover:bg-sky-100 px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-300 group-hover:scale-110" />
          <span>{totalLeads > 0 ? `+${totalLeads}` : "0"}</span>
        </div>
      </div>

      {/* 2. À traiter (Nouveaux projets de sites web) */}
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
            ? "border-blue-400 ring-2 ring-blue-500/80 shadow-md shadow-blue-500/10 bg-blue-50/25"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour filtrer les projets web à traiter"
      >
        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              À traiter
            </span>
            {isPendingActive && (
              <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Filtré
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {pendingCount}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block font-normal">
            Réponse sous 24h
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 self-center shrink-0 bg-blue-50 group-hover:bg-blue-100 px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-300 group-hover:scale-110" />
          <span>{pendingCount}</span>
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
            ? "border-sky-400 ring-2 ring-sky-500/80 shadow-md shadow-sky-500/10 bg-sky-50/25"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour filtrer les projets web en cours"
      >
        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
              En cours
            </span>
            {isInProgressActive && (
              <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                Filtré
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1 transition-transform duration-300 group-hover:scale-105 origin-left">
            {inProgressCount}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block font-normal">
            En cadrage / échange
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-600 self-center shrink-0 bg-sky-50 group-hover:bg-sky-100 px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
          <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-300 group-hover:rotate-180" />
          <span>{inProgressCount}</span>
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
            ? "border-emerald-400 ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/10 bg-emerald-50/25"
            : "border-slate-100 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-1.5"
        }`}
        title="Cliquer pour filtrer les devis web envoyés"
      >
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
            {sentCount}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block font-normal">
            Propositions transmises
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 self-center shrink-0 bg-emerald-50 group-hover:bg-emerald-100 px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
          <span>{sentCount}</span>
        </div>
      </div>
    </div>
  );
};
