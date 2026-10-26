"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Eye,
  ChevronDown,
  Check,
  Building2,
  Calendar,
  Clock,
  Inbox,
  Globe,
  Sparkles,
  Zap,
  TrendingUp,
  Layout,
  Layers,
  Hourglass,
  Tag,
} from "lucide-react";
import type { LeadQuote } from "@/components/admin/LeadsTable";
import { parseWebsiteOrderDetails } from "@/lib/website-lead-parser";

interface WebsiteLeadsTableProps {
  leads: LeadQuote[];
  selectedLeadId: string | null;
  onSelectLead: (lead: LeadQuote) => void;
  onInspectLead?: (lead: LeadQuote) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onExportCSV: () => void;
}

const statusConfig: Record<
  string,
  { label: string; dotColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  nouveau: {
    label: "À traiter",
    dotColor: "bg-blue-600",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-100",
  },
  new: {
    label: "À traiter",
    dotColor: "bg-blue-600",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-100",
  },
  a_traiter: {
    label: "À traiter",
    dotColor: "bg-blue-600",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-100",
  },
  contacted: {
    label: "À traiter",
    dotColor: "bg-blue-600",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-100",
  },
  en_cours: {
    label: "En cours",
    dotColor: "bg-sky-500",
    bgClass: "bg-sky-50",
    textClass: "text-sky-700",
    borderClass: "border-sky-100",
  },
  won: {
    label: "En cours",
    dotColor: "bg-sky-500",
    bgClass: "bg-sky-50",
    textClass: "text-sky-700",
    borderClass: "border-sky-100",
  },
  devis_envoye: {
    label: "Devis envoyé",
    dotColor: "bg-emerald-600",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-100",
  },
  quote_sent: {
    label: "Devis envoyé",
    dotColor: "bg-emerald-600",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-100",
  },
};

const getAvatarColors = (name: string) => {
  const colors = [
    { bg: "bg-sky-100", text: "text-sky-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-cyan-100", text: "text-cyan-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  if (!name) return "CL";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return { date: "18 oct. 2026", time: "10:00" };
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  } catch {
    return { date: dateStr || "", time: "" };
  }
};

const getFormulaBadge = (formulaName: string) => {
  const fLower = formulaName.toLowerCase();
  if (fLower.includes("basique")) {
    return {
      bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon: Zap,
    };
  }
  if (fLower.includes("premium") || fLower.includes("commerce")) {
    return {
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      icon: TrendingUp,
    };
  }
  if (fLower.includes("sur-mesure") || fLower.includes("sur mesure")) {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Layers,
    };
  }
  return {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Sparkles,
  };
};

