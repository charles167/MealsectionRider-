import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const SignUp = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    password: "",
    School: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submitForm = async () => {
    setError("");
    if (
      !formData.userName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.School
    ) {
      setError("Please fill all fields");
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/riders/signup`,
        {
          userName: formData.userName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          university: formData.School,
        }
      );

      const newRider = res?.data?.newRider;
      if (newRider?._id) {
        localStorage.setItem("riderId", newRider._id);
      }

      toast.success("Signup successful!");
      navigate("/");
      setTimeout(() => window.location.reload(), 150);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleFetch = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/universities`
        );
        if (data) {
          setUniversities(data.universities);
        } else {
          toast.error("Error fetching universities. Please reload the page");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching universities");
      }
    };

    handleFetch();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 flex flex-col font-sans relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Right - Form */}
        <div className="w-full flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--default)] transition-colors mb-8 group"
            >
              <IoIosArrowRoundBack
                size={28}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-medium">Back to Login</span>
            </Link>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-500">
                  Fill in your details to get started
                </p>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
                className="space-y-6"
              >
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="userName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    User Name
                  </label>
                  <div className="relative">
                    <input
                      id="userName"
                      name="userName"
                      onChange={handleInput}
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
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

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      onChange={handleInput}
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      onChange={handleInput}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Password */}
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
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
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

                {/* University */}
                <div className="space-y-2">
                  <label
                    htmlFor="School"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Your University
                  </label>
                  <div className="relative">
                    <select
                      id="School"
                      name="School"
                      value={formData.School}
                      onChange={handleInput}
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 text-gray-700"
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select your University
                      </option>
                      {universities.map((item) => (
                        <option key={item._id || item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  {loading ? (
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
                      <span>Creating account...</span>
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[var(--default)] hover:text-[#9e0505] hover:underline transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <p className="text-center text-gray-500 text-sm mt-8">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[var(--default)] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[var(--default)] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
