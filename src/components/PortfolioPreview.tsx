"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { mockPortfolio } from "@/data/mock/faq";
import { PortfolioItem } from "@/types";
import { Lock, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const PortfolioPreview: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(mockPortfolio);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from("portfolio_cases")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setPortfolio(
            data.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              objective: item.objective,
              tag: item.tag,
              imageUrl: item.image_url || (item as any).imageUrl,
              metrics: (item.metrics as any) || [],
              isDemo: false,
            }))
          );
        }
      } catch (err) {
        console.warn("Utilisation du portfolio local suite à:", err);
      }
    }
    fetchPortfolio();
  }, []);
  return (
    <section id="realisations" className="py-12 sm:py-20 md:py-28 bg-[#07162C] text-white relative overflow-hidden border-t border-white/10">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sama-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Centered form and placement matching FAQ section */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
              Réalisations & Études de Cas
            </span>
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-snug sm:leading-normal md:leading-[1.25] mb-4">
            Des campagnes conçues{" "}
            <span className="text-sama-orange whitespace-nowrap">pour convertir</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Découvrez nos approches créatives et nos stratégies d'acquisition. Chaque dispositif est conçu pour générer des ventes mesurables.
          </p>
        </div>

        {/* 3 Case Study Cards: Fully responsive and optimized on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-gradient-to-br from-[#0c2242]/70 to-[#07162C]/80 border border-white/10 p-4 sm:p-5 lg:p-6 flex flex-col justify-between hover:border-sama-orange/50 transition-all duration-300 hover:shadow-xl group"
            >
              <div>
                {/* Visual Campaign Image Frame */}
                {item.imageUrl && (
                  <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-4 border border-white/10 bg-slate-900/60 shadow-inner">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c2242]/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Category & Tag Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/15 px-2.5 py-1 rounded-full border border-orange-500/30 truncate max-w-[65%]">
                    {item.category}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                    {item.tag || "Données réelles"}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1.5 group-hover:text-sama-orange transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-6 leading-relaxed font-normal">
                  {item.objective}
                </p>
              </div>

              {/* Metrics Showcase : 3 metrics with flawless responsive spacing */}
              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                  {item.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="bg-white/[0.04] rounded-xl p-2 sm:p-2.5 border border-white/5 flex flex-col justify-between">
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight line-clamp-1 sm:line-clamp-2">
                        {m.label}
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg font-black text-sama-orange mt-1 tracking-tight truncate">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-sama-orange transition-colors"
                >
                  <span>Étudier un projet similaire</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-sama-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Confidentiality Notice & Access Request Encart (Mobile Ergonomics) */}
        <div className="rounded-2xl bg-gradient-to-r from-[#091D3A] to-[#07162C] border border-sama-orange/30 p-4.5 sm:p-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sama-orange/20 border border-sama-orange/40 flex items-center justify-center text-sama-orange shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white mb-1">
                Campagnes & Métriques Certifiées Meta Ads Manager
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Les chiffres ci-dessus sont directement extraits de nos comptes publicitaires Meta Ads actifs. Par respect des accords de confidentialité avec nos clients partenaires, l'accès détaillé aux tunnels de vente et dashboards complets est présenté lors de notre entretien stratégique.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="w-full sm:w-auto text-center shrink-0 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-full shadow-md transition-all hover:scale-105"
          >
            Demander un aperçu confidentiel
          </a>
        </div>

      </div>
    </section>
  );
};
