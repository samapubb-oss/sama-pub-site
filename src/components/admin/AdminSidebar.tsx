"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  FileText,
  Globe,
  Users,
  Briefcase,
  Settings,
  Lock,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount?: number;
  pendingWebsiteCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount = 0,
  pendingWebsiteCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: "overview",
      label: "Vue d'ensemble",
      icon: Home,
      accent: "orange",
    },
    {
      id: "quotes",
      label: "Demandes de devis",
      icon: FileText,
      badgeCount: pendingCount,
      accent: "orange",
    },
    {
      id: "website_quotes",
      label: "Devis Sites Web",
      icon: Globe,
      badgeCount: pendingWebsiteCount,
      accent: "sky",
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      accent: "orange",
    },
    {
      id: "services",
      label: "Services",
      icon: Briefcase,
      accent: "orange",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      accent: "orange",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 min-h-screen select-none transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Top Branding / Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Monogram SP / Icon - No black background, fills container */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-xs ring-2 ring-slate-100 bg-white flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo-sp.png"
                  alt="SAMA PUB"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-sama-orange transition-colors">
                  SAMA <span className="text-sama-orange">PUB</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Espace Admin
                </span>
              </div>
            </Link>

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 md:hidden cursor-pointer"
                aria-label="Fermer le menu"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isSky = item.accent === "sky";

              const activeContainerClass = isSky
                ? "text-sky-700 bg-sky-50 font-bold shadow-xs"
                : "text-sama-orange bg-[#FFF7ED] font-bold shadow-xs";

              const activeBarClass = isSky ? "bg-sky-600" : "bg-sama-orange";

              const activeIconClass = isSky
                ? "text-sky-600 stroke-[2.5]"
                : "text-sama-orange stroke-[2.5]";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left min-h-[44px] ${
                    isActive
                      ? activeContainerClass
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {/* Active Indicator Bar on the left */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md ${activeBarClass}`}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? activeIconClass : "text-slate-400 stroke-[1.8]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Badge Notification si demandes en attente */}
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSky
                          ? "bg-sky-600 text-white"
                          : "bg-sama-orange text-white"
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Pinned Link: Espace privé */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Espace privé</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
