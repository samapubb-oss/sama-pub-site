"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  User,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Banknote,
  FileText,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { LeadQuote } from "./LeadsTable";

interface LeadInspectionModalProps {
  lead: LeadQuote | null;
  isOpen: boolean;
  onClose: () => void;
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

export const LeadInspectionModal: React.FC<LeadInspectionModalProps> = ({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  isUpdatingStatus = false,
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-6 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Round Logo SP */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-xs ring-2 ring-sama-orange/20 bg-white flex items-center justify-center shrink-0">
              <Image
                src="/images/logo-sp.png"
                alt="SAMA PUB"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Détail de la demande
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                  #REQ-{lead.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden xs:block">
                Informations transmises par le prospect
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-200/60 cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-5">
          {/* Status and Date Banner */}
          <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFF9F3] border border-orange-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 min-w-0">
              <Clock className="w-3.5 h-3.5 text-sama-orange shrink-0" />
              <span className="truncate">
                Envoyé le{" "}
                <strong className="text-slate-900 font-bold">
                  {dt.date} à {dt.time}
                </strong>
              </span>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
                Statut :
              </span>
              <div className="relative">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 shadow-xs"
                >
                  <span className={`w-2 h-2 rounded-full ${currentStatusObj.dot}`} />
                  <span className={currentStatusObj.text}>{currentStatusObj.label}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {statusDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in-50 duration-150">
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
                            setStatusDropdownOpen(false);
                            await onStatusChange(lead.id, opt.value);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
                            isSelected
                              ? "text-sama-orange bg-[#FFF7ED] font-bold"
                              : "text-slate-700 hover:bg-slate-50"
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

          {/* 2-Column Info Grid with responsive typography & compact spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3.5 text-xs">
            {/* Nom complet */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  Nom complet
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(lead.full_name, "name")}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copier le nom"
                >
                  {copiedField === "name" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {lead.full_name}
              </div>
            </div>

            {/* Entreprise */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Entreprise / Marque
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {lead.company_name || "Particulier / Non renseignée"}
              </div>
            </div>

            {/* Numéro WhatsApp */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Phone className="w-3 h-3" />
                  Numéro WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(rawPhone, "phone")}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copier le numéro"
                >
                  {copiedField === "phone" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate">
                {rawPhone}
              </div>
            </div>

            {/* E-mail */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  Adresse e-mail
                </span>
                {lead.email && (
                  <button
                    type="button"
                    onClick={() => handleCopy(lead.email || "", "email")}
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title="Copier l'e-mail"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {lead.email || "Non renseigné"}
              </div>
            </div>

            {/* Service demandé */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3 h-3 text-slate-400" />
                Service recherché
              </div>
              <div className="text-xs sm:text-sm font-bold text-sama-orange truncate">
                {lead.service_requested}
              </div>
            </div>

            {/* Budget mensuel */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Banknote className="w-3 h-3 text-slate-400" />
                Budget mensuel estimé
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {lead.budget_range}
              </div>
            </div>

            {/* Date d'envoi */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Date d&apos;envoi
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(dt.date, "date")}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copier la date"
                >
                  {copiedField === "date" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {dt.date}
              </div>
            </div>

            {/* Heure d'envoi */}
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-sama-orange font-bold">
                  <Clock className="w-3 h-3" />
                  Heure d&apos;envoi
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(dt.time, "time")}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copier l'heure"
                >
                  {copiedField === "time" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate">
                {dt.time} <span className="text-[10px] font-normal text-slate-400">(Dakar)</span>
              </div>
            </div>
          </div>

          {/* Description intégrale du besoin */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2">
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sama-orange" />
                <span>Description du besoin</span>
              </div>
              {lead.message && (
                <button
                  type="button"
                  onClick={() => handleCopy(lead.message || "", "message")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sama-orange hover:text-sama-orange-hover cursor-pointer"
                >
                  {copiedField === "message" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copier le texte</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-white p-3 sm:p-4 rounded-xl border border-slate-200/70">
              {lead.message ||
                "Nous souhaitons augmenter les ventes de nos produits grâce à des campagnes publicitaires ciblées sur Facebook et Instagram."}
            </p>
          </div>
        </div>

        {/* Modal Action Footer: Optimized for Mobile & Desktop */}
        <div className="p-3 sm:p-5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {/* Contacter sur WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer truncate"
            >
              <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
              <span className="truncate">Contacter sur WhatsApp</span>
            </a>

            {/* Envoyer un e-mail */}
            {lead.email && (
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0"
                title="Envoyer un e-mail au client"
              >
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Envoyer un e-mail</span>
                <span className="sm:hidden text-xs">E-mail</span>
              </a>
            )}
          </div>

          {/* Fermer la fiche */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shrink-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
