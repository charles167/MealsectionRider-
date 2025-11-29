import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { messaging, getToken } from "../../config/firebase";
import { IoIosArrowRoundBack } from "react-icons/io";

const Login = () => {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Request notification permission and get FCM token
  const requestNotificationPermission = async () => {
    try {
      console.log("👉 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("🔔 Permission result:", permission);

      if (permission !== "granted") {
        console.log("🚫 Permission not granted, skipping token.");
        return null;
      }

      if (!("serviceWorker" in navigator)) {
        console.log("❌ Service workers not supported in this browser.");
        return null;
      }

      // Wait for the service worker that Vite/Firebase registered
      const registration = await navigator.serviceWorker.ready;
      console.log("🧾 Service worker ready:", registration);

      const token = await getToken(messaging, {
        vapidKey:
          "BGRrHITgNaK202cuNVMwzxzc_9J8IJloWbYwC0YE2CMQvuYCYJfb-YmwQPueqaZhf8ElJqauT27Uw0z11oHcjMA",
        serviceWorkerRegistration: registration,
      });

      console.log("🎯 FCM token:", token);
      return token || null;
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return null;
    }
  };

  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLogin({ ...login, [name]: value });
  };

  const submitForm = async () => {
    if (!login.email || !login.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Get FCM token for push notifications
      const fcmToken = await requestNotificationPermission();

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API}/api/riders/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...login,
            fcmToken: fcmToken,
          }),
        }
      );

      // Try to parse only if JSON exists
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        toast.error(data?.message || "Invalid email or password");
        return;
      }

      // ✅ Login success
      localStorage.setItem("token", data?.token);
      localStorage.setItem("riderId", data.rider?.id);

      toast.success("Login successful!");
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-200/20 to-red-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="  flex items-center justify-center  min-h-screen">
        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 w-full flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome Back! 👋
                </h2>
                <p className="text-gray-500">
                  Sign in to your rider account to start delivering
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
                className="space-y-6"
              >
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      onChange={handleInput}
                      type="text"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={isLoading}
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleInput}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={isLoading}
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[var(--default)] border-gray-300 rounded focus:ring-2 focus:ring-[var(--default)] cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      Remember Me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[var(--default)] hover:text-[#9e0505] hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="font-semibold text-[var(--default)] hover:text-[#9e0505] hover:underline transition-colors"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <p className="text-center text-gray-500 text-sm mt-8">
              By signing in, you agree to our{" "}
              <a href="#" className="text-[var(--default)] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[var(--default)] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
