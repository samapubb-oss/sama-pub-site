"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import { CustomSelect } from "./CustomSelect";
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { SenegalFlag } from "./SenegalFlag";
import { supabase } from "@/lib/supabase";

interface ContactCTAProps {
  isStandalonePage?: boolean;
}

export const ContactCTA: React.FC<ContactCTAProps> = ({ isStandalonePage = false }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    whatsappNumber: "",
    email: "",
    serviceRequested: "media-buying",
    budgetRange: "100k-250k",
    message: "",
    honeypot: "", // anti-spam field
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper formatting Senegal phone number as XX XXX XX XX
  const formatSenegalPhone = (raw: string): string => {
    let digits = raw.replace(/\D/g, "");
    // Strip international prefix if user pasted it
    if (digits.startsWith("00221")) {
      digits = digits.slice(5);
    } else if (digits.startsWith("221") && digits.length > 9) {
      digits = digits.slice(3);
    }
    // Limit to strictly 9 digits
    digits = digits.slice(0, 9);

    // Format as XX XXX XX XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSenegalPhone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      whatsappNumber: formatted,
    }));
    if (fieldErrors.whatsappNumber) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.whatsappNumber;
        return next;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Honeypot spam trap
    if (formData.honeypot) {
      console.warn("Spam bot detected via honeypot trap.");
      return;
    }

    const errors: Record<string, string> = {};

    // 1. Nom complet (obligatoire)
    const cleanFullName = formData.fullName.trim();
    if (!cleanFullName) {
      errors.fullName = "Le nom complet est obligatoire.";
    } else if (cleanFullName.length < 2) {
      errors.fullName = "Veuillez saisir un nom valide (au moins 2 caractères).";
    }

    // 2. Nom de l'entreprise (obligatoire)
    const cleanCompany = formData.companyName.trim();
    if (!cleanCompany) {
      errors.companyName = "Le nom de l'entreprise ou marque est obligatoire.";
    } else if (cleanCompany.length < 2) {
      errors.companyName = "Veuillez renseigner le nom de votre entreprise ou marque.";
    }

    // 3. Numéro WhatsApp sénégalais (exactement 9 chiffres)
    const phoneDigits = formData.whatsappNumber.replace(/\D/g, "");
    if (!phoneDigits) {
      errors.whatsappNumber = "Le numéro WhatsApp est obligatoire.";
    } else if (phoneDigits.length !== 9) {
      errors.whatsappNumber = `Un numéro sénégalais compte exactement 9 chiffres (${phoneDigits.length}/9 actuellement).`;
    } else if (!/^[37]/.test(phoneDigits)) {
      errors.whatsappNumber = "Le numéro doit débuter par 7 (mobile : 70, 75, 76, 77, 78) ou 33 (fixe).";
    }

    // 4. Adresse e-mail (vérification de la forme)
    const cleanEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!cleanEmail) {
      errors.email = "L'adresse e-mail est obligatoire.";
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = "Format d'adresse e-mail invalide (ex : contact@entreprise.sn ou nom@gmail.com).";
    }

    // 5. Service recherché
    if (!formData.serviceRequested) {
      errors.serviceRequested = "Veuillez choisir un service.";
    }

    // 6. Tranche budgétaire
    if (!formData.budgetRange) {
      errors.budgetRange = "Veuillez sélectionner une tranche budgétaire.";
    }

    // 7. Description / Message (obligatoire)
    const cleanMessage = formData.message.trim();
    if (!cleanMessage) {
      errors.message = "La description de votre besoin ou projet est obligatoire.";
    } else if (cleanMessage.length < 10) {
      errors.message = "Veuillez détailler un peu plus votre besoin (au moins 10 caractères).";
    }

    // Validation check
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Veuillez renseigner correctement toutes les cases obligatoires signalées en rouge.");
      setFormStatus("error");
      return;
    }

    setFieldErrors({});
    setFormStatus("submitting");

    // Format final au standard international pour la base de données et WhatsApp
    const formattedFullWhatsApp = `+221 ${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 5)} ${phoneDigits.slice(5, 7)} ${phoneDigits.slice(7, 9)}`;

    try {
      const { error } = await supabase.from("leads_quotes").insert({
        full_name: cleanFullName,
        company_name: cleanCompany,
        contact_channel: "whatsapp",
        contact_value: `${formattedFullWhatsApp} | ${cleanEmail}`,
        whatsapp_number: formattedFullWhatsApp,
        email: cleanEmail,
        service_requested: formData.serviceRequested,
        budget_range: formData.budgetRange,
        message: cleanMessage,
        status: "new",
      });

      if (error) {
        console.error("Erreur insertion devis Supabase:", error);
        setErrorMessage("Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer ou nous contacter directement sur WhatsApp.");
        setFormStatus("error");
        return;
      }

      setFormStatus("success");
    } catch (err) {
      console.error("Exception insertion devis:", err);
      setErrorMessage("Erreur de connexion. Veuillez vérifier votre réseau.");
      setFormStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className={`${
        isStandalonePage
          ? "pt-20 sm:pt-24 lg:pt-8 pb-16 md:pb-24"
          : "py-20 md:py-28"
      } bg-slate-50 relative overflow-hidden`}
    >
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sama-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* If standalone page: ultra-compact mobile header so form inputs are IMMEDIATELY visible without scrolling */}
        {isStandalonePage ? (
          <div className="lg:hidden mb-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 mb-1">
              <span className="w-4 h-0.5 bg-sama-orange rounded-full" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-sama-orange">
                Devis Gratuit en 1 min
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vos informations pour votre devis{" "}
              <span className="text-sama-orange">sur-mesure</span>
            </h1>
          </div>
        ) : (
          /* Standard Section Header for Home Page */
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
                Discutons de votre projet
              </span>
              <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-normal md:leading-[1.25] mb-4">
              Demandez votre devis gratuit{" "}
              <span className="text-sama-orange whitespace-nowrap">ou un premier échange</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Remplissez ce formulaire en 1 minute. Notre équipe analyse votre demande et vous répond sous 24h ouvrées avec une proposition concrète.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Direct Contact & Official Information (Section bleue : 2ème sur mobile, 1ère sur desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between space-y-4 sm:space-y-8">
            <div className="bg-sama-navy text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden border border-white/10 sm:border-transparent">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sama-orange/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-2.5 sm:mb-3">
                Parlons directement de votre croissance
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 sm:mb-8 font-normal">
                Vous préférez un échange immédiat sans attendre ? Notre canal WhatsApp officiel est ouvert pour vous orienter rapidement.
              </p>

              {/* Direct WhatsApp Callout with REAL WhatsApp SVG logo */}
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Bonjour%20SAMA%20PUB,%20je%20souhaite%20un%20devis%20pour%20mon%20entreprise`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 sm:gap-3 py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6d] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(37,211,102,0.35)] transition-all sm:hover:scale-[1.02] mb-5 sm:mb-8 group"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">Ouvrir WhatsApp Business (+221 76 142 28 58)</span>
              </a>

              {/* Contact list with responsive tap targets and clean typography */}
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-white/10 text-sm">
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 sm:gap-3.5 group/item hover:bg-white/5 p-1.5 -mx-1.5 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(255,107,0,0.25)] shrink-0 group-hover/item:scale-105 transition-transform">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sama-orange" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Téléphone officiel</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-100">
                      <span>{siteConfig.contact.phone}</span>
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 sm:gap-3.5 group/item hover:bg-white/5 p-1.5 -mx-1.5 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)] shrink-0 group-hover/item:scale-105 transition-transform">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">E-mail commercial</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-100">
                      <span className="truncate">{siteConfig.contact.email}</span>
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3 sm:gap-3.5 p-1.5 -mx-1.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Localisation</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{siteConfig.contact.address}</span>
                      <SenegalFlag className="w-4 h-3 inline-block" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-3.5 p-1.5 -mx-1.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Horaires d'ouverture</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {siteConfig.contact.openingHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reassurance Box */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 sm:mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sama-orange shrink-0" />
                <span>Pourquoi faire confiance à SAMA PUB ?</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                Aucun engagement forcé. Nous auditons vos leviers d'acquisition avec objectivité et ne proposons que les canaux qui génèrent un retour sur investissement rentable pour votre budget.
              </p>
            </div>
          </div>

          {/* Formulaire de Devis (1er sur mobile, 2ème sur desktop) */}
          <div
            id="devis"
            className="order-1 lg:order-2 lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl scroll-mt-24"
          >
            {formStatus === "success" ? (
              <div className="py-12 text-center animate-in fade-in-50 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Demande de devis bien reçue !
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                  Merci <strong>{formData.fullName}</strong>. Notre équipe étudie votre demande pour l'entreprise <strong>{formData.companyName}</strong> et vous recontactera sous 24h ouvrées.
                </p>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 max-w-md mx-auto mb-8 font-medium">
                  Votre demande a été enregistrée avec succès. Notre équipe vous contactera directement sur WhatsApp ou par e-mail sous 24h.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormStatus("idle");
                    setFieldErrors({});
                    setFormData({
                      fullName: "",
                      companyName: "",
                      whatsappNumber: "",
                      email: "",
                      serviceRequested: "media-buying",
                      budgetRange: "100k-250k",
                      message: "",
                      honeypot: "",
                    });
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
                
                {/* Honeypot hidden input against spam bots */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Bannière d'erreur globale */}
                {formStatus === "error" && errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                      <div className="leading-snug">
                        <p className="font-bold">{errorMessage}</p>
                      </div>
                    </div>
                    {formData.fullName && (
                      <a
                        href={`https://wa.me/221761422858?text=${encodeURIComponent(
                          `Bonjour SAMA PUB, je souhaite un devis :\n• Nom : ${formData.fullName}\n• Entreprise : ${formData.companyName || "Non spécifié"}\n• Service : ${formData.serviceRequested}\n• Budget : ${formData.budgetRange}\n• WhatsApp : +221 ${formData.whatsappNumber}\n• E-mail : ${formData.email}\n• Besoin : ${formData.message}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                        <span>Transmettre ma demande directement sur WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}

                {/* 1. Nom complet & Nom de l'entreprise (TOUS LES DEUX OBLIGATOIRES *) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Nom complet <span className="text-sama-orange">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Ex : Moussa Diop"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                        fieldErrors.fullName
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Nom de l'entreprise / Marque <span className="text-sama-orange">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      placeholder="Ex : Diop & Co"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                        fieldErrors.companyName
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                      }`}
                    />
                    {fieldErrors.companyName && (
                      <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.companyName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Numéro WhatsApp (Sénégal avec drapeau + indicatif +221 fixe) & Adresse E-mail (OBLIGATOIRES *) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Numéro WhatsApp (9 chiffres) <span className="text-sama-orange">*</span>
                    </label>
                    <div className="relative">
                      {/* Badge Drapeau Sénégal + indicatif fixe */}
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-bold select-none pointer-events-none z-10 shadow-2xs">
                        <SenegalFlag className="w-5 h-3.5" />
                        <span className="font-mono tracking-tight text-slate-900 font-bold">+221</span>
                      </div>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        required
                        inputMode="numeric"
                        placeholder="77 123 45 67"
                        value={formData.whatsappNumber}
                        onChange={handlePhoneChange}
                        maxLength={12} // 9 digits + 3 spaces
                        className={`w-full pl-[98px] pr-4 py-3 rounded-xl border text-sm transition-all font-mono tracking-wide ${
                          fieldErrors.whatsappNumber
                            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                            : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                        }`}
                      />
                    </div>
                    {fieldErrors.whatsappNumber ? (
                      <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.whatsappNumber}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Tapez directement les 9 chiffres de votre numéro sénégalais
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Adresse e-mail <span className="text-sama-orange">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="Ex : moussa.diop@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                        fieldErrors.email
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                      }`}
                    />
                    {fieldErrors.email ? (
                      <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Exemple : contact@entreprise.sn ou nom@gmail.com
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Service recherché & Budget mensuel (OBLIGATOIRES *) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <CustomSelect
                      label="Service recherché *"
                      name="serviceRequested"
                      value={formData.serviceRequested}
                      onChange={handleChange}
                      options={[
                        { value: "media-buying", label: "Media Buying (Campagnes Pubs)" },
                        { value: "publicite-digitale", label: "Publicité Multi-canaux" },
                        { value: "creation-contenus", label: "Création Vidéos & Visuels" },
                        { value: "acquisition-clients", label: "Acquisition de Prospects" },
                        { value: "marketing-digital", label: "Marketing Digital Global" },
                        { value: "conseil-strategie", label: "Conseil & Stratégie / Audit" },
                      ]}
                    />
                    {fieldErrors.serviceRequested && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.serviceRequested}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <CustomSelect
                      label="Budget mensuel indicatif (FCFA) *"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      options={[
                        { value: "100k-250k", label: "100 000 - 250 000 FCFA (Min)" },
                        { value: "250k-500k", label: "250 000 - 500 000 FCFA" },
                        { value: "500k-750k", label: "500 000 - 750 000 FCFA" },
                        { value: "750k-1M", label: "750 000 - 1 000 000 FCFA (Max)" },
                        { value: "plus-1M", label: "Plus de 1 000 000 FCFA" },
                      ]}
                    />
                    {fieldErrors.budgetRange && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.budgetRange}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Description du besoin ou projet (OBLIGATOIRE *) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Description de votre besoin ou projet <span className="text-sama-orange">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Précisez votre activité, vos objectifs de vente, les produits ou services à promouvoir, etc. (obligatoire)"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                      fieldErrors.message
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.message}</span>
                    </p>
                  )}
                </div>

                {/* Bouton de soumission */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-sama-orange hover:bg-sama-orange-hover text-white font-bold text-base shadow-lg hover:shadow-glow-orange transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
                  >
                    {formStatus === "submitting" ? (
                      <span>Envoi en cours...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer ma demande de devis gratuit</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-3">
                    Toutes les informations restent strictement confidentielles et nous permettent d'étudier votre demande avec précision.
                  </p>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
