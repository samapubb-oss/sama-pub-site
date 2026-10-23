import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { WebsiteOrderForm } from "@/components/website-order/WebsiteOrderForm";
import {
  Sparkles,
  ArrowLeft,
  Smartphone,
  CreditCard,
  Search,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Création de Site Internet & E-commerce à Dakar | SAMA PUB",
  description:
    "Confiez la création de votre site internet à SAMA PUB : site vitrine, e-commerce avec Wave et Orange Money, immobilier, portfolio. Devis gratuit et sur-mesure au Sénégal.",
  openGraph: {
    title: "Création de Site Internet & E-commerce à Dakar | SAMA PUB",
    description:
      "Sites vitrines et boutiques e-commerce ultra-rapides conçus pour générer des ventes au Sénégal et à l'international.",
  },
};

export default function CreationSiteInternetPage() {
  return (
    <>
      {/* Sticky Navigation Header */}
      <Header />

      <main className="flex-1 bg-slate-50 min-h-screen">
        
        {/* =========================================================================
            HERO SECTION: 100% RESPONSIVE MOBILE & DESKTOP (Ultra-Moderne & Immersif)
            ========================================================================= */}
        <section className="pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-12 bg-gradient-to-b from-[#061427] via-[#091D3A] to-[#0A2242] border-b border-white/10 text-white relative overflow-hidden">
          {/* Ambient Lighting Halos */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-sama-orange/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
            
            {/* Breadcrumb Navigation */}
            <div className="mb-3 sm:mb-5 flex items-center gap-2 text-xs text-slate-400">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-0.5 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sama-orange transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Retour à l'accueil</span>
              </Link>
              <span>/</span>
              <span className="text-sama-orange font-semibold">Création de site internet</span>
            </div>

            {/* Hero Main Copy */}
            <div className="text-left lg:text-center max-w-4xl mx-auto mb-6 sm:mb-8">
              {/* Badge pôle web (Masqué sur mobile pour aérer l'écran et focus direct sur l'accroche) */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-sama-orange mb-3 sm:mb-4 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-sama-orange shrink-0 animate-pulse" />
                <span>Pôle Développement Web & E-commerce · Dakar</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.22] sm:leading-[1.18] mb-3 sm:mb-4">
                Créez un site web d'élite qui{" "}
                <span className="relative inline-block mt-0.5 sm:mt-0">
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent animate-pulse-slow font-black">
                    multiplie vos clients & vos ventes
                  </span>
                  {/* Halo lumineux subtil et immersif */}
                  <span className="absolute -inset-x-2 -inset-y-1 bg-sama-orange/20 blur-md -z-10 rounded-xl pointer-events-none" />
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-300 max-w-2xl lg:mx-auto leading-relaxed font-normal">
                Plateforme 100% optimisée pour le marché sénégalais : paiements locaux Wave & Orange Money, WhatsApp direct et visibilité Google garantie. Configurez votre devis interactif en 5 étapes simples.
              </p>
            </div>

            {/* =========================================================================
                DESKTOP : 3 CARTES PARFAITEMENT CENTRÉES AU MILIEU (GRID 3 COLONNES)
                ========================================================================= */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
              
              {/* Carte 1 : 100% Mobile First (Centrée au milieu) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md hover:border-sama-orange/60 hover:bg-white/[0.1] transition-all group flex flex-col items-center text-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-sama-orange flex items-center justify-center shrink-0 border border-orange-500/30 shadow-[0_0_20px_rgba(255,107,0,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform mb-3">
                  <Smartphone className="w-6 h-6 text-sama-orange" />
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-full border border-orange-500/25">
                    Mobile First
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1">
                  100% Responsive
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fluide & optimisé sur smartphones à Dakar
                </p>
              </div>

              {/* Carte 2 : Wave & Orange Money (Centrée au milieu) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md hover:border-blue-400/60 hover:bg-white/[0.1] transition-all group flex flex-col items-center text-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1877F2]/30 via-blue-500/20 to-[#FF6B00]/30 text-white flex items-center justify-center shrink-0 border border-blue-400/30 shadow-[0_0_20px_rgba(24,119,242,0.3)] group-hover:scale-110 group-hover:-rotate-3 transition-transform mb-3">
                  <CreditCard className="w-6 h-6 text-blue-300" />
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#1BA7F3] bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-400/30">
                    Wave
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#FF6B00] bg-orange-500/15 px-2 py-0.5 rounded-full border border-orange-400/30">
                    Orange Money
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1">
                  Paiements Locaux
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Encaissement sécurisé en 1 clic
                </p>
              </div>

              {/* Carte 3 : Référencement SEO Google Dakar (Centrée au milieu) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md hover:border-emerald-400/60 hover:bg-white/[0.1] transition-all group flex flex-col items-center text-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform mb-3">
                  <Search className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    SEO Google
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1">
                  Visibilité Dakar & UEMOA
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Positionné en 1ère page de recherche
                </p>
              </div>

            </div>

            {/* =========================================================================
                MOBILE : DÉFILEMENT AUTOMATIQUE IMMERSIF (ANIMATION INFINIE CONTINUE)
                Les icônes ne sont plus cachées et défilent automatiquement en boucle
                ========================================================================= */}
            <div className="sm:hidden relative -mx-3.5 px-3.5 overflow-hidden py-1">
              {/* Masques de fondu latéraux */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#061427] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#061427] to-transparent z-10 pointer-events-none" />

              <div className="animate-marquee flex gap-3 w-max">
                {/* Premier jeu de 3 cartes */}
                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-sama-orange flex items-center justify-center shrink-0 border border-orange-500/30">
                    <Smartphone className="w-5 h-5 text-sama-orange" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20 inline-block mb-0.5">
                      Mobile First
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">100% Responsive</h3>
                    <p className="text-[10px] text-slate-300 truncate">Fluide sur smartphone</p>
                  </div>
                </div>

                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <CreditCard className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#1BA7F3] bg-blue-500/15 px-1.5 py-0.2 rounded border border-blue-400/30 inline-block mb-0.5">
                      Wave & OM
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">Paiements Locaux</h3>
                    <p className="text-[10px] text-slate-300 truncate">Encaissement 1 clic</p>
                  </div>
                </div>

                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                    <Search className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 inline-block mb-0.5">
                      SEO Google
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">Visibilité Dakar</h3>
                    <p className="text-[10px] text-slate-300 truncate">1ère page de recherche</p>
                  </div>
                </div>

                {/* Duplication pour boucle infinie fluide */}
                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-sama-orange flex items-center justify-center shrink-0 border border-orange-500/30">
                    <Smartphone className="w-5 h-5 text-sama-orange" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20 inline-block mb-0.5">
                      Mobile First
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">100% Responsive</h3>
                    <p className="text-[10px] text-slate-300 truncate">Fluide sur smartphone</p>
                  </div>
                </div>

                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <CreditCard className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#1BA7F3] bg-blue-500/15 px-1.5 py-0.2 rounded border border-blue-400/30 inline-block mb-0.5">
                      Wave & OM
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">Paiements Locaux</h3>
                    <p className="text-[10px] text-slate-300 truncate">Encaissement 1 clic</p>
                  </div>
                </div>

                <div className="w-[230px] p-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                    <Search className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 inline-block mb-0.5">
                      SEO Google
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">Visibilité Dakar</h3>
                    <p className="text-[10px] text-slate-300 truncate">1ère page de recherche</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION FORMULAIRE INTERACTIF (Auto-avance, Animations & Zéro friction)
            ========================================================================= */}
        <section id="formulaire-creation" className="relative scroll-mt-20">
          <WebsiteOrderForm />
        </section>

        {/* =========================================================================
            SECTION MÉTHODOLOGIE & RÉASSURANCE
            ========================================================================= */}
        <section className="py-14 sm:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
                <span className="text-xs font-bold uppercase tracking-wider text-sama-orange">
                  Méthodologie SAMA PUB
                </span>
                <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Un accompagnement d'élite de A à Z
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                Nous concevons des plateformes prêtes à générer des résultats commerciaux immédiats, faciles à administrer et garanties sans frais cachés.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-sama-orange flex items-center justify-center font-black text-sm mb-3 group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Design UX & Identité Visuelle
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Charte graphique personnalisée, typographies soignées et hiérarchie visuelle pour inspirer confiance dès les 3 premières secondes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm mb-3 group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Développement Ultra-Rapide
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Technologies Next.js et React assurant un chargement instantané même avec les connexions mobiles sénégalaises 3G/4G.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm mb-3 group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Tracking Pubs & Pixels Inclus
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Pixel Meta, TikTok Ads et Google Ads configurés dès le lancement pour mesurer vos ventes et rentabiliser vos campagnes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm mb-3 group-hover:scale-110 transition-transform">
                  04
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Formation & Propriété 100%
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Le site vous appartient intégralement. Nous formons votre équipe à modifier vos produits et textes en toute indépendance.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloat />

      {/* Official Footer */}
      <Footer />
    </>
  );
}
