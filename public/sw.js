// SAMA PUB — Service Worker pour Notifications Mobiles & Push
const CACHE_NAME = "sama-pub-admin-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Écoute des clics sur les notifications sur smartphone ou ordinateur
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre admin est déjà ouverte, on la met en avant
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          return client.focus();
        }
      }
      // Sinon, on ouvre directement l'application admin
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Réception des messages envoyés par l'application pour afficher une notification système
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      ...options,
      icon: options.icon || "/images/logo-sp.png",
      badge: options.badge || "/images/logo-sp.png",
      vibrate: options.vibrate || [200, 100, 200, 100, 200],
    });
  }
});
