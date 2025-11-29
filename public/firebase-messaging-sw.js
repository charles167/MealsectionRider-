importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCuhOf2moOETuEPbOamxNPWuoKYtW2RHv0",
  authDomain: "mealsection-b4963.firebaseapp.com",
  projectId: "mealsection-b4963",
  storageBucket: "mealsection-b4963.firebasestorage.app",
  messagingSenderId: "744735761594",
  appId: "1:744735761594:web:3016d14fc42193385fce83",
  measurementId: "G-Q1J5Z3BVBK",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true",
    badge:
      "https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true",
    tag: payload.data?.orderId || "delivery-notification",
    requireInteraction: true,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow("/");
      })
  );
});

// Fallback push event handler (for generic Web Push payloads)
self.addEventListener("push", (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.notification?.title || data.title || "MealSection";
    const options = {
      body: data.notification?.body || data.body || "",
      icon:
        data.notification?.icon ||
        "https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true",
      data: data.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {}
});
