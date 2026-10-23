"use client";

import { LeadQuote } from "@/components/admin/LeadsTable";

// Registre du Service Worker en mémoire
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Enregistre le Service Worker /sw.js pour les notifications PWA et mobiles.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    swRegistration = registration;
    return registration;
  } catch (err) {
    console.warn("Service Worker registration notice:", err);
    return null;
  }
}

/**
 * Retourne le statut actuel des permissions de notification.
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Demande la permission d'envoyer des notifications sur l'appareil (téléphone ou ordinateur).
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    // Enregistre également le service worker si ce n'est pas encore fait
    await registerServiceWorker();
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Erreur lors de la demande de permission:", err);
    return Notification.permission || "default";
  }
}

/**
 * Synthétiseur de carillon audio haute fidélité via Web Audio API.
 * Génère un son d'alerte professionnel harmonieux sans aucune dépendance réseau.
 */
export function playExecutiveChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1: A5 (880 Hz) - douce attaque
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2: E6 (1318.5 Hz) - carillon cristallin
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch (e) {
    // Si l'audio context est bloqué par la politique autoplay du navigateur
    console.debug("AudioContext chime muted:", e);
  }
}

/**
 * Envoie une notification push système sur le téléphone ou le navigateur pour un nouveau devis.
 */
export async function sendLeadPushNotification(lead: Partial<LeadQuote>) {
  // 1. Jouer le carillon d'alerte
  playExecutiveChime();

  // 2. Vibration mobile si supportée
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // Ignorer si vibration non autorisée
    }
  }

  // 3. Vérifier la permission
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const clientName = lead.full_name || "Nouveau prospect";
  const company = lead.company_name ? ` (${lead.company_name})` : "";
  const service = lead.service_requested || "Devis général";
  const budget = lead.budget_range ? ` • Budget: ${lead.budget_range}` : "";

  const title = `🔔 Nouveau devis : ${clientName}${company}`;
  const body = `${service}${budget} • Cliquez pour inspecter le dossier.`;

  const options: NotificationOptions = {
    body,
    icon: "/images/logo-sp.png",
    badge: "/images/logo-sp.png",
    tag: `lead-${lead.id || Date.now()}`,
    data: {
      url: "/admin",
      leadId: lead.id,
    },
    // Options pour mobiles PWA
    requireInteraction: true,
  };

  try {
    // Priorité au Service Worker (obligatoire pour Android PWA et iOS Safari PWA)
    if ("serviceWorker" in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, options);
        return;
      }
    }

    // Fallback standard si Service Worker non disponible
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.warn("Échec de l'envoi de la notification push:", err);
  }
}

/**
 * Envoie une notification de test immédiate pour permettre au client de vérifier le fonctionnement sur son téléphone.
 */
export async function sendTestPushNotification() {
  playExecutiveChime();

  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // ignore
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    alert("Les notifications ne sont pas prises en charge par ce navigateur.");
    return;
  }

  let perm: NotificationPermission | "unsupported" = Notification.permission;
  if (perm !== "granted") {
    perm = await requestNotificationPermission();
  }

  if (perm !== "granted") {
    alert(
      "Veuillez autoriser les notifications dans les paramètres de votre navigateur pour recevoir les alertes sur votre téléphone."
    );
    return;
  }

  const title = "🔔 SAMA PUB — Test de notification réussi !";
  const body =
    "Votre application est parfaitement configurée. Vous recevrez désormais chaque nouveau devis en direct sur votre téléphone.";

  const options: NotificationOptions = {
    body,
    icon: "/images/logo-sp.png",
    badge: "/images/logo-sp.png",
    tag: "test-notification",
    data: { url: "/admin" },
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, options);
        return;
      }
    }
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.error("Erreur test notification:", err);
  }
}
