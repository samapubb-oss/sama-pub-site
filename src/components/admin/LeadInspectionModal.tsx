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
  Sparkles,
  Download,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { LeadQuote } from "./LeadsTable";
import type { DevisData } from "@/types/devis";
import { getSavedDevis, saveDevis, removeSavedDevis } from "@/lib/devis-storage";
import dynamic from "next/dynamic";
import { getDevisFilename } from "@/lib/pdf-utils";
import {
  sendDevisViaWhatsApp,
  triggerBlobDownload,
  cleanWhatsappNumber,
} from "@/lib/whatsapp-utils";

const DevisPdfPreview = dynamic(
  () => import("./DevisPdfPreview").then((mod) => mod.DevisPdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 className="w-8 h-8 text-sama-orange animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Chargement du visualiseur de devis...</p>
      </div>
    ),
  }
);

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

  // Devis States
  const [devis, setDevis] = useState<DevisData | null>(null);
  const [isGeneratingDevis, setIsGeneratingDevis] = useState(false);
  const [devisError, setDevisError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "devis">("details");

  // Charge le devis préalablement généré s'il existe
  useEffect(() => {
    if (lead) {
      const saved = getSavedDevis(lead.id);
      setDevis(saved);
      setDevisError(null);
      setToastMessage(null);
      setPdfBlob(null);
      if (saved) {
        setActiveTab("devis");
      } else {
        setActiveTab("details");
      }
    }
  }, [lead]);

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
  const cleanPhone = cleanWhatsappNumber(rawPhone);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour ${lead.full_name}, je suis l'agence SAMA PUB à Dakar. Nous faisons suite à votre demande de devis pour ${lead.service_requested}.`
  )}`;

  const mailtoUrl = lead.email
    ? `mailto:${lead.email}?subject=${encodeURIComponent(
        `SAMA PUB — Votre demande de devis : ${lead.service_requested}`
      )}`
    : "#";

  // Action Génération du Devis via Claude
  const handleGenerateDevis = async () => {
    setIsGeneratingDevis(true);
    setDevisError(null);
    setToastMessage(null);

    try {
      const response = await fetch("/api/generer-devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sama-admin-auth": "true",
        },
        body: JSON.stringify({
          id: lead.id,
          nom_complet: lead.full_name,
          entreprise: lead.company_name || "",
          whatsapp: lead.whatsapp_number || lead.contact_value || "",
          email: lead.email || "",
          service: lead.service_requested,
          budget_mensuel: lead.budget_range,
          description: lead.message || "",
          date_envoi: dt.date,
          heure_envoi: dt.time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de générer le devis commercial.");
      }

      setDevis(data);
      await saveDevis(lead.id, data);
      setActiveTab("devis");
    } catch (err: any) {
      setDevisError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsGeneratingDevis(false);
    }
  };

  // Action Régénérer le Devis (avec confirmation préalable)
  const handleRegenerateDevis = () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir régénérer ce devis ? L'ancien devis sera écrasé et une nouvelle proposition sera demandée à l'IA."
    );
    if (!confirmed) return;

    removeSavedDevis(lead.id);
    setDevis(null);
    setPdfBlob(null);
    handleGenerateDevis();
  };

  // Action Téléchargement du PDF (même Blob que l'aperçu)
  const handleDownloadPdf = () => {
    if (!pdfBlob || !devis) return;
    const filename = getDevisFilename(lead.company_name || lead.full_name, devis.numero_devis || lead.id);
    triggerBlobDownload(pdfBlob, filename);
  };

  // Action Envoi sur WhatsApp
  const handleSendWhatsApp = async () => {
    if (!pdfBlob || !devis) return;

    // Si alertes internes ou devis non fiable, confirmation de sécurité requise
    if (devis.alertes_internes?.length > 0 || devis.fiable === false) {
      const confirmed = window.confirm(
        "Ce devis comporte des alertes internes (ex: champ mal rempli ou demande atypique). Souhaitez-vous quand même l'envoyer au client ?"
      );
      if (!confirmed) return;
    }

    try {
      const filename = getDevisFilename(lead.company_name || lead.full_name, devis.numero_devis || lead.id);
      const targetPhone =
        lead.whatsapp_number ||
        lead.contact_value ||
        devis.client?.whatsapp ||
        "";

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const pdfDirectUrl = lead.id ? `${origin}/api/devis-pdf?id=${lead.id}` : "";
      const clientName = lead.full_name || devis.client?.nom || "Client";
      const devisTitre = devis.titre_devis || "Campagne Publicitaire SAMA PUB";

      // Message d'accompagnement WhatsApp officiel, élégant et orienté PDF
      const messageToSend = `Bonjour ${clientName},\n\nL'agence SAMA PUB a le plaisir de vous transmettre votre devis officiel pour votre projet (« ${devisTitre} »).\n\n📄 Vous pouvez consulter et télécharger votre devis officiel (PDF) directement ici :\n${pdfDirectUrl}\n\nLe document PDF officiel est également joint à ce message.\n\nRestant à votre entière disposition pour échanger sur le lancement de votre campagne,\nL'équipe SAMA PUB Dakar`;

      const res = await sendDevisViaWhatsApp(
        pdfBlob,
        filename,
        targetPhone,
        messageToSend,
        clientName
      );

      if (res.message) {
        setToastMessage(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi WhatsApp.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col h-[94vh] sm:h-auto max-h-[94vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0 gap-2">
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
                Informations transmises par le prospect & Devis commercial
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

        {/* Tab Navigation if Devis Exists */}
        {devis && (
          <div className="px-4 sm:px-6 pt-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "details"
                  ? "border-sama-orange text-slate-900 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📋 Informations client
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("devis")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "devis"
                  ? "border-sama-orange text-sama-orange font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>📄 Devis commercial</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          {/* VUE 1 : INFORMATIONS CLIENT */}
          {(!devis || activeTab === "details") && (
            <>
              {/* Bannière d'action directe : Générer un devis / Voir le devis */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sama-orange text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{devis ? "Devis commercial prêt" : "Devis commercial sur-mesure"}</span>
                      {devis && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          Prêt
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {devis
                        ? `Devis N° ${devis.numero_devis || "DEV"} adapté aux informations du client (PDF & WhatsApp prêts)`
                        : "Générez en 1 clic le devis A4 complet basé sur les informations envoyées par ce client"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingDevis}
                  onClick={devis ? () => setActiveTab("devis") : handleGenerateDevis}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-sama-orange hover:bg-sama-orange-hover disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                >
                  {isGeneratingDevis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Génération en cours...</span>
                    </>
                  ) : devis ? (
                    <>
                      <FileText className="w-4 h-4 text-white" />
                      <span>Voir le devis (PDF)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Générer un devis</span>
                    </>
                  )}
                </button>
              </div>

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

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
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
                  {lead.message || "Aucune description saisie par le prospect."}
                </p>
              </div>
            </>
          )}

          {/* VUE 2 : APERÇU ET ACTIONS DU DEVIS GÉNÉRÉ */}
          {devis && activeTab === "devis" && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-150">
              {/* Bandeau d'état : Brouillon vérifiable */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-semibold">
                    Brouillon : vérifie le devis avant l&apos;envoi
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {devis.numero_devis || "DEV-OFFICIEL"}
                </span>
              </div>

              {/* Bandeau d'alertes internes (VISIBLE UNIQUEMENT POUR L'ADMIN DANS LE DASHBOARD) */}
              {(devis.alertes_internes?.length > 0 || devis.fiable === false) && (
                <div className="p-3 sm:p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Alertes internes SAMA PUB (confidentielles — non incluses dans le PDF) :
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                    {devis.alertes_internes?.map((alerte, idx) => (
                      <li key={idx} className="leading-snug">
                        {alerte}
                      </li>
                    ))}
                    {devis.fiable === false && (
                      <li className="font-bold text-amber-900">
                        La demande présente un risque d&apos;incohérence ou de test.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Composant PDF et aperçu direct */}
              <DevisPdfPreview
                devis={devis}
                onBlobReady={(blob) => setPdfBlob(blob)}
                onSendWhatsApp={handleSendWhatsApp}
              />
            </div>
          )}

          {/* Notification Toast (ex: instruction ordi WhatsApp) */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-bold">{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-sky-600 hover:text-sky-800 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Erreur de génération avec bouton réessayer */}
          {devisError && (
            <div className="p-3 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Erreur de génération</p>
                  <p className="mt-0.5 text-rose-700">{devisError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateDevis}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-5 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Cas 1 : Aucun devis généré pour le moment -> Bouton « Générer le devis » */}
            {!devis && (
              <button
                type="button"
                disabled={isGeneratingDevis}
                onClick={handleGenerateDevis}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-sama-orange hover:bg-sama-orange-hover disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                {isGeneratingDevis ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white shrink-0" />
                    <span>Générer le devis</span>
                  </>
                )}
              </button>
            )}

            {/* Cas 2 : Devis généré avec succès -> Boutons Télécharger, WhatsApp & Régénérer */}
            {devis && (
              <>
                {/* Envoyer sur WhatsApp */}
                <button
                  type="button"
                  disabled={!pdfBlob}
                  onClick={handleSendWhatsApp}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-sama-orange hover:bg-sama-orange-hover disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                  <span>Envoyer sur WhatsApp</span>
                </button>

                {/* Télécharger le PDF */}
                <button
                  type="button"
                  disabled={!pdfBlob}
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  title="Télécharger le document PDF du devis"
                >
                  <Download className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline">Télécharger le PDF</span>
                  <span className="sm:hidden text-xs">PDF</span>
                </button>

                {/* Régénérer le devis */}
                <button
                  type="button"
                  disabled={isGeneratingDevis}
                  onClick={handleRegenerateDevis}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  title="Régénérer une nouvelle proposition pour cette demande"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDevis ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline">Régénérer</span>
                </button>
              </>
            )}

            {/* Contacter WhatsApp standard si aucun devis n'est encore généré */}
            {!devis && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="hidden sm:inline">Message simple</span>
              </a>
            )}

            {/* E-mail client */}
            {lead.email && !devis && (
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
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
            className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shrink-0 ml-auto"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
