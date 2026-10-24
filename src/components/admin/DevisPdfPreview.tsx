"use client";

import React, { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { DevisPdfDocument } from "./DevisPdfDocument";
import type { DevisData } from "@/types/devis";
import {
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { formatFcfa } from "@/lib/pdf-utils";

interface DevisPdfPreviewProps {
  devis: DevisData;
  onBlobReady?: (blob: Blob, url: string) => void;
}

export const DevisPdfPreview: React.FC<DevisPdfPreviewProps> = ({
  devis,
  onBlobReady,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let createdUrl: string | null = null;

    async function generatePdf() {
      setIsGenerating(true);
      setError(null);

      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const fullLogoUrl = `${origin}/images/logo-sp.png`;

        const docInstance = <DevisPdfDocument devis={devis} logoUrl={fullLogoUrl} />;
        const blob = await pdf(docInstance).toBlob();

        if (isCancelled) return;

        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
        if (onBlobReady) {
          onBlobReady(blob, createdUrl);
        }
      } catch (err: any) {
        console.error("Erreur lors de la génération du Blob PDF :", err);
        if (!isCancelled) {
          setError("Impossible de générer l'aperçu du PDF. Veuillez réessayer.");
        }
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    }

    generatePdf();

    return () => {
      isCancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [devis, onBlobReady]);

  if (isGenerating) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 className="w-8 h-8 text-sama-orange animate-spin" />
        <div>
          <p className="text-sm font-bold text-slate-800">
            Mise en page du devis en cours...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Génération du document A4 haute fidélité SAMA PUB
          </p>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="w-full p-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Erreur d&apos;affichage de l&apos;aperçu</p>
          <p className="mt-1">{error || "Erreur inconnue."}</p>
        </div>
      </div>
    );
  }

  const metaBudget = devis.budget_publicitaire_recommande || 200000;
  const prestation = devis.total_honoraires || Math.round(metaBudget * 0.15);
  const tranche1 = devis.tranche_1_prestation || Math.round(prestation * 0.5);
  const tranche2 = devis.tranche_2_prestation || prestation - tranche1;
  const totalGeneral = metaBudget + prestation;

  return (
    <div className="w-full space-y-3">
      {/* Barre d'accès rapide optimisée mobile & desktop */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-slate-900 to-[#10233A] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sama-orange/20 border border-sama-orange/40 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-sama-orange" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate">
              Devis officiel · {devis.numero_devis || "DEV-OFFICIEL"}
            </p>
            <p className="text-[11px] text-slate-300">
              Prêt pour envoi WhatsApp ou ouverture plein écran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>Ouvrir en plein écran</span>
          </a>

          <a
            href={blobUrl}
            download={`Devis-SAMA-PUB-${devis.numero_devis || "officiel"}.pdf`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
            title="Télécharger le PDF directement"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Télécharger</span>
          </a>
        </div>
      </div>

      {/* CARTE RESPONSIVE MOBILE : affichée uniquement sur smartphone pour une lisibilité instantanée */}
      <div className="block sm:hidden bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-sama-orange uppercase tracking-wider">
              Récapitulatif Mobile
            </span>
            <h4 className="text-sm font-bold text-slate-900">{devis.client.nom}</h4>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            15% Prestation
          </span>
        </div>

        {/* Chiffres clés */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">1. Budget Pub Meta (100%) :</span>
            <span className="font-bold text-slate-900">{formatFcfa(metaBudget)}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-orange-50/80 border border-orange-200/80">
            <div>
              <span className="text-orange-900 font-bold block">2. Prestation SAMA PUB (15%) :</span>
              <span className="text-[10px] text-orange-700">Option 2 tranches de {formatFcfa(tranche1)}</span>
            </div>
            <span className="font-bold text-sama-orange text-sm">{formatFcfa(prestation)}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 text-white">
            <span className="font-bold text-xs">Total Global :</span>
            <span className="font-bold text-sama-orange text-sm">{formatFcfa(totalGeneral)}</span>
          </div>
        </div>

        {/* Clause de liberté */}
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Remboursement garanti :</strong> Le client peut arrêter la campagne à tout moment et récupérer tout le budget Meta restant non dépensé.
          </span>
        </div>

        {/* Bouton direct d'ouverture du document complet */}
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-slate-600" />
          <span>Consulter le document PDF A4 complet</span>
        </a>
      </div>

      {/* Visionneuse Object A4 pour tablettes et grands écrans */}
      <div className="hidden sm:block w-full h-[460px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
        <object
          data={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          type="application/pdf"
          className="w-full h-full"
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-sama-orange flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Aperçu PDF prêt
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Cliquez ci-dessous pour ouvrir le devis au format PDF.
              </p>
            </div>
            <a
              href={blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sama-orange text-white text-xs font-bold shadow-xs hover:bg-sama-orange-hover transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ouvrir le devis PDF</span>
            </a>
          </div>
        </object>
      </div>
    </div>
  );
};
