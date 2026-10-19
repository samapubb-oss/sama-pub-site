"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Play, Target, Users, TrendingUp } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24 overflow-hidden bg-[#07162C] text-white"
    >
      {/* Background Radial Lighting & Sunset Horizon on the Right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07162C] via-[#091D3A] to-[#0E284F] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-sama-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-[#E25C05]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Heading, Value Prop & Dual CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            
            {/* Pill Capsule Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-slate-200 mb-3.5 sm:mb-6">
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden bg-white shrink-0 shadow-xs">
                <Image
                  src="/images/logo-sp.png"
                  alt="SAMA PUB Logo"
                  width={20}
                  height={20}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
              <span className="text-[11px] sm:text-sm font-semibold">Agence de publicité & marketing digital</span>
            </div>

            {/* H1 Main Heading: Perfectly scaled and balanced for mobile screens */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-3.5 sm:mb-6">
              Votre succès digital{" "}
              <span className="text-sama-orange block sm:inline">commence ici !</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-xl font-normal leading-relaxed mb-5 sm:mb-8">
              Stratégie, créativité et performance pour booster votre visibilité et attirer plus de clients.
            </p>

            {/* Dual CTAs: Ergonomic, touch-friendly, and immersive icons on mobile */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-5 sm:mb-10">
              <a
                href="#services"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-full shadow-lg hover:shadow-glow-orange transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Nos services</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-sama-orange transition-all duration-200 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>

              <a
                href="#a-propos"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-[#0A1F3C]/90 hover:bg-[#0E284F] rounded-full border border-white/20 backdrop-blur-sm transition-all duration-200 hover:border-white/40"
              >
                <div className="relative w-6 h-6 rounded-full bg-sama-orange/20 border border-sama-orange/40 flex items-center justify-center text-sama-orange group-hover:scale-110 transition-transform shrink-0">
                  <Play className="w-2.5 h-2.5 fill-sama-orange ml-0.5" />
                </div>
                <span>Voir notre présentation</span>
              </a>
            </div>

            {/* Desktop Single-Row Executive Trust Bar (visible only on desktop, fits flawlessly on one line) */}
            <div className="hidden lg:grid grid-cols-3 gap-3 pt-6 border-t border-white/15 w-full">
              {/* Item 1 */}
              <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/25 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(255,107,0,0.25)] shrink-0">
                  <Target className="w-4 h-4 text-sama-orange" />
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
                  Stratégie sur-mesure
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/25 to-cyan-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)] shrink-0">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
                  Équipe d'experts
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
                  Résultats mesurables
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Composite Hero Artwork Matching Mockup */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[540px]">
              
              {/* Sunset Dakar Cityscape Backdrop Frame with Senegal Flag */}
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#0A203F] to-[#07162C] p-2 sm:p-3 shadow-2xl">
                
                <div className="relative h-80 xs:h-96 sm:h-[420px] w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/miel-du-senegal.png"
                    alt="Campagne publicitaire Miel du Sénégal par SAMA PUB"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 540px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07162C]/80 via-transparent to-transparent" />

                  {/* Sunset City Glow & Monument Silhouette */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-orange-500/30 to-transparent pointer-events-none" />

                  {/* Senegal Flag Badge at Top Right */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white z-10">
                    <span>🇸🇳 Dakar, Sénégal</span>
                  </div>

                  {/* Mobile-Only Social Media Platform Badges (Inside photo frame at bottom-left, ZERO overlap with top card) */}
                  <div className="sm:hidden absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
                    <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wider mr-0.5">
                      Diffusé sur :
                    </span>
                    {/* Facebook */}
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    {/* Instagram */}
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    {/* TikTok */}
                    <div className="w-6 h-6 rounded-lg bg-black border border-white/20 flex items-center justify-center text-white shadow-sm">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.88-4.49V8.25a8.28 8.28 0 0 0 3.89 1.25V6.69z" />
                      </svg>
                    </div>
                    {/* Google */}
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* SAMA PUB Ads Engine card */}
                <div className="mt-2.5 p-3.5 rounded-xl bg-[#091D3A] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white shrink-0 shadow-xs border border-slate-200">
                      <Image
                        src="/images/logo-sp.png"
                        alt="SAMA PUB"
                        width={32}
                        height={32}
                        className="object-cover w-full h-full rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-sama-orange uppercase tracking-wider">
                        SAMA PUB Ads Engine
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        « Votre marque au bon endroit, au bon moment ! »
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active</span>
                  </div>
                </div>

              </div>

              {/* Mobile Immersive Trust List (placed directly underneath SAMA PUB ADS ENGINE on mobile) */}
              <div className="block lg:hidden mt-3.5 space-y-2.5 w-full">
                {/* Item 1 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#091D3A] to-[#07162C] border border-white/15 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_4px_12px_rgba(255,107,0,0.4)] border border-orange-300/40 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-white drop-shadow" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">Stratégie sur-mesure</div>
                      <div className="text-[10px] text-slate-300">Plan média & ciblage adapté à votre audience</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-lg border border-orange-500/30 shrink-0">
                    Sur-mesure
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#091D3A] to-[#07162C] border border-white/15 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-300/40 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white drop-shadow" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">Équipe d'experts</div>
                      <div className="text-[10px] text-slate-300">Media buyers & créatifs sénégalais dédiés</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-lg border border-blue-500/30 shrink-0">
                    Experts
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#091D3A] to-[#07162C] border border-white/15 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_4px_12px_rgba(16,185,129,0.4)] border border-emerald-300/40 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-white drop-shadow" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">Résultats mesurables</div>
                      <div className="text-[10px] text-slate-300">Rapports transparents & ROI en direct</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
                    ROI prouvé
                  </span>
                </div>
              </div>

              {/* Floating Top Right Executive Card: Plus de visibilité / Plus de clients (Now has full top clearance on mobile) */}
              <div className="absolute -top-3.5 right-2 sm:-top-5 sm:-right-4 z-20 bg-[#081B35]/95 border border-white/20 p-2.5 sm:p-3.5 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(255,107,0,0.25)] backdrop-blur-xl flex items-center gap-2.5 sm:gap-3 animate-float-slow">
                {/* Immersive 3D Glowing Growth Icon */}
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_4px_16px_rgba(255,107,0,0.5)] border border-orange-300/40 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-orange-400">
                      Plus de visibilité
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-white tracking-tight mt-0.5">
                    Plus de clients qualifiés
                  </div>
                </div>

                {/* Glowing Equalizer Sparkline Bars */}
                <div className="flex items-end gap-1 h-6 sm:h-7 pl-2 border-l border-white/15">
                  <span className="w-1 sm:w-1.5 h-3 sm:h-3.5 bg-gradient-to-t from-orange-600 to-amber-400 rounded-full animate-pulse" />
                  <span className="w-1 sm:w-1.5 h-4 sm:h-5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full" />
                  <span className="w-1 sm:w-1.5 h-6 sm:h-7 bg-gradient-to-t from-orange-400 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.6)]" />
                </div>
              </div>

              {/* Desktop Floating Social Media Platform Badges on Top/Left (Hidden on mobile, only shown on sm:) */}
              <div className="hidden sm:flex absolute -top-5 left-4 sm:left-6 items-center gap-2 z-20">
                {/* Facebook */}
                <div
                  title="Meta Ads (Facebook)"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1877F2] to-[#0D65D9] shadow-[0_6px_16px_rgba(24,119,242,0.45)] border border-blue-300/30 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>

                {/* Instagram */}
                <div
                  title="Instagram Ads"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-[0_6px_16px_rgba(220,39,67,0.45)] border border-pink-300/30 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>

                {/* TikTok */}
                <div
                  title="TikTok Ads"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#181818] to-[#050505] shadow-[0_6px_16px_rgba(0,0,0,0.6)] border border-white/25 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.88-4.49V8.25a8.28 8.28 0 0 0 3.89 1.25V6.69z" />
                  </svg>
                </div>

                {/* Google */}
                <div
                  title="Google Ads & SEO"
                  className="w-9 h-9 rounded-xl bg-white shadow-[0_6px_16px_rgba(255,255,255,0.25)] border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
