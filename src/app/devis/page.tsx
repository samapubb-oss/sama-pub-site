import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ContactCTA } from "@/components/ContactCTA";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import {
  Sparkles,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Demander un Devis Gratuit | SAMA PUB Dakar",
  description:
    "Demandez votre devis publicitaire personnalisé en 1 minute. SAMA PUB analyse vos besoins (Meta Ads, Google Ads, TikTok Ads) et vous propose une stratégie sur-mesure adaptée à votre budget au Sénégal.",
  openGraph: {
    title: "Demander un Devis Gratuit | SAMA PUB Dakar",
    description:
      "Demandez votre devis sur-mesure en 1 minute. Stratégie publicitaire haute performance pour votre entreprise au Sénégal.",
  },
};

export default function DevisPage() {
  return (
    <>
      {/* Sticky Header */}
      <Header />

      <main className="flex-1">
        {/* Top Hero Section for Devis Page - DESKTOP ONLY (hidden on mobile so mobile users see the form immediately without scrolling) */}
        <section className="hidden lg:block pt-32 pb-12 bg-gradient-to-b from-[#07162C] via-[#091D3A] to-[#0A2242] border-b border-white/10 text-white relative overflow-hidden">
          {/* Ambient Lighting Halos */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sama-orange/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb & Return to Home */}
            <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sama-orange transition-transform group-hover:-translate-x-1" />
                <span>Retour à l'accueil</span>
              </Link>
              <span>/</span>
              <span className="text-sama-orange font-medium">Demande de devis</span>
            </div>

            {/* Header Content */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-sama-orange mb-4 shadow-sm">
                <Sparkles className="w-4 h-4 text-sama-orange" />
                <span>100% Gratuit & Sans engagement · Réponse sous 24h ouvrées</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Obtenez votre devis publicitaire{" "}
                <span className="text-sama-orange whitespace-nowrap">sur-mesure</span>
              </h1>

              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
                Parlez-nous de vos objectifs commerciaux. Notre équipe d'experts à Dakar élabore une stratégie Media Buying calibrée pour maximiser votre retour sur investissement (ROAS).
              </p>

              {/* 3 Reassurance Highlights */}
              <div className="grid grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5 hover:border-sama-orange/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-sama-orange flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Réponse sous 24h</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Prise de contact rapide par WhatsApp ou e-mail.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5 hover:border-blue-400/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Stratégie sur-mesure</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ciblage adapté à votre audience et budget local.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5 hover:border-emerald-400/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Zéro engagement</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Proposition claire et transparente, sans frais cachés.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Complete Form & Office Information */}
        <ContactCTA isStandalonePage={true} />

        {/* Quick FAQ Strip specifically for Quotes */}
        <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Questions fréquentes sur votre devis
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-sama-orange shrink-0" />
                  <span>Délai de réponse ?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Un membre de notre équipe vous répond généralement en moins de 24h ouvrées, directement par WhatsApp ou e-mail selon votre préférence.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-sama-orange shrink-0" />
                  <span>Budget minimum ?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nous accompagnons les entreprises à partir de 100 000 FCFA de budget publicitaire pour tester et calibrer les premières campagnes rentables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-sama-orange shrink-0" />
                  <span>Échange direct ?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vous pouvez aussi discuter directement avec un expert sur notre WhatsApp officiel (+221 76 142 28 58) pour une réponse instantanée.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Permanent Footer */}
      <Footer />

      {/* Permanent WhatsApp Floating Button */}
      <WhatsAppFloat />
    </>
  );
}
