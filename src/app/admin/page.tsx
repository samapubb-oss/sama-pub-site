"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { LeadsTable, LeadQuote } from "@/components/admin/LeadsTable";
import { LeadDetailCard } from "@/components/admin/LeadDetailCard";
import { LeadInspectionModal } from "@/components/admin/LeadInspectionModal";
import { AdminLockScreen } from "@/components/admin/AdminLockScreen";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, CheckCircle2, User } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  registerServiceWorker,
  sendLeadPushNotification,
} from "@/lib/notificationService";

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentTab, setCurrentTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Leads Data State: 100% real Supabase data
  const [leads, setLeads] = useState<LeadQuote[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectingLead, setInspectingLead] = useState<LeadQuote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("sama_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch leads exclusively from Supabase
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLeads(data);
        if (data.length > 0 && !selectedLeadId) {
          setSelectedLeadId(data[0].id);
        }
      } else {
        setLeads([]);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des devis :", e);
      setLeads([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchLeads();

    // 1. Initialise le Service Worker pour les notifications PWA et smartphones
    registerServiceWorker();

    // 2. Écoute temps réel Supabase sur la table leads_quotes
    const channel = supabase
      .channel("realtime-leads-quotes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads_quotes" },
        (payload) => {
          const newLead = payload.new as LeadQuote;
          setLeads((prev) => {
            if (prev.some((l) => l.id === newLead.id)) return prev;
            return [newLead, ...prev];
          });
          // Déclenche l'alerte sonore et la notification push sur smartphone / ordinateur
          sendLeadPushNotification(newLead);
        }
      )
      .subscribe();

    // 3. Polling périodique (toutes les 25 secondes) en sécurité pour les mobiles en arrière-plan
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("leads_quotes")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setLeads((prev) => {
            const freshLeads = data.filter((d) => !prev.some((p) => p.id === d.id));
            if (freshLeads.length > 0 && prev.length > 0) {
              sendLeadPushNotification(freshLeads[0]);
            }
            return data;
          });
        }
      } catch (err) {
        console.debug("Polling lead notice:", err);
      }
    }, 25000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Update status handler
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
            : lead
        )
      );

      // Keep inspecting lead in sync if modal is open
      setInspectingLead((prev) =>
        prev && prev.id === leadId
          ? { ...prev, status: newStatus, updated_at: new Date().toISOString() }
          : prev
      );

      // Normalize status for Supabase database check constraint
      const dbStatus =
        newStatus === "a_traiter" || newStatus === "nouveau" ? "contacted" :
        newStatus === "en_cours" ? "won" :
        newStatus === "devis_envoye" ? "quote_sent" :
        newStatus;

      await supabase
        .from("leads_quotes")
        .update({ status: dbStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId);
    } catch (e) {
      console.error("Failed to update status in Supabase:", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered Leads: classés rigoureusement par date et heure décroissante (plus récents en premier)
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesSearch =
          lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.company_name &&
            lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lead.email &&
            lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          lead.service_requested.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "a_traiter" ||
              statusFilter === "nouveau" ||
              statusFilter === "contacted" ||
              statusFilter === "new"
            ? lead.status === "contacted" ||
              lead.status === "a_traiter" ||
              lead.status === "new" ||
              lead.status === "nouveau"
            : statusFilter === "en_cours" || statusFilter === "won"
            ? lead.status === "won" || lead.status === "en_cours"
            : statusFilter === "devis_envoye" || statusFilter === "quote_sent"
            ? lead.status === "quote_sent" || lead.status === "devis_envoye"
            : lead.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA; // Plus récent en tête de liste
      });
  }, [leads, searchTerm, statusFilter]);

  // Selected lead object
  const selectedLead = useMemo(() => {
    if (leads.length === 0) return null;
    return leads.find((l) => l.id === selectedLeadId) || leads[0] || null;
  }, [leads, selectedLeadId]);

  // Stats dynamically calculated from REAL Supabase leads
  const stats = useMemo(() => {
    const total = leads.length;
    const pending = leads.filter(
      (l) => l.status === "new" || l.status === "nouveau" || l.status === "contacted" || l.status === "a_traiter"
    ).length;
    const inProgress = leads.filter((l) => l.status === "won" || l.status === "en_cours").length;
    const sent = leads.filter((l) => l.status === "quote_sent" || l.status === "devis_envoye").length;

    return {
      total,
      pending,
      inProgress,
      sent,
    };
  }, [leads]);

  // Demandes en attente pour la modale et la cloche de notification
  const pendingLeads = useMemo(() => {
    return leads.filter(
      (l) => l.status === "new" || l.status === "nouveau" || l.status === "contacted" || l.status === "a_traiter"
    );
  }, [leads]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nom complet",
      "Entreprise",
      "WhatsApp",
      "E-mail",
      "Service demandé",
      "Budget",
      "Statut",
      "Date de création",
      "Message",
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.full_name.replace(/"/g, '""')}"`,
      `"${(l.company_name || "").replace(/"/g, '""')}"`,
      `"${(l.whatsapp_number || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${l.service_requested.replace(/"/g, '""')}"`,
      `"${l.budget_range.replace(/"/g, '""')}"`,
      l.status,
      l.created_at
        ? `"${new Date(l.created_at).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}"`
        : '""',
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sama-pub-devis-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("sama_admin_auth");
    } catch {}
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B192C] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sama-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          unreadCount={stats.pending}
          pendingLeads={pendingLeads}
          onInspectLead={(lead) => {
            setInspectingLead(lead);
            setSelectedLeadId(lead.id);
            setIsInspectModalOpen(true);
          }}
          onViewAllPending={() => {
            setStatusFilter("a_traiter");
            setSearchTerm("");
          }}
          onLogout={handleLogout}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dashboard Body */}
        <main className="p-3 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-6">
          {/* TAB 1: VUE D'ENSEMBLE OU DEMANDES DE DEVIS */}
          {(currentTab === "overview" || currentTab === "quotes") && (
            <>
              {/* 1. 4 KPI Stat Cards */}
              <AdminStatsGrid
                totalLeads={stats.total}
                pendingCount={stats.pending}
                inProgressCount={stats.inProgress}
                sentCount={stats.sent}
                activeFilter={statusFilter}
                onFilterChange={(newFilter) => {
                  setStatusFilter(newFilter);
                  setSearchTerm("");
                }}
              />

              {/* 2. Full-Width Leads Table */}
              <LeadsTable
                leads={filteredLeads}
                selectedLeadId={selectedLeadId}
                onSelectLead={(lead) => setSelectedLeadId(lead.id)}
                onInspectLead={(lead) => {
                  setInspectingLead(lead);
                  setSelectedLeadId(lead.id);
                  setIsInspectModalOpen(true);
                }}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onExportCSV={handleExportCSV}
              />

              {/* 3. Full-Width Selected Lead Detail Card (displayed when leads exist) */}
              {selectedLead && (
                <LeadDetailCard
                  lead={selectedLead}
                  onStatusChange={handleStatusChange}
                  isUpdatingStatus={isUpdatingStatus}
                  onGenerateDevis={(lead) => {
                    setInspectingLead(lead);
                    setSelectedLeadId(lead.id);
                    setIsInspectModalOpen(true);
                  }}
                />
              )}
            </>
          )}

          {/* TAB 3: CLIENTS */}
          {currentTab === "clients" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Répertoire Clients & Marques
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Contacts professionnels enregistrés à Dakar ({leads.length} client{leads.length > 1 ? "s" : ""})
                </p>
              </div>

              {leads.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-100 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Aucun client enregistré pour le moment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Dès qu&apos;un visiteur remplit le formulaire de devis sur le site, sa fiche client apparaîtra automatiquement ici en direct.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads.map((client) => {
                    const phoneClean = (client.whatsapp_number || "").replace(/\D/g, "");
                    return (
                      <div
                        key={client.id}
                        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-sama-orange bg-[#FFF7ED] px-2.5 py-1 rounded-full">
                              {client.company_name || "Particulier"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(client.created_at || "").toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900">
                            {client.full_name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {client.service_requested}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                            {client.whatsapp_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{client.whatsapp_number}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 flex items-center gap-2">
                          {phoneClean && (
                            <a
                              href={`https://wa.me/${phoneClean}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs font-bold transition-colors"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadId(client.id);
                              setInspectingLead(client);
                              setIsInspectModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Voir dossier
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SERVICES OFFICIELS SAMA PUB (4 expertises exactes) */}
          {currentTab === "services" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Services SAMA PUB & Demandes Associées
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Les 4 expertises officielles de l&apos;agence proposées à nos clients
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: "Media Buying (Campagnes Pubs)",
                    channels: "Meta Ads (Facebook & Instagram), TikTok Ads, Google Ads",
                    desc: "Campagnes sponsorisées ciblées et optimisation continue du ROAS pour maximiser vos ventes au Sénégal et en Afrique de l'Ouest.",
                  },
                  {
                    title: "Publicité Multi-canaux",
                    channels: "Facebook, Instagram, TikTok, YouTube",
                    desc: "Déploiement synchronisé sur tous les canaux majeurs pour dominer votre marché et capter votre audience là où elle passe son temps.",
                  },
                  {
                    title: "Acquisition de Prospects",
                    channels: "Tunnels de vente, Formulaires instantanés, Funnels WhatsApp",
                    desc: "Génération de flux continu de leads qualifiés pour alimenter directement votre équipe commerciale en opportunités réelles.",
                  },
                  {
                    title: "Marketing Digital Global",
                    channels: "Stratégie 360°, Tracking Pixel, Croissance Digitale",
                    desc: "Pilotage complet et accompagnement stratégique sur-mesure pour transformer vos dépenses en investissements rentables.",
                  },
                ].map((srv, idx) => {
                  const srvKeywords: Record<string, string[]> = {
                    "Media Buying (Campagnes Pubs)": ["media-buying", "media buying"],
                    "Publicité Multi-canaux": ["publicite-digitale", "publicité", "publicite"],
                    "Acquisition de Prospects": ["acquisition-clients", "acquisition"],
                    "Marketing Digital Global": ["marketing-digital", "marketing digital"],
                  };
                  const keywords = srvKeywords[srv.title] || [srv.title.toLowerCase().slice(0, 10)];
                  const reqCount = leads.filter((l) =>
                    keywords.some((k) => (l.service_requested || "").toLowerCase().includes(k))
                  ).length;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-sama-orange flex items-center justify-center font-black text-sm mb-3">
                          0{idx + 1}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {srv.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-sama-orange mt-1">
                          {srv.channels}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {srv.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Demandes reçues :</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {reqCount} demande(s)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PARAMÈTRES */}
          {currentTab === "settings" && (
            <div className="max-w-2xl bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Paramètres de l&apos;Agence
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Coordonnées officielles et statut de synchronisation SAMA PUB
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Base de données & API
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Statut Supabase :</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connecté (PostgreSQL 17)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Table active :</span>
                    <span className="font-mono text-slate-800">public.leads_quotes</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Coordonnées Officielles Dakar
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Téléphone / WhatsApp :</span>
                    <span className="font-bold text-slate-900">+221 76 142 28 58</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">E-mail agence :</span>
                    <span className="font-bold text-slate-900">samapubb@gmail.com</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Session Administrateur</div>
                    <div className="text-[11px] text-slate-400">
                      Verrouillez la session pour empêcher l&apos;accès public
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Verrouiller l&apos;accès
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Detailed Client Inspection Modal (Opens on Eye icon click) */}
        <LeadInspectionModal
          lead={inspectingLead || selectedLead}
          isOpen={isInspectModalOpen}
          onClose={() => setIsInspectModalOpen(false)}
          onStatusChange={handleStatusChange}
          isUpdatingStatus={isUpdatingStatus}
        />
      </div>
    </div>
  );
}
