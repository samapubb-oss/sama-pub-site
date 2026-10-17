"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Send, Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Accueil", href: "#hero", active: true },
    { label: "À propos", href: "#a-propos" },
    { label: "Services", href: "#services" },
    { label: "Réalisations", href: "#realisations" },
    { label: "Témoignages", href: "#temoignages" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md py-3" : "py-4 md:py-5 border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo SAMA PUB */}
          <Link href="/" className="focus:outline-none" aria-label="SAMA PUB Accueil">
            <Logo variant="light" size="md" />
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Navigation principale">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative py-1 text-sm font-semibold transition-colors ${
                  item.active
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-sama-orange"
                }`}
              >
                {item.label}
                {item.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sama-orange rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Action CTA Button */}
          <div className="hidden sm:flex items-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-full shadow-md hover:shadow-glow-orange transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Demander un devis</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="#devis"
              className="sm:hidden inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold text-white bg-sama-orange rounded-full shadow-sm"
            >
              Devis
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-sama-orange rounded-lg focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-5 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-base font-semibold rounded-lg ${
                  item.active
                    ? "text-sama-orange bg-orange-50"
                    : "text-slate-700 hover:bg-slate-50 hover:text-sama-orange"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <a
              href="#devis"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-xl shadow-md"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Demander un devis</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
