"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Banknote,
  FileText,
  ChevronDown,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { LeadQuote } from "./LeadsTable";

interface LeadDetailCardProps {
  lead: LeadQuote | null;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  isUpdatingStatus?: boolean;
}

const statusOptions = [
  { value: "contacted", label: "À traiter", dot: "bg-blue-600", text: "text-blue-600", bg: "bg-blue-50" },
  { value: "won", label: "En cours", dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  { value: "quote_sent", label: "Devis envoyé", dot: "bg-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" },
];

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

export const LeadDetailCard: React.FC<LeadDetailCardProps> = ({
  lead,
  onStatusChange,
  isUpdatingStatus = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!lead) return null;

  const dt = formatDateTime(lead.created_at);

  const currentStatusObj =
    statusOptions.find(
      (s) =>
        s.value === lead.status ||
        (lead.status === "new" && s.value === "contacted") ||
        (lead.status === "nouveau" && s.value === "contacted") ||
        (lead.status === "a_traiter" && s.value === "contacted") ||
        (lead.status === "en_cours" && s.value === "won") ||
        (lead.status === "devis_envoye" && s.value === "quote_sent")
    ) || statusOptions[0];

  const rawPhone = lead.whatsapp_number || lead.contact_value || "+221 76 142 28 58";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour ${lead.full_name}, je suis l'agence SAMA PUB à Dakar. Nous faisons suite à votre demande de devis pour ${lead.service_requested}.`
  )}`;

  const mailtoUrl = lead.email
    ? `mailto:${lead.email}?subject=${encodeURIComponent(
        `SAMA PUB — Votre demande de devis : ${lead.service_requested}`
      )}`
    : "#";

  return (
    <div
      id="mobile-lead-detail"
      className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-7 space-y-5 sm:space-y-6 scroll-mt-20"
    >
      {/* Top Header: Title, ID, Date/Time Badge & Status Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Détail de la demande
          </h2>
          <span className="text-[11px] sm:text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            #REQ-{lead.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-700 bg-orange-50/80 border border-orange-100/80 px-2.5 py-0.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-sama-orange shrink-0" />
            <span>Envoyé le <strong className="font-bold text-slate-900">{dt.date} à {dt.time}</strong></span>
          </span>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-normal">Statut :</span>
          <div className="relative">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
            >
              <span className={`w-2 h-2 rounded-full ${currentStatusObj.dot}`} />
              <span className={currentStatusObj.text}>{currentStatusObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in-50 duration-150">
                {statusOptions.map((opt) => {
                  const isSelected =
                    lead.status === opt.value ||
                    (opt.value === "contacted" &&
                      (lead.status === "new" ||
                        lead.status === "nouveau" ||
                        lead.status === "a_traiter"));

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={async () => {
                        setDropdownOpen(false);
                        await onStatusChange(lead.id, opt.value);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                        isSelected
                          ? "text-sama-orange bg-[#FFF7ED] font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-sama-orange" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid matching the mockup, responsive on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 sm:gap-y-4 text-xs">
        {/* Left Column */}
        <div className="space-y-2 sm:space-y-3">
          {/* Nom complet */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Nom complet</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 truncate">
              {lead.full_name}
            </span>
          </div>

          {/* Entreprise / marque */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Entreprise</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 truncate">
              {lead.company_name || "Diop & Co"}
            </span>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>WhatsApp</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 font-mono truncate">
              {rawPhone}
            </span>
          </div>

          {/* Date d'envoi */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Date d&apos;envoi</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 truncate">
              {dt.date}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2 sm:space-y-3">
          {/* E-mail */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>E-mail</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {lead.email || "Non renseigné"}
            </span>
          </div>

          {/* Service recherché */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Service</span>
            </div>
            <span className="font-bold sm:font-semibold text-sama-orange truncate max-w-[180px] sm:max-w-none text-right sm:text-left">
              {lead.service_requested}
            </span>
          </div>

          {/* Budget mensuel */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0 border-b sm:border-0 border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Budget mensuel</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 truncate">
              {lead.budget_range}
            </span>
          </div>

          {/* Heure d'envoi */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 py-1.5 sm:py-0">
            <div className="flex items-center gap-2 text-slate-400 font-normal sm:w-36 shrink-0">
              <Clock className="w-4 h-4 text-sama-orange shrink-0" />
              <span>Heure d&apos;envoi</span>
            </div>
            <span className="font-bold sm:font-semibold text-slate-900 font-mono truncate">
              {dt.time}
            </span>
          </div>
        </div>
      </div>

      {/* Description du besoin */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-normal mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Description du besoin</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100 break-words">
          {lead.message ||
            "Nous souhaitons augmenter les ventes de nos produits grâce à des campagnes publicitaires ciblées sur Facebook et Instagram."}
        </p>
      </div>

      {/* Action Buttons: Stack on Mobile, Inline on Desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-white" />
          <span>Contacter sur WhatsApp</span>
        </a>

        {lead.email && (
          <a
            href={mailtoUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Envoyer un e-mail</span>
          </a>
        )}
      </div>
    </div>
  );
};
