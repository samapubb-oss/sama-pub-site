"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Copy,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  Globe,
  Layers,
  Hourglass,
  Tag,
  CheckCircle2,
  ExternalLink,
  Zap,
  TrendingUp,
  CreditCard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { LeadQuote } from "@/components/admin/LeadsTable";
import type { DevisData } from "@/types/devis";
import { getSavedDevis, saveDevis, removeSavedDevis } from "@/lib/devis-storage";
import { parseWebsiteOrderDetails } from "@/lib/website-lead-parser";
import dynamic from "next/dynamic";
import { getDevisFilename } from "@/lib/pdf-utils";
import {
  sendDevisViaWhatsApp,
  triggerBlobDownload,
  cleanWhatsappNumber,
} from "@/lib/whatsapp-utils";
import { pdf } from "@react-pdf/renderer";
import { WebsiteDevisPdfDocument } from "./WebsiteDevisPdfDocument";

interface WebsiteLeadInspectionModalProps {
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

export const WebsiteLeadInspectionModal: React.FC<WebsiteLeadInspectionModalProps> = ({
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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);
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
      setPdfBlobUrl(null);
      if (saved) {
        setActiveTab("devis");
      } else {
        setActiveTab("details");
      }
    }
  }, [lead]);

  // Rend le blob PDF dès que le devis est disponible
  useEffect(() => {
    let isCancelled = false;

    async function makePdfBlob() {
      if (!devis) {
        setPdfBlob(null);
        setPdfBlobUrl(null);
        return;
      }
      setIsRenderingPdf(true);
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const fullLogoUrl = `${origin}/images/logo-sp.png`;
        const docInstance = <WebsiteDevisPdfDocument devis={devis} logoUrl={fullLogoUrl} />;
        const blob = await pdf(docInstance).toBlob();
        if (!isCancelled) {
          const url = URL.createObjectURL(blob);
          setPdfBlob(blob);
          setPdfBlobUrl(url);
        }
      } catch (e) {
        console.warn("Notice rendu Blob PDF Website:", e);
      } finally {
        if (!isCancelled) setIsRenderingPdf(false);
      }
    }

    makePdfBlob();

    return () => {
      isCancelled = true;
    };
  }, [devis]);

  // Fermeture par touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const parsed = parseWebsiteOrderDetails(lead);
  const dt = formatDateTime(lead.created_at);

  const currentStatus =
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
    `Bonjour ${lead.full_name}, je suis l'agence SAMA PUB à Dakar. Nous faisons suite à votre demande de devis pour votre projet de création de site web (${parsed.formulaName}).`
  )}`;

  const mailtoUrl = lead.email
    ? `mailto:${lead.email}?subject=${encodeURIComponent(
        `SAMA PUB — Votre projet de site internet : ${parsed.formulaName}`
      )}`
    : "#";

  // Action Génération du Devis via Claude (avec fallback automatique)
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
          service: `Création de site internet (${parsed.formulaName})`,
          budget_mensuel: parsed.formattedPrice,
          description: parsed.cleanDescription,
          date_envoi: dt.date,
          heure_envoi: dt.time,
          type_devis: "website",
          type_site: parsed.typeLabel,
          formule_site: parsed.formulaName,
          delai_site: parsed.deadlineLabel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de générer le devis de création de site web.");
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

  // Action Régénérer le Devis
  const handleRegenerateDevis = () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir régénérer ce devis ? La proposition sera réévaluée par l'IA."
    );
    if (!confirmed) return;

    removeSavedDevis(lead.id);
    setDevis(null);
    setPdfBlob(null);
    setPdfBlobUrl(null);
    handleGenerateDevis();
  };

  // Action Téléchargement du PDF
  const handleDownloadPdf = () => {
    if (!pdfBlob || !devis) return;
    const filename = getDevisFilename(
      lead.company_name || lead.full_name,
      devis.numero_devis || `WEB-${lead.id.slice(0, 8)}`
    );
    triggerBlobDownload(pdfBlob, filename);
  };

  // Action Envoi sur WhatsApp + Passage Automatique à "Devis envoyé"
  const handleSendWhatsApp = async () => {
    if (!pdfBlob || !devis) return;

    try {
      const filename = getDevisFilename(
        lead.company_name || lead.full_name,
        devis.numero_devis || `WEB-${lead.id.slice(0, 8)}`
      );
      const targetPhone =
        lead.whatsapp_number ||
        lead.contact_value ||
        devis.client?.whatsapp ||
        "";

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const pdfDirectUrl = lead.id ? `${origin}/api/devis-pdf?id=${lead.id}&type=website` : "";
      const clientName = lead.full_name || devis.client?.nom || "Client";
      const devisTitre = devis.titre_devis || `Création de ${parsed.formulaName}`;

      const messageToSend = `Bonjour ${clientName},\n\nL'agence SAMA PUB a le plaisir de vous transmettre votre devis officiel pour votre projet de création de site internet (« ${devisTitre} »).\n\n📄 Vous pouvez consulter et télécharger votre devis officiel (PDF) directement ici :\n${pdfDirectUrl}\n\nLe document PDF haute fidélité est également joint à ce message.\n\nRestant à votre entière disposition pour planifier le démarrage de votre site,\nL'équipe SAMA PUB Dakar`;

      const res = await sendDevisViaWhatsApp(
        pdfBlob,
        filename,
        targetPhone,
        messageToSend,
        clientName
      );

      // Mise à jour automatique du statut à "quote_sent" (Devis envoyé)
      await onStatusChange(lead.id, "quote_sent");

      if (res.message) {
        setToastMessage(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi WhatsApp.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col h-[94vh] max-h-[94vh]">
        {/* Top Header */}
        <div className="p-3 sm:p-5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-xs ring-2 ring-slate-100 bg-white flex items-center justify-center shrink-0">
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
                <span className="text-xs sm:text-base font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                  {lead.full_name}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-600" />
                  <span>Devis Site Web</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                {lead.company_name || "Particulier"} · {parsed.formulaName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-colors cursor-pointer min-h-[36px] sm:min-h-[38px] ${currentStatus.bg} ${currentStatus.text} border-slate-200 shadow-2xs`}
              >
                <span className={`w-2 h-2 rounded-full ${currentStatus.dot} shrink-0`} />
                <span className="whitespace-nowrap">{currentStatus.label}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              </button>

              {statusDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setStatusDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={async () => {
                          setStatusDropdownOpen(false);
                          await onStatusChange(lead.id, opt.value);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
                          currentStatus.value === opt.value
                            ? "bg-slate-50 text-slate-900 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                          <span>{opt.label}</span>
                        </div>
                        {currentStatus.value === opt.value && (
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: "Dossier 5 Étapes" vs "Devis Commercial (PDF)" */}
        <div className="px-3 sm:px-6 pt-2.5 pb-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] sm:min-h-[38px] text-center ${
                activeTab === "details"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Dossier & 5 Étapes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("devis")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] sm:min-h-[38px] text-center ${
                activeTab === "devis"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200 shrink-0" />
              <span className="whitespace-nowrap">Devis Commercial {devis ? "(Prêt)" : ""}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-sky-500" />
            <span>Reçu le {dt.full}</span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* TAB 1: DOSSIER COMPLET EN 5 ÉTAPES */}
          {activeTab === "details" && (
            <div className="space-y-4 sm:space-y-5">
              {/* Toast info si devis disponible */}
              {devis && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-sky-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>
                      Un devis officiel a déjà été généré pour ce projet (
                      <strong>{devis.numero_devis}</strong>).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("devis")}
                    className="font-bold text-sky-700 hover:text-sky-900 underline shrink-0 cursor-pointer"
                  >
                    Voir le devis
                  </button>
                </div>
              )}

              {/* Grille des 5 Étapes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Étape 1 : Type de site */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Étape 1 · Type de projet web
                    </span>
                    <Globe className="w-4 h-4 text-sky-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 capitalize">
                    {parsed.typeLabel}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Projet web adapté aux spécificités et à la clientèle ciblée au Sénégal.
                  </p>
                </div>

                {/* Étape 2 : Formule choisie & Prix */}
                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs space-y-1.5 bg-gradient-to-br from-white to-sky-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Étape 2 · Formule choisie
                    </span>
                    <Sparkles className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {parsed.formulaName}
                    </h4>
                    <span className="text-sm font-black text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                      {parsed.formattedPrice}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nom de domaine et hébergement cloud SSL sécurisé inclus 1 an.
                  </p>
                </div>

                {/* Étape 3 : Options & Fonctionnalités cochées */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Étape 3 · Options & Fonctionnalités cochées ({parsed.selectedFeatures.length})
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {parsed.selectedFeatures.map((feat) => (
                      <span
                        key={feat.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{feat.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Étape 4 : Délai de livraison souhaité */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Étape 4 · Délai souhaité
                    </span>
                    <Hourglass className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {parsed.deadlineLabel}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Délai contractuel de livraison clé en main avec mise en ligne.
                  </p>
                </div>

                {/* Date et Heure précises */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Horodatage de la demande
                    </span>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 font-mono">
                    {dt.full}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Fuseau horaire officiel Dakar (GMT / UTC+0).
                  </p>
                </div>
              </div>

              {/* Étape 5 : Coordonnées du Client */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                  Étape 5 · Coordonnées de contact du client
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Nom complet */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Nom complet</span>
                      <span className="font-bold text-slate-900 text-sm truncate block">{lead.full_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.full_name, "nom")}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer shrink-0"
                      title="Copier"
                    >
                      {copiedField === "nom" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Entreprise */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Entreprise / Marque</span>
                      <span className="font-bold text-slate-900 text-sm truncate block">{lead.company_name || "Non précisé"}</span>
                    </div>
                    {lead.company_name && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.company_name || "", "company")}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer shrink-0"
                        title="Copier"
                      >
                        {copiedField === "company" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400 block font-medium">WhatsApp</span>
                      <span className="font-bold text-slate-900 text-sm font-mono truncate block">{rawPhone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(rawPhone, "whatsapp")}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer shrink-0"
                      title="Copier"
                    >
                      {copiedField === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* E-mail */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400 block font-medium">Adresse e-mail</span>
                      <span className="font-bold text-slate-900 text-sm truncate block">{lead.email || "Non précisé"}</span>
                    </div>
                    {lead.email && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.email || "", "email")}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer shrink-0"
                        title="Copier"
                      >
                        {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description / Message libre du prospect */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Description du besoin & Attentes du client
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(parsed.cleanDescription, "desc")}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copier la description</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {parsed.cleanDescription}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Bouton WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Contacter sur WhatsApp</span>
                </a>

                {/* Bouton E-mail */}
                {lead.email && (
                  <a
                    href={mailtoUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Envoyer un e-mail</span>
                  </a>
                )}

                {/* Bouton Générer le devis */}
                <button
                  type="button"
                  onClick={handleGenerateDevis}
                  disabled={isGeneratingDevis}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {isGeneratingDevis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Génération du devis en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-200" />
                      <span>{devis ? "Régénérer le devis" : "Générer le devis"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message d'erreur de génération si applicable */}
              {devisError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{devisError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateDevis}
                    className="font-bold underline ml-2 cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEVIS COMMERCIAL & APERÇU PDF */}
          {activeTab === "devis" && (
            <div className="space-y-4">
              {/* Si aucun devis généré pour l'instant */}
              {!devis && !isGeneratingDevis && (
                <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Aucun devis généré pour le moment
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour générer automatiquement une proposition commerciale officielle A4 adaptée au projet web de {lead.full_name}.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateDevis}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Générer le devis de création de site web</span>
                  </button>
                </div>
              )}

              {/* Pendant la génération */}
              {isGeneratingDevis && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Génération du devis commercial en cours...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    L&apos;IA structure la proposition commerciale selon la grille tarifaire et les besoins spécifiques exprimés par {lead.full_name}.
                  </p>
                </div>
              )}

              {/* Devis généré et prêt */}
              {devis && (
                <div className="space-y-4">
                  {/* Actions Header Bar */}
                  <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-md whitespace-nowrap shrink-0 shadow-2xs">
                          {devis.numero_devis}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Prêt à envoyer</span>
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                        {devis.titre_devis}
                      </h4>
                      <p className="text-xs text-slate-600 leading-normal">
                        Montant total :{" "}
                        <strong className="text-slate-900 font-bold">
                          {new Intl.NumberFormat("fr-FR").format(devis.total_general || 300000)} FCFA
                        </strong>{" "}
                        <span className="text-slate-400">·</span> Acompte 50% au lancement
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 shrink-0">
                      {/* Envoyer sur WhatsApp */}
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        disabled={!pdfBlob}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[44px]"
                        title="Télécharger le PDF et ouvrir WhatsApp pour l'envoyer au client"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                        <span className="whitespace-nowrap">Envoyer au client (WhatsApp)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Télécharger PDF */}
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={!pdfBlob}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                          title="Télécharger le document PDF officiel"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">Télécharger PDF</span>
                        </button>

                        {/* Régénérer */}
                        <button
                          type="button"
                          onClick={handleRegenerateDevis}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Régénérer le devis"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Toast Message */}
                  {toastMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                      <span>{toastMessage}</span>
                      <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                  )}

                  {/* Aperçu PDF Intégré */}
                  <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex flex-col">
                    <div className="p-3 bg-slate-800/90 text-white flex items-center justify-between text-xs border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-xs sm:text-sm">
                          Aperçu du Devis A4 SAMA PUB
                        </span>
                      </div>
                      {pdfBlobUrl && (
                        <a
                          href={pdfBlobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-[11px] transition-colors border border-sky-400/30"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Plein écran</span>
                        </a>
                      )}
                    </div>

                    <div className="p-2 sm:p-4 bg-slate-950 flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
                      {isRenderingPdf ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                          <span className="text-xs">Chargement de l&apos;aperçu PDF...</span>
                        </div>
                      ) : pdfBlobUrl ? (
                        <iframe
                          src={pdfBlobUrl}
                          title="Aperçu PDF du devis web"
                          className="w-full h-[480px] sm:h-[600px] rounded-lg bg-white border border-slate-800"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <p>Aperçu indisponible. Téléchargez le devis ci-dessus.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
