"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/data/siteConfig";
import type { ParsedWebsiteOrder } from "@/lib/website-lead-parser";

interface MerciDevisClientProps {
  refNum: string;
  lead: {
    fullName: string;
    companyName: string;
    whatsappNumber: string;
    email: string;
  };
  parsed: ParsedWebsiteOrder;
  initialLeadEventSent: boolean;
}

export const MerciDevisClient: React.FC<MerciDevisClientProps> = ({
  refNum,
  lead,
  parsed,
  initialLeadEventSent,
}) => {
  const pixelTriggerAttemptedRef = useRef(false);

  // Déclenchement STRICT de l'événement Lead du pixel Meta UNE SEULE FOIS
  useEffect(() => {
    if (pixelTriggerAttemptedRef.current) return;
    pixelTriggerAttemptedRef.current = true;

    const storageKey = `sama_lead_sent_${refNum}`;
    const alreadySentInStorage =
      typeof window !== "undefined" &&
      window.localStorage.getItem(storageKey) === "true";

    // Si le Lead a déjà été envoyé (en base ou dans le localStorage du navigateur), on ne le renvoie pas
    if (initialLeadEventSent || alreadySentInStorage) {
      return;
    }

    const fireMetaLead = (): boolean => {
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        try {
          window.fbq(
            "track",
            "Lead",
            {
              content_name: "devis_site_web",
              content_category: "site_web",
            },
            {
              eventID: refNum,
            }
          );

          // 1. Marquage immédiat dans le localStorage client
          window.localStorage.setItem(storageKey, "true");

          // 2. Persistance côté serveur en base Supabase
          fetch("/api/devis-site-web/mark-lead-sent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref: refNum }),
          }).catch((err) => {
            console.warn("Notice persistance mark-lead-sent:", err);
          });

          return true;
        } catch (err) {
          console.warn("Notice appel fbq track Lead:", err);
          return false;
        }
      }
      return false;
    };

    // Tentative immédiate
    const fired = fireMetaLead();
    if (!fired) {
      // Réessai bref toutes les 150ms jusqu'à chargement de window.fbq (max 3 secondes)
      const intervalId = window.setInterval(() => {
        if (fireMetaLead()) {
          window.clearInterval(intervalId);
        }
      }, 150);

      const timeoutId = window.setTimeout(() => {
        window.clearInterval(intervalId);
      }, 3000);

      return () => {
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
      };
    }
  }, [refNum, initialLeadEventSent]);

  // Construction du message WhatsApp pré-formaté
  const whatsappSummaryText = encodeURIComponent(
    `Bonjour SAMA PUB, je souhaite finaliser le devis pour la création de mon site internet :\n` +
      `• Réf Dossier : ${refNum}\n` +
      `• Nom : ${lead.fullName}\n` +
      `• Entreprise : ${lead.companyName}\n` +
      `• Type : ${parsed.typeLabel}\n` +
      `• Formule : ${parsed.formulaName} (${parsed.formattedPrice})\n` +
      (parsed.selectedFeatures.length > 0
        ? `• Options (${parsed.selectedFeatures.length}) : ${parsed.selectedFeatures.map((f) => f.label).join(", ")}\n`
        : "") +
      `• Délai souhaité : ${parsed.deadlineLabel}\n` +
      `• E-mail : ${lead.email || "Non précisé"}`
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 sm:pt-28 pb-10 sm:pb-16 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 w-full">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl text-center animate-in zoom-in-95 duration-200">
            {/* Icône de validation avec halo vert */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm ring-6 sm:ring-8 ring-emerald-50">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            {/* Badge officiel de confirmation demandé par l'utilisateur */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200/90 shadow-2xs mb-2.5 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span>Devis envoyé avec succès</span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1.5 sm:mb-2 leading-tight">
              Votre devis de site internet est prêt !
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-4 sm:mb-6 leading-relaxed px-1">
              Merci <strong>{lead.fullName}</strong>. Votre demande pour{" "}
              <strong>{lead.companyName}</strong> a été enregistrée avec succès. Notre équipe à Dakar a bien reçu votre dossier et prépare votre proposition clé en main.
            </p>

            {/* Carte Récapitulative Complète du Projet */}
            <div className="bg-slate-50/90 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 text-left max-w-xl mx-auto mb-5 sm:mb-6 space-y-2.5 sm:space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between pb-2 sm:pb-2.5 border-b border-slate-200 gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                    Récapitulatif du projet
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-700 bg-white border border-slate-200 px-1.5 sm:px-2 py-0.5 rounded shadow-2xs shrink-0">
                    #{refNum}
                  </span>
                </div>
                <span className="font-mono text-xs sm:text-sm font-bold text-sama-orange bg-orange-50 border border-orange-200/60 px-2 sm:px-2.5 py-0.5 rounded-md shrink-0 ml-auto">
                  {parsed.formattedPrice}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Type de site :</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                    {parsed.typeLabel}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Formule :</span>
                  <span className="font-bold text-sama-orange text-xs sm:text-sm truncate block">
                    {parsed.formulaName}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Délai indicatif :</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                    {parsed.deadlineLabel}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] font-medium">Numéro WhatsApp :</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono truncate block">
                    {lead.whatsappNumber}
                  </span>
                </div>
              </div>

              {parsed.selectedFeatures.length > 0 && (
                <div className="pt-2 sm:pt-2.5 border-t border-slate-200">
                  <span className="text-slate-500 text-[10px] sm:text-[11px] font-semibold block mb-1.5">
                    Fonctionnalités souhaitées ({parsed.selectedFeatures.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {parsed.selectedFeatures.map((feat) => (
                      <span
                        key={feat.id}
                        className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white border border-slate-200 text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs"
                      >
                        ✓ {feat.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'Action (WhatsApp direct + Recommencer) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto w-full">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${whatsappSummaryText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[46px] sm:min-h-[48px]"
              >
                <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">Transmettre ce devis sur WhatsApp</span>
              </a>

              <Link
                href="/creation-site-internet"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer min-h-[42px] sm:min-h-[48px]"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Recommencer</span>
              </Link>
            </div>

            {/* Note de réassurance */}
            <div className="mt-5 sm:mt-8 pt-3.5 sm:pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-400 text-center leading-normal">
              <span>Un conseiller SAMA PUB prendra contact avec vous sous 24h ouvrées.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
