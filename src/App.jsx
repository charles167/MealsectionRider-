import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import Orders from "./Pages/Orders/Orders";
import History from "./Pages/History/History";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { messaging, onMessage } from "./config/firebase";
import { useRiderNotifications } from "./hooks/useRiderNotifications";

function App() {
  const riderId = localStorage.getItem("riderId");

  // ✅ Socket-based in-app notifications (reliable fallback for FCM)
  useRiderNotifications(riderId);

  useEffect(() => {
    // Listen for foreground FCM notifications (if available)
    if (riderId) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground notification received:", payload);

        // Show toast notification
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <span className="text-2xl">🛵</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payload.notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {payload.notification.body}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 6000 }
        );

        // Play notification sound
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => console.log("Could not play sound"));
      });

      return () => unsubscribe();
    }
  }, [riderId]);

  return (
    <>
      <Routes>
        {riderId ? (
          <Route path="/" element={<Home />} />
        ) : (
          <Route path="/" element={<Login />} />
        )}
        <Route path="/sign-up" element={<SignUp />} />

        <Route path="/order" element={<Orders />} />
        <Route path="/history" element={<History />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
