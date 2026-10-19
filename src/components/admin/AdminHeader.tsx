"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, User, LogOut, Shield } from "lucide-react";
import Image from "next/image";

interface AdminHeaderProps {
  unreadCount?: number;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  unreadCount = 0,
  onLogout,
  onMenuToggle,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Hamburger & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="w-9 h-9 rounded-xl text-slate-700 bg-slate-100/70 hover:bg-slate-200/70 flex items-center justify-center md:hidden cursor-pointer shrink-0 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
            Tableau de bord
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-400 font-normal leading-tight truncate hidden xs:block sm:block">
            Gérez vos demandes de devis et prospects
          </p>
        </div>
      </div>

      {/* Right: Notification Bell & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2.5 rounded-full hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-sama-orange rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Admin Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {/* Avatar Circle - No black background, fills container */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-sama-orange/20 shadow-xs flex items-center justify-center shrink-0">
              <Image
                src="/images/logo-sp.png"
                alt="ABDOU LAHAT DIOP"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="hidden sm:inline text-xs font-bold text-slate-800 tracking-tight">
              ABDOU LAHAT DIOP
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-slate-900">ABDOU LAHAT DIOP</p>
                <p className="text-[10px] text-slate-500 truncate">samapubb@gmail.com</p>
              </div>

              <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Compte agence
              </div>

              <div className="px-4 py-2 text-xs text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sama-orange shrink-0" />
                <span className="font-semibold">Accès PDG SAMAPUB</span>
              </div>

              {onLogout && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Verrouiller la session</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
