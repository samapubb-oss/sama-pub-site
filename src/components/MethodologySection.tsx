"use client";

import React from "react";
import { methodologySteps } from "@/data/mock/about";
import {
  CheckCircle2,
  Search,
  Palette,
  Rocket,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const MethodologySection: React.FC = () => {
  const stepIcons = [
    {
      icon: <Search className="w-5 h-5 text-white drop-shadow" />,
      gradient: "from-blue-600 to-indigo-600 shadow-[0_8px_20px_rgba(37,99,235,0.35)] border-blue-400/40",
    },
    {
      icon: <Palette className="w-5 h-5 text-white drop-shadow" />,
      gradient: "from-orange-500 to-amber-600 shadow-[0_8px_20px_rgba(255,107,0,0.35)] border-orange-300/40",
    },
    {
      icon: <Rocket className="w-5 h-5 text-white drop-shadow" />,
      gradient: "from-amber-400 to-orange-500 shadow-[0_8px_20px_rgba(245,158,11,0.35)] border-amber-300/40",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-white drop-shadow" />,
      gradient: "from-emerald-500 to-teal-600 shadow-[0_8px_20px_rgba(16,185,129,0.35)] border-emerald-300/40",
    },
  ];

  return (
    <section id="methode" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Centered form and placement matching all other sections */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
              Notre méthode de travail
            </span>
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-normal md:leading-[1.25] mb-4">
            Un processus en 4 étapes{" "}
            <span className="text-sama-orange whitespace-nowrap">orienté rentabilité</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Une démarche méthodique, sans improvisation, pour transformer chaque campagne en levier de chiffre d'affaires prédictible.
          </p>
        </div>

        {/* 4 Steps Timeline / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {methodologySteps.map((step, idx) => {
            const stepConfig = stepIcons[idx % stepIcons.length];

            return (
              <div
                key={step.step}
                className="relative rounded-2xl p-6 sm:p-7 bg-slate-50 border border-slate-200/80 hover:border-sama-orange/50 transition-all duration-300 hover:shadow-xl group flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  {/* Step Number & 3D Glowing Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`relative w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${stepConfig.gradient}`}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                      {stepConfig.icon}
                    </div>

                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      Étape {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sama-orange transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Deliverables Pills */}
                <div className="pt-4 border-t border-slate-200/70">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Livrables clés :
                  </div>
                  <ul className="space-y-1.5">
                    {step.deliverables.map((del, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sama-orange shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
