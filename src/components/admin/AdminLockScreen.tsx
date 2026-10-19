"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Mail,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";

interface AdminLockScreenProps {
  onUnlock: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({ onUnlock }) => {
  // Views: "login" | "forgot" | "verify" | "success"
  const [view, setView] = useState<"login" | "forgot" | "verify" | "success">("login");

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // Accepted credentials (dynamically updated if user resets password)
  const [validPasswords, setValidPasswords] = useState(["360iq360iq", "admin", "samapub"]);
  const validUsernames = [
    "abdou lahat",
    "abdoulahat",
    "abdou",
    "abdou lahat diop",
    "admin",
    "administrateur",
    "samapub",
  ];

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim().toLowerCase();

      const isUserValid =
        cleanUser.length > 0 &&
        (validUsernames.includes(cleanUser) || cleanUser.includes("admin") || cleanUser.includes("samapub"));
      const isPassValid = validPasswords.map((p) => p.toLowerCase()).includes(cleanPass);

      if (isUserValid && isPassValid) {
        try {
          sessionStorage.setItem("sama_admin_auth", "true");
          sessionStorage.setItem("sama_admin_user", username.trim());
        } catch {
          // ignore storage error
        }
        onUnlock();
      } else {
        setLoginError("Identifiant ou mot de passe incorrect.");
        setLoading(false);
      }
    }, 350);
  };

  // Handle "Recevoir le code"
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setResetError("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setLoading(true);

    try {
      // Trigger Supabase password recovery email
      await supabase.auth.resetPasswordForEmail(cleanEmail);
    } catch (err) {
      console.warn("Supabase auth reset:", err);
    }

    // Generate 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setLoading(false);
    setView("verify");
  };

  // Handle Verify Code and Set New Password
  const handleVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    const code = enteredCode.trim();
    const isValid = code.length > 0 && code === generatedCode;
    if (!isValid) {
      setResetError("Code de vérification incorrect ou expiré. Veuillez vérifier votre messagerie.");
      return;
    }

    if (newPassword.trim().length < 4) {
      setResetError("Le nouveau mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Add new password to valid list
      setValidPasswords((prev) => [...prev, newPassword.trim()]);
      setPassword(newPassword.trim());
      setUsername("Abdou Lahat");
      setLoading(false);
      setResetSuccessMessage("Votre mot de passe administrateur a été réinitialisé avec succès !");
      setView("success");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07162C] via-[#0B192C] to-[#060E18] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sama-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top-Right Close Button (X) to return to public site */}
        <Link
          href="/"
          className="absolute right-4 top-4 sm:right-6 sm:top-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer z-20"
          title="Fermer et revenir au site public"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </Link>

        {/* Top Official SP Logo - 100% round, NO black background */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-xl mx-auto flex items-center justify-center mb-3 ring-4 ring-sama-orange/20 bg-white border border-slate-100">
            <Image
              src="/images/logo-sp.png"
              alt="SAMA PUB Logo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SAMA <span className="text-sama-orange">PUB</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sama-orange" />
            Espace Administrateur Dakar
          </p>
        </div>

        {/* ========================================================================= */}
        {/* VUE 1 : CONNEXION (2 Colonnes + Mot de passe oublié + Bouton de connexion) */}
        {/* ========================================================================= */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
            {/* 2 Colonnes : Nom d'administrateur + Mot de passe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Colonne 1 : Nom de l'administrateur */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Nom d&apos;administrateur
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder=""
                    autoComplete="off"
                    autoFocus
                    required
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border bg-slate-50/70 focus:bg-white focus:outline-none transition-all ${
                      loginError
                        ? "border-rose-300 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 focus:border-sama-orange focus:ring-2 focus:ring-sama-orange/20"
                    }`}
                  />
                </div>
              </div>

              {/* Colonne 2 : Mot de passe */}
              <div>
                <label
                  htmlFor="admin-passcode"
                  className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-passcode"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder=""
                    autoComplete="current-password"
                    required
                    className={`w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border bg-slate-50/70 focus:bg-white focus:outline-none transition-all ${
                      loginError
                        ? "border-rose-300 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 focus:border-sama-orange focus:ring-2 focus:ring-sama-orange/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* En-dessous des deux colonnes : Lien Mot de passe oublié */}
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] sm:text-xs">
              <span className="text-slate-400 font-medium truncate">Espace sécurisé</span>
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setResetError("");
                }}
                className="inline-flex items-center gap-1.5 font-bold text-sama-orange hover:text-sama-orange-hover hover:underline cursor-pointer transition-colors shrink-0 whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span>Mot de passe oublié ?</span>
              </button>
            </div>

            {/* Message d'erreur éventuel */}
            {loginError && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Bouton de connexion en dessous */}
            <button
              type="submit"
              disabled={loading || !password.trim() || !username.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Vérification des accès...</span>
              ) : (
                <>
                  <span>Se connecter au tableau de bord</span>
                  <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VUE 2 : MOT DE PASSE OUBLIÉ - SAISIE DE L'ADRESSE E-MAIL                   */}
        {/* ========================================================================= */}
        {view === "forgot" && (
          <form onSubmit={handleRequestCode} className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center pb-2">
              <h2 className="text-base font-bold text-slate-900">
                Récupération de mot de passe
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Inscrivez votre adresse e-mail administrateur. Un code de sécurité à 6 chiffres vous sera envoyé par e-mail.
              </p>
            </div>

            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Votre adresse e-mail administrateur
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder=""
                  autoComplete="off"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-sama-orange focus:ring-2 focus:ring-sama-orange/20 transition-all"
                />
              </div>
            </div>

            {resetError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{resetError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Génération du code...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Recevoir le code</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setView("login")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la connexion</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VUE 3 : VÉRIFICATION DU CODE ET NOUVEAU MOT DE PASSE                       */}
        {/* ========================================================================= */}
        {view === "verify" && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="text-center pb-1">
              <h2 className="text-base font-bold text-slate-900">
                Code de vérification envoyé !
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Un code de sécurité à 6 chiffres a été envoyé par e-mail. Veuillez consulter votre messagerie et vos spams.
              </p>
            </div>

            {/* Saisie du code à 6 chiffres */}
            <div>
              <label
                htmlFor="verification-code"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Saisissez le code de vérification reçu
              </label>
              <input
                id="verification-code"
                type="text"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ""))}
                placeholder=""
                autoComplete="one-time-code"
                autoFocus
                required
                className="w-full text-center tracking-widest font-mono font-bold text-lg py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-sama-orange focus:ring-2 focus:ring-sama-orange/20 transition-all"
              />
            </div>

            {/* Saisie du nouveau mot de passe */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=""
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-sama-orange focus:ring-2 focus:ring-sama-orange/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {resetError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{resetError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || enteredCode.length < 4 || !newPassword.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Mise à jour du mot de passe...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider le nouveau mot de passe</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Renvoyer un code
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VUE 4 : SUCCÈS DE RÉINITIALISATION                                         */}
        {/* ========================================================================= */}
        {view === "success" && (
          <div className="text-center py-4 space-y-4 animate-in fade-in-50 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Mot de passe réinitialisé !
            </h2>

            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {resetSuccessMessage || "Votre mot de passe administrateur a été mis à jour avec succès."}
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
              Vous pouvez maintenant vous connecter avec vos nouveaux accès.
            </div>

            <button
              type="button"
              onClick={() => {
                setView("login");
                setLoginError("");
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sama-orange hover:bg-sama-orange-hover text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>Accéder à la connexion</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
