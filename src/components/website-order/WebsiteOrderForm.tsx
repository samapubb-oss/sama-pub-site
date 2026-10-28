"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Building2,
  Layout,
  Briefcase,
  User,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  MessageCircle,
  BookOpen,
  FileText,
  Languages,
  ShieldCheck,
  Check,
  AlertCircle,
  Send,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { SenegalFlag } from "@/components/SenegalFlag";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  websiteFormulas,
  websiteTypes,
  projectDeadlines,
  WebsiteFormula,
} from "@/data/websitePricingConfig";

export const WebsiteOrderForm: React.FC = () => {
  const formTopRef = useRef<HTMLDivElement>(null);

  // 4 Étapes Claires : 1 (Type), 2 (Formule), 3 (Délai de réalisation), 4 (Coordonnées finales)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selection states
  const [selectedType, setSelectedType] = useState<string>("vitrine");
  const [otherTypeDetail, setOtherTypeDetail] = useState<string>("");

  const [selectedFormulaId, setSelectedFormulaId] = useState<string>("vitrine");

  const [clientInfo, setClientInfo] = useState({
    fullName: "",
    companyName: "",
    whatsappNumber: "",
    email: "",
    deadline: "standard",
    projectDescription: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Smooth scroll to form top helper
  const scrollToFormTop = () => {
    if (formTopRef.current) {
      const headerOffset = 80;
      const elementPosition = formTopRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // Helper formatting Senegal phone number as XX XXX XX XX
  const formatSenegalPhone = (raw: string): string => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("00221")) {
      digits = digits.slice(5);
    } else if (digits.startsWith("221") && digits.length > 9) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSenegalPhone(e.target.value);
    setClientInfo((prev) => ({ ...prev, whatsappNumber: formatted }));
    if (errors.whatsappNumber) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.whatsappNumber;
        return next;
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // AUTO-ADVANCE Step 1: Click on card selects it and immediately transitions to Step 2!
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setErrors({});

    if (typeId === "autre") {
      return;
    }

    setTimeout(() => {
      setCurrentStep(2);
      scrollToFormTop();
    }, 220);
  };

  // AUTO-ADVANCE Step 2: Click on formula selects it and immediately transitions to Step 3 (Délai)!
  const handleSelectFormula = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
    setErrors({});
    setTimeout(() => {
      setCurrentStep(3);
      scrollToFormTop();
    }, 220);
  };

  // AUTO-ADVANCE Step 3: Click on delivery deadline selects it and auto-advances to final Step 4 (Coordonnées)!
  const handleSelectDeadline = (deadlineId: string) => {
    setClientInfo((prev) => ({ ...prev, deadline: deadlineId }));
    setErrors({});
    setTimeout(() => {
      setCurrentStep(4);
      scrollToFormTop();
    }, 220);
  };

  // Manual step jump from stepper
  const goToStep = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      scrollToFormTop();
    } else if (stepNumber === currentStep + 1) {
      if (currentStep === 1 && selectedType === "autre" && !otherTypeDetail.trim()) {
        setErrors({ otherTypeDetail: "Veuillez préciser votre type de projet." });
        return;
      }
      setCurrentStep(stepNumber);
      scrollToFormTop();
    }
  };

  // Validation before step 4 (final contact registration form)
  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clientInfo.fullName.trim() || clientInfo.fullName.trim().length < 2) {
      newErrors.fullName = "Veuillez renseigner votre nom complet.";
    }

    if (!clientInfo.companyName.trim() || clientInfo.companyName.trim().length < 2) {
      newErrors.companyName = "Veuillez renseigner le nom de votre entreprise ou marque.";
    }

    const phoneDigits = clientInfo.whatsappNumber.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.whatsappNumber = "Le numéro WhatsApp est obligatoire.";
    } else if (phoneDigits.length !== 9) {
      newErrors.whatsappNumber = `Un numéro sénégalais compte exactement 9 chiffres (${phoneDigits.length}/9 actuellement).`;
    } else if (!/^[37]/.test(phoneDigits)) {
      newErrors.whatsappNumber = "Le numéro doit débuter par 7 (mobile) ou 33 (fixe).";
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!clientInfo.email.trim()) {
      newErrors.email = "L'adresse e-mail est obligatoire.";
    } else if (!emailRegex.test(clientInfo.email.trim())) {
      newErrors.email = "Format d'adresse e-mail invalide (ex : contact@entreprise.sn).";
    }

    if (!clientInfo.projectDescription.trim() || clientInfo.projectDescription.trim().length < 10) {
      newErrors.projectDescription = "Veuillez préciser un peu vos attentes (au moins 10 caractères).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedType === "autre" && !otherTypeDetail.trim()) {
      setErrors({ otherTypeDetail: "Veuillez préciser votre type de projet web." });
      return;
    }
    setErrors({});
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      scrollToFormTop();
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      scrollToFormTop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/devis-site-web", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: clientInfo.fullName,
          companyName: clientInfo.companyName,
          whatsappNumber: clientInfo.whatsappNumber,
          email: clientInfo.email,
          deadline: clientInfo.deadline,
          projectDescription: clientInfo.projectDescription,
          selectedType,
          otherTypeDetail,
          selectedFormulaId,
          selectedFeatures: [],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success || !data.ref) {
        throw new Error(
          data.error || "Une erreur est survenue lors de l'enregistrement de votre devis."
        );
      }

      // Redirection COMPLÈTE de la page vers /merci-devis-site-web?ref=NUMERO_DU_DEVIS
      // Rechargement complet de la page (pas router.push) pour chargement propre du Pixel Meta
      window.location.assign(`/merci-devis-site-web?ref=${encodeURIComponent(data.ref)}`);
    } catch (err: any) {
      console.error("Erreur soumission devis web:", err);
      setSubmitError(
        err.message ||
          "Une erreur est survenue. Veuillez vérifier votre connexion et réessayer."
      );
      setIsSubmitting(false);
      scrollToFormTop();
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSubmitting(false);
    setSubmitError(null);
    setSelectedType("vitrine");
    setSelectedFormulaId("vitrine");
    setOtherTypeDetail("");
    setClientInfo({
      fullName: "",
      companyName: "",
      whatsappNumber: "",
      email: "",
      deadline: "standard",
      projectDescription: "",
    });
    setErrors({});
  };

  // Selected helpers
  const selectedFormula =
    websiteFormulas.find((f) => f.id === selectedFormulaId) || websiteFormulas[1];
  const selectedTypeObj = websiteTypes.find((t) => t.id === selectedType);
  const selectedDeadlineObj = projectDeadlines.find((d) => d.id === clientInfo.deadline);

  // Universal Render Icon helper with proper thematic colors (NEVER white)
  const renderIcon = (iconName: string, className = "w-5 h-5 sm:w-6 sm:h-6") => {
    switch (iconName) {
      case "ShoppingBag":
        return <ShoppingBag className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      case "User":
        return <User className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "TrendingUp":
        return <TrendingUp className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "CreditCard":
        return <CreditCard className={className} />;
      case "WhatsApp":
      case "WhatsAppIcon":
      case "MessageCircle":
        return <WhatsAppIcon className={className} fullColor={true} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "FileText":
        return <FileText className={className} />;
      case "Languages":
        return <Languages className={className} />;
      case "Clock":
        return <Clock className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "Award":
        return <Award className={className} />;
      default:
        return <Layout className={className} />;
    }
  };

  return (
    <div ref={formTopRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* =========================================================================
            COLONNE GAUCHE: CARTE CONSEIL SAMA PUB & RÉCAPITULATIF LIVE INTERACTIF
            Sur mobile : order-2 (placé sous le formulaire pour zéro friction de saisie)
            Sur desktop : order-1 (col-span-4 sticky top-24)
            ========================================================================= */}
        <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col space-y-4 sm:space-y-5">
          
          {/* Executive Agency Assistance Card */}
          <div className="bg-gradient-to-b from-[#061427] via-[#091D3A] to-[#0A2242] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-sama-orange/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              
              {/* Agency Live Status Pill */}
              <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white shrink-0 shadow-sm border border-slate-200">
                    <Image
                      src="/images/logo-sp.png"
                      alt="SAMA PUB"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs tracking-tight block">SAMA PUB Web</span>
                    <span className="text-[9px] text-slate-300 block font-medium">Dakar, Sénégal</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En ligne</span>
                </div>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-white mb-1.5 leading-snug">
                Besoin d'un cadrage technique immédiat ?
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 mb-3.5 leading-relaxed font-normal">
                Nos experts web à Dakar vous conseillent directement sur votre architecture et le choix de vos passerelles de paiement Wave & OM.
              </p>

              {/* Fast WhatsApp Direct Link */}
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  "Bonjour SAMA PUB, je souhaite des conseils pour concevoir mon site internet."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all transform hover:scale-[1.02] cursor-pointer mb-3"
              >
                <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                <span>Discuter sur WhatsApp (+221)</span>
              </a>

              {/* Direct Contacts List */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-slate-400 block font-medium">Ligne directe Dakar</span>
                    <span className="font-semibold text-slate-100 text-[11px] sm:text-xs truncate block font-mono">{siteConfig.contact.phone}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-slate-400 block font-medium">E-mail commercial</span>
                    <span className="font-semibold text-slate-100 text-[11px] sm:text-xs truncate block">{siteConfig.contact.email}</span>
                  </div>
                </a>

                <div className="flex items-center gap-2.5 p-1.5 -mx-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-slate-400 block font-medium">Agence locale</span>
                    <span className="font-semibold text-slate-100 text-[11px] sm:text-xs flex items-center gap-1.5">
                      <span>Dakar, Sénégal</span>
                      <SenegalFlag className="w-3.5 h-2.5 inline-block" />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Dynamic Real-time Live Selection Recap Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sama-orange"></span>
                </span>
                <span>Devis en direct</span>
              </span>
              <span className="text-[10px] text-sama-orange font-bold font-mono bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                Étape {currentStep} / 4
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                <span className="text-slate-500 text-[11px]">Type de site :</span>
                <span className="font-bold text-slate-900 text-[11px] truncate max-w-[150px] text-right">
                  {selectedType === "autre" ? (otherTypeDetail || "Autre (spécifique)") : selectedTypeObj?.title}
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                <span className="text-slate-500 text-[11px]">Formule :</span>
                <span className="font-bold text-sama-orange text-[11px]">
                  {selectedFormula.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                <span className="text-slate-500 text-[11px]">Budget indicatif :</span>
                <span className="font-black text-slate-900 font-mono text-xs sm:text-sm text-sama-orange whitespace-nowrap">
                  {selectedFormula.formattedPrice}
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                <span className="text-slate-500 text-[11px]">Délai choisi :</span>
                <span className="font-bold text-slate-800 text-[11px]">
                  {selectedDeadlineObj?.label}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 space-y-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Hébergement & Nom de domaine inclus 1 an</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sama-orange shrink-0" />
                <span>Livraison clé en main avec accompagnement</span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            COLONNE DROITE: FORMULAIRE INTERACTIF EN 5 ÉTAPES INTUITIVES
            Sur mobile : order-1 (s'affiche immédiatement en haut de page)
            Sur desktop : order-2 (col-span-8)
            ========================================================================= */}
        <div id="order-form-container" className="order-1 lg:order-2 lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-slate-200/90 shadow-lg sm:shadow-xl">
          
          {/* Bannière d'erreur en cas d'échec de transmission */}
          {submitError && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Impossible d'enregistrer votre devis</p>
                <p className="mt-0.5 text-xs text-rose-700">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
              
              {/* =========================================================================
                  STEPPER PROGRESS BAR INTERACTIF EN 4 ÉTAPES
                  100% Responsive et Cliquable
                  ========================================================================= */}
              <div className="mb-4 sm:mb-6 pb-3 sm:pb-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sama-orange text-white flex items-center justify-center text-[11px] sm:text-xs font-black shadow-xs">
                      {currentStep}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                      {currentStep === 1 && "Étape 1 : Type de site"}
                      {currentStep === 2 && "Étape 2 : Formule & Budget"}
                      {currentStep === 3 && "Étape 3 : Délai de livraison"}
                      {currentStep === 4 && "Étape 4 : Coordonnées & Devis"}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold text-sama-orange font-mono bg-orange-50 px-2 py-0.5 rounded-md">
                    {Math.round((currentStep / 4) * 100)}%
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>

                {/* 4 Interactive Stepper Buttons */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2.5 text-center text-[10px] sm:text-xs font-bold">
                  {[
                    { num: 1, full: "1. Type", short: "Type" },
                    { num: 2, full: "2. Formule", short: "Formule" },
                    { num: 3, full: "3. Délai", short: "Délai" },
                    { num: 4, full: "4. Contact", short: "Contact" },
                  ].map((s) => {
                    const isPassed = currentStep >= s.num;
                    const isCurrent = currentStep === s.num;

                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => goToStep(s.num)}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                          isCurrent
                            ? "text-sama-orange bg-orange-50 font-black shadow-2xs"
                            : isPassed
                            ? "text-slate-700 hover:text-sama-orange hover:bg-slate-50 font-bold"
                            : "text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        <span className="hidden sm:inline">{s.full}</span>
                        <span className="sm:hidden">{s.short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================================
                  ÉTAPE 1 : TYPE DE SITE INTERNET (CLIC DIRECT AVEC TRANSITION AUTO !)
                  ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight">
                        Quel type de site souhaitez-vous développer ?
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        👉 <strong>Cliquez sur une carte pour passer directement à l'étape 2.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {websiteTypes.map((type) => {
                      const isSelected = selectedType === type.id;

                      return (
                        <div
                          key={type.id}
                          onClick={() => handleSelectType(type.id)}
                          className={`group relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between overflow-hidden ${
                            isSelected
                              ? "border-sama-orange bg-gradient-to-b from-orange-50/90 via-white to-orange-50/50 shadow-[0_6px_20px_rgba(255,107,0,0.2)] ring-2 ring-sama-orange/30 -translate-y-0.5"
                              : "border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-1"
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                          {/* Top Row: 3D Tinted Box with Colored Non-White Icon */}
                          <div className="flex items-center justify-between mb-3 relative z-10">
                            <div
                              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${type.iconBg}`}
                            >
                              {renderIcon(type.iconName, `w-5 h-5 sm:w-6 sm:h-6 ${type.iconColor}`)}
                            </div>

                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? "border-sama-orange bg-sama-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.5)] scale-105"
                                  : "border-slate-300 bg-white group-hover:border-sama-orange/60"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-75" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-sama-orange/40 transition-colors" />
                              )}
                            </div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-1 mb-1">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${type.badgeClass}`}
                              >
                                {type.badge}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sama-orange transition-colors mb-1">
                              {type.title}
                            </h4>

                            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                              {type.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-sama-orange transition-colors">
                            <span>{isSelected ? "Sélectionné ✓" : "Choisir ce type"}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedType === "autre" && (
                    <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-bold text-slate-800">
                        Précisez la nature de votre projet web spécifique :
                      </label>
                      <input
                        type="text"
                        value={otherTypeDetail}
                        onChange={(e) => setOtherTypeDetail(e.target.value)}
                        placeholder="Ex : Plateforme de mise en relation, application SaaS, portail de formation..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                      />
                      {errors.otherTypeDetail && (
                        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.otherTypeDetail}</span>
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!otherTypeDetail.trim()) {
                            setErrors({ otherTypeDetail: "Veuillez préciser votre type de projet." });
                            return;
                          }
                          setCurrentStep(2);
                          scrollToFormTop();
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-sama-orange hover:bg-sama-orange-hover text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <span>Continuer vers les formules</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  ÉTAPE 2 : FORMULE ET BUDGET EN FCFA (ZÉRO CHEVAUCHEMENT & TRANSITION AUTO)
                  ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight">
                        Quelle formule correspond le mieux à vos objectifs ?
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        👉 <strong>Cliquez sur une formule pour passer automatiquement à l'étape 3.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {websiteFormulas.map((formula) => {
                      const isSelected = selectedFormulaId === formula.id;

                      return (
                        <div
                          key={formula.id}
                          onClick={() => handleSelectFormula(formula.id)}
                          className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between overflow-hidden ${
                            isSelected
                              ? "border-sama-orange bg-gradient-to-b from-orange-50/80 via-white to-orange-50/40 shadow-[0_8px_25px_rgba(255,107,0,0.2)] ring-2 ring-sama-orange/30 -translate-y-0.5"
                              : "border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-lg hover:-translate-y-1"
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                          <div className="relative z-10 space-y-3">
                            {/* Non-overlapping Top Banner for Popular formula */}
                            {formula.isPopular && (
                              <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-white" />
                                  <span>Formule la plus choisie</span>
                                </div>
                                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                                  Recommandé
                                </span>
                              </div>
                            )}

                            {/* Top row with 3D Tinted Icon Box (Colored Non-White Icon) */}
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${formula.iconBg}`}
                              >
                                {renderIcon(formula.iconName, `w-5 h-5 sm:w-6 sm:h-6 ${formula.iconColor}`)}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${formula.badgeClass}`}
                                >
                                  {formula.badge}
                                </span>

                                <div
                                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                                    isSelected
                                      ? "border-sama-orange bg-sama-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.5)] scale-105"
                                      : "border-slate-300 bg-white group-hover:border-sama-orange/60"
                                  }`}
                                >
                                  {isSelected ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-75" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-sama-orange/40 transition-colors" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-sama-orange transition-colors">
                                {formula.name}
                              </h4>
                              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                                {formula.subtitle}
                              </p>
                            </div>

                            {/* Clean Responsive Price Badge with NO text collision */}
                            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  Investissement indicatif
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium truncate block">
                                  Clé en main tout inclus
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm sm:text-lg font-black font-mono tracking-tight text-sama-orange whitespace-nowrap block">
                                  {formula.formattedPrice}
                                </span>
                              </div>
                            </div>

                            {/* Inclusions List */}
                            <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-600">
                              <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                                Inclus dans la formule :
                              </span>
                              {formula.inclusions.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-sama-orange shrink-0 mt-0.5 stroke-[2.5]" />
                                  <span className="leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-sama-orange transition-colors">
                            <span>{isSelected ? "Formule sélectionnée ✓" : "Cliquer pour valider"}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  ÉTAPE 3 : DÉLAI SOUHAITÉ DE LIVRAISON (CLIC DIRECT AVEC TRANSITION AUTO !)
                  Séparée de l'étape de contact pour une expérience aérée et mobile-first
                  ========================================================================= */}
              {currentStep === 3 && (
                <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight">
                      Quel est le délai souhaité pour votre projet web ?
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      👉 <strong>Cliquez sur une option pour passer directement aux coordonnées finales.</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                    {projectDeadlines.map((dl) => {
                      const isSelected = clientInfo.deadline === dl.id;

                      return (
                        <div
                          key={dl.id}
                          onClick={() => handleSelectDeadline(dl.id)}
                          className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between overflow-hidden ${
                            isSelected
                              ? "border-sama-orange bg-gradient-to-b from-orange-50/80 via-white to-orange-50/40 shadow-md ring-2 ring-sama-orange/20 -translate-y-0.5"
                              : "border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-sm hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                          <div className="space-y-3 relative z-10">
                            {/* Top row with 3D Tinted Icon Box (Colored Non-White Icon), Badge & Check */}
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${dl.iconBg}`}
                              >
                                {renderIcon(dl.iconName, `w-6 h-6 ${dl.iconColor}`)}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${dl.badgeClass}`}>
                                  {dl.badge}
                                </span>

                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                    isSelected
                                      ? "border-sama-orange bg-sama-orange text-white shadow-xs"
                                      : "border-slate-300 bg-white group-hover:border-sama-orange/60"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                            </div>

                            {/* Label & Description (No awkward truncation!) */}
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-sama-orange transition-colors">
                                {dl.label}
                              </h4>
                              <span className="text-[11px] font-bold text-sama-orange block mt-0.5 font-mono">
                                {dl.tag}
                              </span>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
                                {dl.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-sama-orange transition-colors">
                            <span>{isSelected ? "Délai sélectionné ✓" : "Choisir ce délai"}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  ÉTAPE 4 : COORDONNÉES DU CLIENT & FINALISATION (ÉTAPE FINALE DÉDIÉE)
                  Uniquement le formulaire de coordonnées pour un parcours ultra-fluide
                  ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight">
                      Vos coordonnées pour finaliser votre devis
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Remplissez vos coordonnées pour recevoir votre proposition chiffrée sous 24h.
                    </p>
                  </div>

                  {/* Banner error if validation failed */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold">
                        Veuillez remplir correctement les cases signalées en rouge.
                      </span>
                    </div>
                  )}

                  {/* Nom complet & Entreprise */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sama-orange" />
                        <span>Nom complet <span className="text-sama-orange">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={clientInfo.fullName}
                        onChange={handleInputChange}
                        placeholder="Ex : Cheikh Tidiane Sy"
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm transition-all ${
                          errors.fullName
                            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-200 bg-white focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Entreprise ou marque <span className="text-sama-orange">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={clientInfo.companyName}
                        onChange={handleInputChange}
                        placeholder="Ex : Teranga Immo, Baobab Shop..."
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm transition-all ${
                          errors.companyName
                            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-200 bg-white focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                        }`}
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.companyName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Numéro WhatsApp avec drapeau +221 fixe & E-mail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Numéro WhatsApp (9 chiffres) <span className="text-sama-orange">*</span></span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 text-[11px] font-bold select-none pointer-events-none z-10 shadow-2xs">
                          <SenegalFlag className="w-4 h-3" />
                          <span className="font-mono tracking-tight text-slate-900 font-bold">+221</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="77 123 45 67"
                          value={clientInfo.whatsappNumber}
                          onChange={handlePhoneChange}
                          maxLength={12}
                          className={`w-full pl-[88px] pr-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm transition-all font-mono tracking-wide ${
                            errors.whatsappNumber
                              ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                              : "border-slate-200 bg-white focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                          }`}
                        />
                      </div>
                      {errors.whatsappNumber ? (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.whatsappNumber}</span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Tapez vos 9 chiffres sans l'indicatif +221
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>Adresse e-mail <span className="text-sama-orange">*</span></span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={clientInfo.email}
                        onChange={handleInputChange}
                        placeholder="Ex : contact@entreprise.sn"
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm transition-all ${
                          errors.email
                            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-200 bg-white focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description courte du projet */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sama-orange" />
                      <span>Description de votre projet web <span className="text-sama-orange">*</span></span>
                    </label>
                    <textarea
                      name="projectDescription"
                      rows={3}
                      value={clientInfo.projectDescription}
                      onChange={handleInputChange}
                      placeholder="Précisez votre activité, vos objectifs commerciaux, les pages clés souhaitées ou des exemples de sites qui vous inspirent..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all ${
                        errors.projectDescription
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                          : "border-slate-200 bg-white focus:ring-2 focus:ring-sama-orange/40 focus:border-sama-orange"
                      }`}
                    />
                    {errors.projectDescription && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.projectDescription}</span>
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* =========================================================================
                  BARRE D'ACTIONS BASSE (Précédent & Validation) - 100% Mobile
                  ========================================================================= */}
              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mt-4 sm:mt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Étape précédente</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-sama-orange hover:bg-sama-orange-hover text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-glow-orange transition-all transform hover:-translate-y-0.5 cursor-pointer ml-auto"
                  >
                    <span>
                      {currentStep === 1
                        ? `Passer aux formules (1/4)`
                        : currentStep === 2
                        ? `Passer au choix du délai (2/4)`
                        : currentStep === 3
                        ? `Passer aux coordonnées (3/4)`
                        : `Continuer (${currentStep}/4)`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-sama-orange hover:bg-sama-orange-hover text-white text-xs sm:text-base font-bold shadow-xl hover:shadow-glow-orange transition-all transform hover:-translate-y-0.5 cursor-pointer ml-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enregistrement de votre devis...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Valider ma demande de devis</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
        </div>

      </div>
    </div>
  );
};
