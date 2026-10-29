"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Eye,
  ChevronDown,
  Check,
  Building2,
  Briefcase,
  Banknote,
  Calendar,
  Clock,
  Inbox,
  Trash2,
} from "lucide-react";
import type { Database } from "@/types/database.types";

export type LeadQuote = Database["public"]["Tables"]["leads_quotes"]["Row"];

interface LeadsTableProps {
  leads: LeadQuote[];
  selectedLeadId: string | null;
  onSelectLead: (lead: LeadQuote) => void;
  onInspectLead?: (lead: LeadQuote) => void;
  onDeleteLead?: (lead: LeadQuote) => void;
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
    { bg: "bg-[#FFE8D6]", text: "text-[#C75000]" }, // MD
    { bg: "bg-[#FCE7F3]", text: "text-[#BE185D]" }, // AF
    { bg: "bg-[#E0E7FF]", text: "text-[#4338CA]" }, // IN
    { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" }, // FS
    { bg: "bg-[#FEF3C7]", text: "text-[#B45309]" }, // CB
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return { date: "18 oct. 2026", time: "10:00", full: "18 oct. 2026 à 10:00" };
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
    return { date, time, full: `${date} à ${time}` };
  } catch {
    return { date: dateStr || "", time: "", full: dateStr || "" };
  }
};

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  selectedLeadId,
  onSelectLead,
  onInspectLead,
  onDeleteLead,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportCSV,
}) => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "a_traiter", label: "À traiter" },
    { value: "en_cours", label: "En cours" },
    { value: "devis_envoye", label: "Devis envoyé" },
  ];

  return (
    <div id="leads-table" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden scroll-mt-24">
      {/* Active Filter Banner */}
      {statusFilter !== "all" && (
        <div className="bg-[#FFF7ED] border-b border-orange-100 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-sama-orange animate-pulse shrink-0" />
            <span className="text-slate-700 font-medium truncate">
              Filtre actif :{" "}
              <strong className="font-bold text-slate-900">
                {filterOptions.find((o) => o.value === statusFilter)?.label ||
                  (statusFilter === "quote_sent" || statusFilter === "devis_envoye"
                    ? "Devis envoyé"
                    : statusFilter === "won" || statusFilter === "en_cours"
                    ? "En cours"
                    : statusFilter === "contacted" || statusFilter === "a_traiter" || statusFilter === "new" || statusFilter === "nouveau"
                    ? "À traiter"
                    : statusFilter)}
              </strong>{" "}
              ({leads.length} devis correspondant{leads.length > 1 ? "s" : ""})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="text-sama-orange hover:text-sama-orange-hover font-bold text-xs hover:underline cursor-pointer shrink-0"
          >
            Tout afficher
          </button>
        </div>
      )}

      {/* Header of the Table Card */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Dernières demandes de devis
        </h2>

        {/* Toolbar: Search, Filter, Export Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full pl-9 pr-3.5 py-2 text-xs font-normal rounded-xl border border-slate-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/20 focus:border-sama-orange transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <span>
                  {filterOptions.find((o) => o.value === statusFilter)?.label ||
                    (statusFilter === "contacted" || statusFilter === "new" || statusFilter === "nouveau"
                      ? "À traiter"
                      : statusFilter === "won"
                      ? "En cours"
                      : statusFilter === "quote_sent"
                      ? "Devis envoyé"
                      : "Tous les statuts")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 animate-in fade-in-50 duration-150">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left cursor-pointer ${
                        statusFilter === opt.value
                          ? "text-sama-orange bg-[#FFF7ED] font-bold"
                          : "text-slate-600 hover:bg-slate-50 font-normal"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-sama-orange" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={onExportCSV}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (< md): Touch-Friendly Cards */}
      <div className="block md:hidden divide-y divide-slate-100">
        {leads.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Aucune demande de devis pour le moment
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Dès qu&apos;un visiteur remplit le formulaire sur le site, sa demande apparaîtra ici en direct.
            </p>
          </div>
        ) : (
          leads.map((lead) => {
            const isSelected = selectedLeadId === lead.id;
            const avatar = getAvatarColors(lead.full_name);
            const status = statusConfig[lead.status] || {
              label: lead.status,
              dotColor: "bg-slate-400",
              bgClass: "bg-slate-50",
              textClass: "text-slate-700",
              borderClass: "border-slate-200",
            };
            const dt = formatDateTime(lead.created_at);

            return (
              <div
                key={lead.id}
                onClick={() => {
                  onSelectLead(lead);
                  // Smoothly scroll to the detail card on mobile
                  const detailEl = document.getElementById("mobile-lead-detail");
                  if (detailEl) {
                    detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FFF9F3] border-l-4 border-l-sama-orange"
                    : "hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatar.bg} ${avatar.text}`}
                    >
                      {getInitials(lead.full_name)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {lead.full_name}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                        <Clock className="w-3 h-3 text-sama-orange shrink-0" />
                        <span>{dt.date} · {dt.time}</span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.bgClass} ${status.textClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                    <span>{status.label}</span>
                  </span>
                </div>

                {/* Details in card */}
                <div className="space-y-1.5 text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Entreprise :
                    </span>
                    <span className="font-semibold text-slate-800">
                      {lead.company_name || "Particulier"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      Service :
                    </span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                      {lead.service_requested}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Heure d&apos;envoi :
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {dt.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Banknote className="w-3 h-3 text-slate-400" />
                      Budget :
                    </span>
                    <span className="font-bold text-sama-orange">
                      {lead.budget_range}
                    </span>
                  </div>
                </div>

                {/* Tap to view detail cue */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[11px] truncate ${isSelected ? "font-bold text-sama-orange" : "text-slate-500"}`}>
                    {isSelected ? "● Demande sélectionnée" : "Toucher pour sélectionner"}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onDeleteLead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLead(lead);
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 transition-colors cursor-pointer"
                        title="Supprimer cette demande de devis"
                        aria-label="Supprimer cette demande de devis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                        if (onInspectLead) {
                          onInspectLead(lead);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-sama-orange text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Voir le détail</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW (>= md): Full horizontal table matching mockup */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white">
              <th className="py-3.5 px-6">Client</th>
              <th className="py-3.5 px-4">Entreprise / Marque</th>
              <th className="py-3.5 px-4">Service recherché</th>
              <th className="py-3.5 px-4">Budget mensuel</th>
              <th className="py-3.5 px-4">Date & Heure</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Aucune demande de devis enregistrée pour le moment
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Vos futures demandes de devis apparaîtront ici automatiquement dès qu&apos;un client soumet le formulaire sur le site.
                  </p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;
                const avatar = getAvatarColors(lead.full_name);
                const status = statusConfig[lead.status] || {
                  label: lead.status,
                  dotColor: "bg-slate-400",
                  bgClass: "bg-slate-50",
                  textClass: "text-slate-700",
                  borderClass: "border-slate-200",
                };
                const dt = formatDateTime(lead.created_at);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-[#FFF9F3]"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Client */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatar.bg} ${avatar.text}`}
                        >
                          {getInitials(lead.full_name)}
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-sama-orange transition-colors">
                          {lead.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Entreprise */}
                    <td className="py-4 px-4 font-normal text-slate-700 whitespace-nowrap">
                      {lead.company_name || "Particulier"}
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 font-normal text-slate-700 whitespace-nowrap">
                      {lead.service_requested}
                    </td>

                    {/* Budget */}
                    <td className="py-4 px-4 font-normal text-slate-700 whitespace-nowrap">
                      {lead.budget_range}
                    </td>

                    {/* Date & Heure */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">
                          {dt.date}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-sama-orange/80 shrink-0" />
                          <span>{dt.time}</span>
                        </span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bgClass} ${status.textClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        <span>{status.label}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                            if (onInspectLead) {
                              onInspectLead(lead);
                            }
                          }}
                          className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-slate-900 bg-white text-slate-900 shadow-xs"
                              : "border border-transparent bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          }`}
                          title="Consulter la fiche détaillée"
                        >
                          <Eye className="w-4 h-4 stroke-[2]" />
                        </button>

                        {onDeleteLead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLead(lead);
                            }}
                            className="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-transparent bg-rose-50/70 hover:bg-rose-600 text-rose-500 hover:text-white transition-all cursor-pointer"
                            title="Supprimer cette demande de devis"
                            aria-label="Supprimer cette demande de devis"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
