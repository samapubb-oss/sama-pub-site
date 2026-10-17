"use client";

import React, { useState, useEffect } from "react";
import { Target, Users, Eye, TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const defaultStats = [
    {
      id: "campagnes",
      number: "+150",
      label: "Campagnes menées",
      sublabel: "Meta, Google & TikTok Ads",
      badge: "Vérifiées",
      icon: <Target className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-orange-500 to-amber-600 shadow-[0_8px_24px_rgba(255,107,0,0.45)] border-orange-300/40",
      cardHoverGlow: "group-hover:border-orange-500/50",
    },
    {
      id: "clients",
      number: "+100",
      label: "Clients satisfaits",
      sublabel: "PME, commerces & marques",
      badge: "Fidélité 94%",
      icon: <Users className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-blue-600 to-indigo-600 shadow-[0_8px_24px_rgba(37,99,235,0.45)] border-blue-300/40",
      cardHoverGlow: "group-hover:border-blue-400/50",
    },
    {
      id: "impressions",
      number: "+5M",
      label: "Personnes touchées",
      sublabel: "Au Sénégal & en zone UEMOA",
      badge: "Portée active",
      icon: <Eye className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-amber-500 to-orange-500 shadow-[0_8px_24px_rgba(245,158,11,0.45)] border-amber-300/40",
      cardHoverGlow: "group-hover:border-amber-400/50",
    },
    {
      id: "roi",
      number: "+3x",
      label: "En moyenne de ROI",
      sublabel: "Retour sur dépense publicitaire",
      badge: "Rentabilité",
      icon: <TrendingUp className="w-5 h-5 text-white drop-shadow" />,
      containerGradient: "from-emerald-500 to-teal-600 shadow-[0_8px_24px_rgba(16,185,129,0.45)] border-emerald-300/40",
      cardHoverGlow: "group-hover:border-emerald-400/50",
    },
  ];

export const StatsCounter: React.FC = () => {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from("stats_metrics")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setStats(
            data.map((item, index) => {
              const fallback =
                defaultStats.find((s) => s.id === item.id) ||
                defaultStats[index % defaultStats.length];
              return {
                ...fallback,
                id: item.id,
                number: `${item.prefix || ""}${item.value}${item.suffix || ""}`,
                label: item.label,
                sublabel: item.sublabel || fallback.sublabel,
              };
            })
          );
        }
      } catch (err) {
        console.warn("Utilisation des stats locales suite à:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#061529] via-[#081E3B] to-[#051122] py-16 sm:py-24 text-white border-y border-white/10 relative overflow-hidden">
      {/* Dynamic ambient backdrops */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-sama-orange/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Centered form and placement matching FAQ section */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
              Notre impact en chiffres
            </span>
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-snug sm:leading-normal md:leading-[1.25] mb-4">
            Des résultats qui{" "}
            <span className="text-sama-orange whitespace-nowrap">parlent d'eux-mêmes</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Chaque franc investi est piloté par la donnée pour maximiser votre visibilité et générer des ventes concrètes au Sénégal et dans la sous-région.
          </p>
        </div>

        {/* 4 Immersive Stat Cards: 4 columns on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.id}
              className={`group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c2242]/90 to-[#08182f]/80 border border-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_20px_rgba(255,107,0,0.15)] flex flex-col justify-between relative overflow-hidden ${item.cardHoverGlow}`}
            >
              {/* Subtle Inner Glow on Hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] group-hover:bg-white/[0.07] rounded-full blur-xl pointer-events-none transition-colors" />

              {/* Top Row: Immersive 3D Glowing Icon & Badge */}
              <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${item.containerGradient}`}
                >
                  {/* Specular highlight gloss */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {item.icon}
                </div>

                <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-300 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                  {item.badge}
                </span>
              </div>

              {/* Stat Number & Descriptive Labels */}
              <div className="relative z-10">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                    {item.number}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                  {item.label}
                </div>

                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
                  {item.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Trust Indicator below cards */}
        <div className="flex justify-center mt-8 sm:mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-sama-orange" />
            <span>Données mesurées en temps réel sur dashboards certifiés</span>
          </div>
        </div>

      </div>
    </section>
  );
};
