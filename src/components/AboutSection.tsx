"use client";

import React from "react";
import Image from "next/image";
import {
  Lightbulb,
  ShieldCheck,
  HeartHandshake,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const defaultPillars = [
  {
    id: "creativite",
    title: "Créativité sans limite",
    subtitle: "Concepts visuels & accroches percutantes",
    icon: <Lightbulb className="w-4 h-4 text-white drop-shadow" />,
    gradient: "from-amber-400 to-orange-500 shadow-[0_4px_16px_rgba(245,158,11,0.35)] border-amber-300/40",
  },
  {
    id: "expertise",
    title: "Expertise digitale",
    subtitle: "Maîtrise pointue des algorithmes publicitaires",
    icon: <ShieldCheck className="w-4 h-4 text-white drop-shadow" />,
    gradient: "from-blue-600 to-indigo-600 shadow-[0_4px_16px_rgba(37,99,235,0.35)] border-blue-300/40",
  },
  {
    id: "accompagnement",
    title: "Accompagnement personnalisé",
    subtitle: "Un interlocuteur dédié réactif au quotidien",
    icon: <HeartHandshake className="w-4 h-4 text-white drop-shadow" />,
    gradient: "from-orange-500 to-rose-500 shadow-[0_4px_16px_rgba(255,107,0,0.35)] border-orange-300/40",
  },
  {
    id: "resultats",
    title: "Résultats mesurables",
    subtitle: "Rapports clairs & calcul précis du ROI",
    icon: <BarChart2 className="w-4 h-4 text-white drop-shadow" />,
    gradient: "from-emerald-500 to-teal-600 shadow-[0_4px_16px_rgba(16,185,129,0.35)] border-emerald-300/40",
  },
];

export const AboutSection: React.FC = () => {
  const [pillars, setPillars] = React.useState(defaultPillars);

  React.useEffect(() => {
    async function fetchPillars() {
      try {
        const { data, error } = await supabase
          .from("about_pillars")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setPillars(
            data.map((item, index) => {
              const fallback =
                defaultPillars.find((p) => p.id === item.id) ||
                defaultPillars[index % defaultPillars.length];
              return {
                ...fallback,
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
              };
            })
          );
        }
      } catch (err) {
        console.warn("Utilisation des piliers locaux suite à:", err);
      }
    }
    fetchPillars();
  }, []);

  return (
    <section id="a-propos" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Title & Mission Text (4 cols) */}
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
                À propos de SAMA PUB
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-snug sm:leading-normal mb-5">
              Une agence engagée <br />
              <span className="text-sama-orange">pour votre réussite</span>
            </h2>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed mb-6">
              <p>
                <strong className="text-slate-900 font-bold">SAMA PUB</strong> est une agence de publicité et de marketing digital basée à Dakar, spécialisée dans le Media Buying, la création de contenus et l'acquisition de clients.
              </p>
              <p>
                Notre mission : concevoir des stratégies publicitaires sur-mesure pour vous offrir une visibilité maximale et une croissance pérenne au Sénégal et dans la sous-région ouest-africaine.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Partenaire de croissance des entreprises dakaroises</span>
            </div>
          </div>

          {/* Center Column: Devices & Visual Mockup (4 cols) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[340px] p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/90 shadow-xl text-center transform hover:scale-[1.02] transition-transform duration-300">
              
              {/* SAMA PUB Official Logo */}
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo-sp.png"
                  alt="SAMA PUB Logo Officiel"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>

              <div className="text-base font-black text-slate-900 mb-0.5 tracking-tight">
                SAMA PUB
              </div>
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold mb-4">
                Plus de visibilité • Plus de clients
              </div>

              {/* High-tech Screen Graphic */}
              <div className="rounded-2xl bg-gradient-to-b from-[#091D3A] to-[#061427] text-white p-4 border border-white/10 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/15 rounded-full blur-xl pointer-events-none" />

                <div className="text-[10px] uppercase font-bold text-sama-orange tracking-wider mb-1">
                  Campagnes & Visibilité
                </div>
                <div className="text-sm font-black tracking-tight mb-1 text-white">
                  BOOSTEZ VOTRE BUSINESS
                </div>
                <div className="text-[11px] text-slate-300 mb-3">
                  Avec les experts SAMA PUB
                </div>

                <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-white/10 border border-white/10 w-fit mx-auto text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Performances actives</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: 4 Pillars List (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            {pillars.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-sama-orange/40 hover:shadow-md transition-all duration-300"
              >
                {/* Immersive 3D Icon Container */}
                <div
                  className={`relative w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.gradient}`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {item.icon}
                </div>

                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sama-orange transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
