"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  ExternalLink,
  X,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { LeadQuote } from "@/components/admin/LeadsTable";
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestPushNotification,
  playExecutiveChime,
} from "@/lib/notificationService";

interface AdminHeaderProps {
  unreadCount?: number;
  pendingLeads?: LeadQuote[];
  onInspectLead?: (lead: LeadQuote) => void;
  onViewAllPending?: () => void;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  unreadCount = 0,
  pendingLeads = [],
  onInspectLead,
  onViewAllPending,
  onLogout,
  onMenuToggle,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isActivatingNotif, setIsActivatingNotif] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notification permission status on mount
  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  // Request notification permission on mobile / desktop
  const handleEnableNotifications = async () => {
    setIsActivatingNotif(true);
    try {
      const res = await requestNotificationPermission();
      setNotifPermission(res);
      if (res === "granted") {
        await sendTestPushNotification();
      }
    } finally {
      setIsActivatingNotif(false);
    }
  };

  // Test notification button
  const handleTestNotification = async () => {
    await sendTestPushNotification();
  };

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    if (profileOpen || notificationsOpen) {
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
  }, [profileOpen, notificationsOpen]);

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
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Interactive Notification Bell */}
        <div ref={notifDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className={`relative p-2.5 rounded-full transition-all cursor-pointer ${
              notificationsOpen
                ? "bg-orange-50 text-sama-orange ring-2 ring-sama-orange/30 shadow-xs"
                : "hover:bg-slate-100/80 text-slate-600"
            }`}
            aria-label={`Notifications (${unreadCount} non lues)`}
            title="Notifications et alertes de nouveaux devis"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-sama-orange text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN / DRAWER */}
          {notificationsOpen && (
            <div className="fixed inset-x-2 top-18 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 to-[#0E284F] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sama-orange/20 border border-sama-orange/40 flex items-center justify-center text-sama-orange">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-sama-orange text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] text-slate-300">
                      {unreadCount > 0
                        ? `${unreadCount} demande${unreadCount > 1 ? "s" : ""} en attente de réponse`
                        : "Toutes les demandes sont traitées"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Push Notification Setup Banner */}
              <div className="p-3 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 border-b border-orange-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sama-orange text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] font-black text-slate-900 leading-tight">
                        Alertes en direct sur smartphone
                      </p>
                      {notifPermission === "granted" ? (
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Actives
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      {notifPermission === "granted"
                        ? "Votre téléphone recevra une notification instantanée à chaque devis."
                        : "Recevez une alerte sur votre téléphone dès qu'un nouveau devis est envoyé."}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {notifPermission === "granted" ? (
                        <button
                          type="button"
                          onClick={handleTestNotification}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Envoyer une notification test</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleEnableNotifications}
                          disabled={isActivatingNotif}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sama-orange hover:bg-orange-600 text-white text-[10px] font-black shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isActivatingNotif ? "Activation..." : "Activer sur mon téléphone"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Leads List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {pendingLeads.length > 0 ? (
                  pendingLeads.slice(0, 5).map((lead) => {
                    const initials = lead.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    const dateFormatted = lead.created_at
                      ? new Date(lead.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Récemment";

                    return (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (onInspectLead) {
                            onInspectLead(lead);
                          }
                        }}
                        className="p-3 hover:bg-orange-50/40 transition-colors cursor-pointer flex items-start gap-2.5 group"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-sama-orange/30 group-hover:bg-sama-orange transition-colors">
                          {initials || "DP"}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-sama-orange transition-colors">
                              {lead.full_name}
                            </h4>
                            <span className="text-[9px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-sama-orange" />
                              {dateFormatted}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 truncate font-medium">
                            {lead.company_name ? `${lead.company_name} • ` : ""}
                            {lead.service_requested}
                          </p>

                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-sama-orange bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                              {lead.budget_range}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-sama-orange flex items-center gap-0.5">
                              <span>Consulter</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      Toutes les demandes sont traitées
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aucun devis en attente. Votre boîte de réception est à jour !
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {pendingLeads.length > 0 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      if (onViewAllPending) {
                        onViewAllPending();
                      }
                    }}
                    className="w-full py-1.5 text-xs font-bold text-sama-orange hover:text-orange-700 hover:bg-orange-50/50 rounded-lg transition-colors cursor-pointer"
                  >
                    Voir toutes les demandes à traiter ({unreadCount}) →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
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
