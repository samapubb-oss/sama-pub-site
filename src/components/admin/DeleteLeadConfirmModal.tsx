"use client";

import React, { useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Building2,
  Globe,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import type { LeadQuote } from "./LeadsTable";
import { isWebsiteLead, parseWebsiteOrderDetails } from "@/lib/website-lead-parser";

interface DeleteLeadConfirmModalProps {
  lead: LeadQuote | null;
  isOpen: boolean;
  isDeleting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteLeadConfirmModal: React.FC<DeleteLeadConfirmModalProps> = ({
  lead,
  isOpen,
  isDeleting = false,
  error = null,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !lead) return null;

  const isWeb = isWebsiteLead(lead);
  const parsedWeb = isWeb ? parseWebsiteOrderDetails(lead) : null;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => {
          if (!isDeleting) onCancel();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-lead-title"
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top bar */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 ring-4 ring-rose-50/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="delete-lead-title"
                className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug"
              >
                Supprimer ce devis ?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirmation de suppression définitive
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="px-5 sm:px-6 space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-sm truncate">
                {lead.full_name}
              </span>
              {isWeb ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                  <Globe className="w-3 h-3 text-sky-600" />
                  <span>Devis Site Web</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                  <Megaphone className="w-3 h-3 text-sama-orange" />
                  <span>Devis Campagne</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">
                {lead.company_name || "Particulier"}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 truncate">
                {isWeb && parsedWeb
                  ? parsedWeb.formulaName
                  : lead.service_requested}
              </span>
              <span className="font-bold text-slate-900 shrink-0">
                {isWeb && parsedWeb
                  ? parsedWeb.formattedPrice
                  : lead.budget_range}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Cette demande de devis (ainsi que sa fiche client et tout PDF associé) sera{" "}
            <strong className="text-rose-600 font-bold">
              définitivement supprimée
            </strong>{" "}
            du tableau de bord SAMA PUB.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 sm:p-6 pt-4 mt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Supprimer définitivement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

