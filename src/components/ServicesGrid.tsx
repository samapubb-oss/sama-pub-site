"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Target,
  Lightbulb,
  BarChart3,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const defaultServices = [
    {
      id: "media-buying",
      title: "Media Buying",
      description: "Achat d'espace stratégique et campagnes publicitaires ultra-ciblées pour maximiser votre visibilité et votre rentabilité.",
      icon: <Megaphone className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-blue-600 to-indigo-600 shadow-[0_8px_22px_rgba(37,99,235,0.35)] border-blue-400/40",
      accentTag: "Facebook & Instagram",
      hoverGlow: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    },
    {
      id: "publicite-digitale",
      title: "Publicité Digitale",
      description: "Gestion experte de vos annonces sur Facebook, Instagram, TikTok, Google Search, Display et YouTube.",
      icon: <Target className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-orange-500 to-amber-600 shadow-[0_8px_22px_rgba(255,107,0,0.35)] border-orange-300/40",
      accentTag: "Multi-Plateformes",
      hoverGlow: "hover:border-orange-500/40 hover:shadow-orange-500/10",
    },
    {
      id: "creation-contenus",
      title: "Création de Contenus",
      description: "Vidéos percutantes, visuels professionnels et messages publicitaires conçus pour capter immédiatement l'attention.",
      icon: <Lightbulb className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-amber-400 to-orange-500 shadow-[0_8px_22px_rgba(245,158,11,0.35)] border-amber-300/40",
      accentTag: "Design & Copywriting",
      hoverGlow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
    },
    {
      id: "marketing-digital",
      title: "Marketing Digital",
      description: "Stratégies complètes d'inbound, community management, référencement et fidélisation de votre communauté.",
      icon: <BarChart3 className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-purple-600 to-indigo-600 shadow-[0_8px_22px_rgba(147,51,234,0.35)] border-purple-300/40",
      accentTag: "Stratégie 360°",
      hoverGlow: "hover:border-purple-500/40 hover:shadow-purple-500/10",
    },
    {
      id: "acquisition-clients",
      title: "Acquisition de Clients",
      description: "Génération de prospects qualifiés (leads) prêts à acheter vos produits et services au Sénégal et en Afrique de l'Ouest.",
      icon: <Users className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-emerald-500 to-teal-600 shadow-[0_8px_22px_rgba(16,185,129,0.35)] border-emerald-300/40",
      accentTag: "Ventes & Leads",
      hoverGlow: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    },
    {
      id: "conseil-strategie",
      title: "Conseil & Stratégie",
      description: "Audit personnalisé, définition des KPIs, positionnement de marque et accompagnement sur-mesure pour votre direction.",
      icon: <TrendingUp className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-cyan-500 to-blue-600 shadow-[0_8px_22px_rgba(6,182,212,0.35)] border-cyan-300/40",
      accentTag: "Croissance & ROI",
      hoverGlow: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
    },
  ];

export const ServicesGrid: React.FC = () => {
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setServices(
            data.map((dbItem, index) => {
              const fallback =
                defaultServices.find((s) => s.id === dbItem.id) ||
                defaultServices[index % defaultServices.length];
              return {
                ...fallback,
                id: dbItem.id,
                title: dbItem.title,
                description: dbItem.description,
                accentTag: dbItem.platforms?.[0] || fallback.accentTag,
              };
            })
          );
        }
      } catch (err) {
        console.warn("Utilisation des services locaux suite à:", err);
      }
    }
    fetchServices();
  }, []);

  return (
    <section id="services" className="py-20 md:py-28 bg-[#FAFAFC] relative overflow-hidden">
      {/* Subtle background ambient accents */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sama-orange/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Centered form and placement matching all other sections */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
              Nos expertises métiers
            </span>
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-normal md:leading-[1.25] mb-4">
            Des solutions digitales{" "}
            <span className="text-sama-orange whitespace-nowrap">orientées rentabilité</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            De la conception créative au ciblage algorithmique, nous déployons des campagnes d'envergure pour attirer un flux continu de prospects qualifiés vers votre entreprise.
          </p>
        </div>

        {/* 6 Services Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-12 sm:mb-16">
          {services.map((item) => (
            <div
              key={item.id}
              className={`group p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden ${item.hoverGlow}`}
            >
              {/* Subtle card top gradient strip on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity from-transparent via-sama-orange to-transparent" />

              <div>
                {/* Top row: Immersive 3D Icon + Micro tag */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${item.containerGradient}`}
                  >
                    {/* Inner specular gloss */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                    {item.icon}
                  </div>

                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 group-hover:bg-orange-50 group-hover:text-sama-orange px-3 py-1 rounded-full border border-slate-200/60 transition-colors">
                    {item.accentTag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sama-orange transition-colors mb-2.5">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                  {item.description}
                </p>
              </div>

              {/* Action Link in Bottom */}
              <Link
                href="/devis"
                className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-600 group-hover:text-sama-orange transition-colors"
              >
                <span>Demander un devis dédié</span>
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-sama-orange group-hover:bg-sama-orange group-hover:text-white transition-all duration-200">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Banner: Reassurance & Direct Action Callout - 100% Mobile Optimized */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#07162C] via-[#0E284F] to-[#07162C] text-white border border-white/10 sm:border-orange-500/20 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 sm:space-y-2.5 text-center lg:text-left w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[11px] sm:text-xs font-semibold text-sama-orange mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-sama-orange shrink-0" />
              <span>Accompagnement d&apos;élite à Dakar</span>
            </div>
            
            <div className="w-full max-w-sm sm:max-w-none mx-auto lg:mx-0 flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-200">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-2 text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-sama-orange shrink-0 mt-1 sm:mt-0 shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                <span className="leading-snug sm:leading-normal">Campagnes optimisées en temps réel (ROAS mesurable)</span>
              </div>
              <span className="hidden sm:inline text-slate-500">•</span>
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-2 text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-sama-orange shrink-0 mt-1 sm:mt-0 shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                <span className="leading-snug sm:leading-normal">Créations conformes aux algorithmes Meta &amp; TikTok</span>
              </div>
            </div>
          </div>

          <Link
            href="/devis"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-full bg-sama-orange hover:bg-sama-orange-hover active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(255,107,0,0.35)] hover:shadow-glow-orange transition-all transform hover:-translate-y-0.5 group text-center cursor-pointer"
          >
            <span className="sm:hidden leading-none">Discuter avec un expert</span>
            <span className="hidden sm:inline leading-tight whitespace-nowrap">
              Discuter de vos objectifs avec un expert
            </span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
};