export const WebsiteLeadsTable: React.FC<WebsiteLeadsTableProps> = ({
  leads,
  selectedLeadId,
  onSelectLead,
  onInspectLead,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportCSV,
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "a_traiter", label: "À traiter" },
    { value: "en_cours", label: "En cours" },
    { value: "devis_envoye", label: "Devis envoyé" },
  ];

  const currentFilterLabel =
    filterOptions.find((opt) => opt.value === statusFilter)?.label ||
    "Tous les statuts";

  return (
    <div id="website-leads-table" className="space-y-3 sm:space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un client, une formule, un type de site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter & Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Custom Dropdown Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer select-none min-h-[44px]"
            >
              <span>{currentFilterLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isFilterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                        statusFilter === opt.value
                          ? "text-sky-600 bg-sky-50 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0 cursor-pointer min-h-[44px]"
            title="Exporter les devis web au format CSV (Excel)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Banner if filter active */}
        {statusFilter !== "all" && leads.length > 0 && (
          <div className="bg-sky-50/70 border-b border-sky-100 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-sky-900">
            <span className="font-semibold">
              Filtre actif :{" "}
              <strong className="font-bold text-sky-700">
                {currentFilterLabel}
              </strong>{" "}
              ({leads.length} demande{leads.length > 1 ? "s" : ""} correspondante
              {leads.length > 1 ? "s" : ""})
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer"
            >
              Tout afficher
            </button>
          </div>
        )}

        {/* Empty State */}
        {leads.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 shadow-xs ring-4 ring-sky-50/50">
              <Globe className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Aucune demande de site web trouvée
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {searchTerm || statusFilter !== "all"
                ? "Aucune demande ne correspond à vos critères de recherche actuels. Essayez de réinitialiser vos filtres."
                : "Dès qu'un visiteur configure un devis de site internet sur votre page création de site web, sa demande apparaîtra immédiatement ici en direct."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                    <th className="py-3.5 pl-6 pr-3">Client / Marque</th>
                    <th className="py-3.5 px-3">Type & Badge</th>
                    <th className="py-3.5 px-3">Formule & Prix</th>
                    <th className="py-3.5 px-3">Délai</th>
                    <th className="py-3.5 px-3">Date & Heure</th>
                    <th className="py-3.5 px-3">Statut</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {leads.map((lead) => {
                    const parsed = parseWebsiteOrderDetails(lead);
                    const dt = formatDateTime(lead.created_at);
                    const isSelected = selectedLeadId === lead.id;
                    const avatar = getAvatarColors(lead.full_name);
                    const initials = getInitials(lead.full_name);
                    const status = statusConfig[lead.status] || statusConfig.nouveau;
                    const formulaBadge = getFormulaBadge(parsed.formulaName);
                    const FormulaIcon = formulaBadge.icon;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? "bg-sky-50/40 hover:bg-sky-50/60"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Client & Entreprise */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs ${avatar.bg} ${avatar.text}`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{lead.full_name}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-600">
                                  {lead.company_name || "Particulier"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Badge "Site Web" */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100/90 text-sky-800 border border-sky-200">
                              <Globe className="w-3 h-3 text-sky-600" />
                              <span>Site Web</span>
                            </span>
                            <div className="text-[11px] font-semibold text-slate-700 capitalize">
                              {parsed.typeLabel}
                            </div>
                          </div>
                        </td>

                        {/* Formule & Prix */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${formulaBadge.bg}`}
                            >
                              <FormulaIcon className="w-3 h-3" />
                              <span>{parsed.formulaName}</span>
                            </span>
                            <div className="font-black text-slate-900 text-xs">
                              {parsed.formattedPrice}
                            </div>
                          </div>
                        </td>

                        {/* Délai */}
                        <td className="py-3.5 px-3">
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <Hourglass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{parsed.deadlineLabel}</span>
                          </div>
                        </td>

                        {/* Date & Heure */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col text-[11px]">
                            <span className="font-semibold text-slate-800">
                              {dt.date}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-sky-500" />
                              {dt.time}
                            </span>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.bgClass} ${status.textClass} ${status.borderClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                            />
                            <span>{status.label}</span>
                          </span>
                        </td>

                        {/* Action Inspect */}
                        <td className="py-3.5 pl-3 pr-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onInspectLead) onInspectLead(lead);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-sky-600 text-slate-500 hover:text-white transition-all cursor-pointer shadow-2xs group/btn"
                            title="Inspecter le dossier complet"
                          >
                            <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (< 768px) - 100% Mobile First sans scroll horizontal */}
            <div className="block md:hidden divide-y divide-slate-100">
              {leads.map((lead) => {
                const parsed = parseWebsiteOrderDetails(lead);
                const dt = formatDateTime(lead.created_at);
                const isSelected = selectedLeadId === lead.id;
                const avatar = getAvatarColors(lead.full_name);
                const initials = getInitials(lead.full_name);
                const status = statusConfig[lead.status] || statusConfig.nouveau;
                const formulaBadge = getFormulaBadge(parsed.formulaName);
                const FormulaIcon = formulaBadge.icon;

                return (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`p-4 transition-colors cursor-pointer space-y-3 ${
                      isSelected ? "bg-sky-50/40" : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Header: Client & Statut */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs ${avatar.bg} ${avatar.text}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">
                            {lead.full_name}
                          </div>
                          <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{lead.company_name || "Particulier"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Statut Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${status.bgClass} ${status.textClass} ${status.borderClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    {/* Meta Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {/* Badge Site Web */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        <Globe className="w-3 h-3 text-sky-600" />
                        <span>Site Web</span>
                      </span>

                      {/* Formule Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${formulaBadge.bg}`}
                      >
                        <FormulaIcon className="w-3 h-3" />
                        <span>{parsed.formulaName}</span>
                      </span>

                      {/* Type */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        <Layout className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{parsed.typeLabel}</span>
                      </span>
                    </div>

                    {/* Price and Deadline Row */}
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Tarif formule
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {parsed.formattedPrice}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Délai souhaité
                        </span>
                        <span className="font-semibold text-slate-700 text-xs">
                          {parsed.deadlineLabel}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Date & Inspect CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dt.date} · {dt.time}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onInspectLead) onInspectLead(lead);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs min-h-[44px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Voir détail</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
