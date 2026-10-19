"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Send, Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const headerRef = useRef<HTMLElement | null>(null);

  // Close mobile drawer on click outside or Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  // Prevent ScrollSpy from overriding active item while smooth scrolling after a user click
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navLinks = [
    { id: "hero", label: "Accueil", href: "/#hero" },
    { id: "a-propos", label: "À propos", href: "/#a-propos" },
    { id: "services", label: "Services", href: "/#services" },
    { id: "realisations", label: "Réalisations", href: "/#realisations" },
    { id: "temoignages", label: "Témoignages", href: "/#temoignages" },
    { id: "blog", label: "Blog", href: "/#blog" },
    { id: "contact", label: "Contact", href: "/#contact" },
  ];

  // Dynamic ScrollSpy tracking for section visibility and active indicator
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Skip scrollspy when navigating via click or not on the homepage
      if (pathname !== "/" || isClickScrollingRef.current) {
        return;
      }

      // 1. At the very top of the page, always activate "hero" (Accueil)
      if (window.scrollY < 120) {
        setActiveSection("hero");
        return;
      }

      // 2. Near bottom of page, always activate "contact"
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      if (isAtBottom) {
        setActiveSection("contact");
        return;
      }

      // 3. Viewport-based detection: check sections from bottom to top in order of appearance
      const sectionsOrder = [
        { elId: "contact", navId: "contact" },
        { elId: "faq", navId: "blog" },
        { elId: "realisations", navId: "realisations" },
        { elId: "a-propos", navId: "a-propos" },
        { elId: "services", navId: "services" },
        { elId: "hero", navId: "hero" },
      ];

      const readingLineOffset = 160; // 160px from viewport top (below header)

      for (const item of sectionsOrder) {
        const el = document.getElementById(item.elId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= readingLineOffset) {
            setActiveSection(item.navId);
            return;
          }
        }
      }
    };

    const handleScrollEnd = () => {
      isClickScrollingRef.current = false;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd);

    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Sync hash on direct page load or browser back/forward
  useEffect(() => {
    const handleHashSync = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.replace("#", "");
        if (hash) {
          setActiveSection(hash);
        }
      }
    };

    handleHashSync();
    window.addEventListener("hashchange", handleHashSync);
    return () => window.removeEventListener("hashchange", handleHashSync);
  }, [pathname]);

  // Handle smooth scroll & state update on click
  const handleNavClick = (
    item: { id: string; href: string },
    e: React.MouseEvent
  ) => {
    // 1. Immediately activate the clicked menu item
    setActiveSection(item.id);
    setMobileMenuOpen(false);

    if (pathname === "/") {
      const targetId = item.id === "blog" ? "faq" : item.id === "temoignages" ? "realisations" : item.id;
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();

        // Lock scrollspy during smooth scroll animation
        isClickScrollingRef.current = true;
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => {
          isClickScrollingRef.current = false;
        }, 1200);

        const headerOffset = 75;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: item.id === "hero" ? 0 : offsetPosition,
          behavior: "smooth",
        });

        window.history.pushState(null, "", `#${item.id}`);
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay - closes drawer on tap anywhere outside */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200 cursor-pointer"
        />
      )}

      <header
        ref={headerRef}
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

          {/* Center Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Navigation principale">
            {navLinks.map((item) => {
              const isActive = pathname === "/" && activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`relative py-1 text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "text-slate-900 font-bold"
                      : "text-slate-600 hover:text-sama-orange"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sama-orange rounded-full transition-all duration-300" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA Button -> Dedicated /devis Page */}
          <div className="hidden sm:flex items-center">
            <Link
              href="/devis"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-full shadow-md hover:shadow-glow-orange transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Demander un devis</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle & Devis Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/devis"
              className="sm:hidden inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold text-white bg-sama-orange hover:bg-sama-orange-hover active:scale-95 rounded-full shadow-sm transition-all"
            >
              Devis
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-sama-orange rounded-lg focus:outline-none transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-5 space-y-3 animate-in fade-in-50 duration-200">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((item) => {
              const isActive = pathname === "/" && activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`px-3.5 py-2.5 text-base font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "text-sama-orange bg-orange-50 font-bold shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-sama-orange"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/devis"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover active:scale-95 rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Demander un devis</span>
            </Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
};
