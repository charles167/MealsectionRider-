import React, { useState, useMemo } from "react";
import SideBar from "../../components/SideBar/SideBar";
import { IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { useEffect } from "react";
import axios from "axios";
import { PiPersonSimpleBike } from "react-icons/pi";
import toast from "react-hot-toast";
import "../Orders/Orders.css";
const Home = () => {
  const [allRider, setAllRiders] = useState([]);
  const [allOrder, setAllOrders] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const riderId = localStorage.getItem("riderId");
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/riders/allRiders`
      );
      if (response) {
        setAllRiders(response.data);
      } else {
        toast.error("error fetching riders please refresh Page");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
      );
      if (response) {
        setAllOrders(response.data.orders);
      } else {
        toast.error("error fetching Orders please refresh Page");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await fetchUsers();
        await fetchOrders();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const findRider = allRider?.find((item) => item._id === riderId);

  // Derived metrics
  const riderOrders = useMemo(() => {
    return allOrder.filter((o) => o.rider === findRider?._id);
  }, [allOrder, findRider?._id]);
  const activeDeliveries = riderOrders.filter(
    (o) => o.currentStatus !== "Delivered"
  );
  const completedDeliveries = riderOrders.filter(
    (o) => o.currentStatus === "Delivered"
  );
  const todayCompleted = useMemo(() => {
    const todayStr = new Date().toDateString();
    return completedDeliveries.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr
    );
  }, [completedDeliveries]);
  const totalPacksDelivered = completedDeliveries.reduce(
    (sum, o) => sum + (o.packs?.length || 0),
    0
  );
  const earningEstimate = useMemo(() => {
    // Rough estimate: deliveryFee field may exist per order else fallback value
    return completedDeliveries.reduce(
      (sum, o) => sum + (o.deliveryFee || 0),
      0
    );
  }, [completedDeliveries]);

  const [online, setOnline] = useState(true);

  // const filterOrder = allOrder?.filter(
  //   (item) => item.university === findRider?.university && item.rider === findRider?._id
  // );
  const UpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API
        }/api/users/orders/${orderId}/updateStatus`,
        { currentStatus: newStatus }
      );

      // Optimistically update the frontend without re-fetching
      setAllOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, currentStatus: newStatus } : order
        )
      );

      if (newStatus === "Delivered") {
        toast.success("Order delivered! Delivery fee added to your balance.");
      } else {
        toast.success(`Order status changed to "${newStatus}"`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const [openNav, setOpenNav] = useState(false);
  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 justify-between">
      {openNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Sidebar: slides in on mobile, always visible on md+ */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300
          ${openNav ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 w-[270px] md:w-[240px]
        `}
      >
        <SideBar setOpenNav={setOpenNav} />
      </div>

      <div className="flex-1 md:ml-[240px] w-full min-h-screen overflow-y-auto">
        <div className="md:p-6 px-5 mt-3 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4 items-center">
              <button
                className="md:hidden flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-white transition-all shadow-sm"
                onClick={() => setOpenNav(true)}
              >
                <IoMenu size={18} className="text-gray-700" />
              </button>
              <div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Rider Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Overview of your deliveries and performance
                </p>
              </div>
            </div>
          </div>
          {/* Profile + quick actions */}
          <div className="mt-4 grid gap-4 md:grid-cols-5 grid-cols-2">
            <div className="md:col-span-2 col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center rounded-xl">
                <PiPersonSimpleBike className="text-[var(--default)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm truncate">
                  {findRider?.userName || "Rider"}
                </h1>
                <button
                  onClick={() => setOnline((o) => !o)}
                  className={`mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                    online
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {online ? "Online" : "Offline"}
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <p className="text-[11px] text-gray-500">Wallet Balance</p>
              <p className="text-lg font-bold text-gray-800">
                ₦{findRider?.availableBal?.toLocaleString() || 0}
              </p>
            </div>
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <p className="text-[11px] text-gray-500">Active</p>
              <p className="text-lg font-bold text-gray-800">
                {activeDeliveries.length}
              </p>
            </div>
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <p className="text-[11px] text-gray-500">Completed</p>
              <p className="text-lg font-bold text-gray-800">
                {completedDeliveries.length}
              </p>
            </div>
            <div className="md:col-span-2 col-span-2 flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <p className="text-[11px] text-gray-500">Today Deliveries</p>
              <p className="text-lg font-bold text-gray-800">
                {todayCompleted.length}
              </p>
            </div>
            <div className="md:col-span-3 col-span-2 flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
              <p className="text-[11px] text-gray-500">Delivered Packs</p>
              <p className="text-lg font-bold text-gray-800">
                {totalPacksDelivered}
              </p>
            </div>
          </div>

          {/* Earnings estimate */}
          <div className="mt-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 shadow-lg shadow-emerald-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <p className="text-emerald-100 text-xs font-medium">
                    Estimated Earnings
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ₦{earningEstimate?.toLocaleString() || 0}
                  </p>
                  <p className="text-emerald-100/80 text-xs mt-2">
                    Based on delivered orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          {completedDeliveries.length > 0 && (
            <TrendCard deliveries={completedDeliveries} />
          )}

          {/* Recent Orders */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              Recent Activity
            </h2>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-40 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                      <div className="h-5 w-12 bg-gray-100 rounded-full animate-pulse" />
                      <div className="h-5 w-10 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {riderOrders
                    .slice()
                    .reverse()
                    .slice(0, 6)
                    .map((o) => (
                      <div
                        key={o._id}
                        onClick={() => setSelectedItem(o)}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-800">
                            #{o._id.slice(-6)}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              o.currentStatus === "Delivered"
                                ? "bg-emerald-50 text-emerald-600"
                                : o.currentStatus === "Processing"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {o.currentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {o.Address || "No address"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {o.packs?.slice(0, 3).map((p) => (
                            <span
                              key={p.vendorName + p.name}
                              className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 text-gray-600"
                            >
                              {p.vendorName}
                            </span>
                          ))}
                          {o.packs?.length > 3 && (
                            <span className="text-[10px] bg-gray-200 rounded-full px-2 py-0.5 text-gray-600">
                              +{o.packs.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {new Date(o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  {riderOrders.length === 0 && (
                    <div className="col-span-full text-sm text-gray-500">
                      No recent activity yet.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-12 ">
            <div className="mb-6">
              <h1 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-500 rounded-full" />
                Active Deliveries
                <span className="text-xs font-medium text-gray-500">
                  ({activeDeliveries.length})
                </span>
              </h1>
              <p className="text-xs text-gray-500 ml-3 mt-1">
                Manage orders currently in progress
              </p>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8">
              {loading ? (
                [1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="w-full bg-white rounded-2xl shadow-md p-5 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="mt-5 h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                ))
              ) : allOrder.filter(
                  (item) =>
                    item.rider === findRider?._id &&
                    item.currentStatus !== "Delivered"
                ).length > 0 ? (
                allOrder
                  .slice()
                  .reverse()
                  .filter(
                    (item) =>
                      item.rider === findRider?._id &&
                      item.currentStatus !== "Delivered"
                  )
                  .map((item, index) => (
                    <div
                      key={index}
                      className="w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-[16px] text-gray-800">
                          Order #{item._id?.slice(-6) || "123456"}
                        </h2>
                        <span className="text-xs text-gray-500">
                          📦 {item.packs?.length || 0} packs
                        </span>
                      </div>

                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-700">
                            Pickup:
                          </span>{" "}
                          <div className="flex items-center flex-wrap gap-1 ">
                            {item.packs.map((item) => (
                              <div className="bg-[#f6f6f6] whitespace-nowrap p-1 px-2 text-[12px] rounded-full">
                                {" "}
                                {item.vendorName}
                              </div>
                            )) || "Vendor Store"}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Drop-Off:
                          </span>{" "}
                          {item.Address || "A Block"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Phone:
                          </span>{" "}
                          {item.PhoneNumber || "08012345678"}
                        </div>
                      </div>

                      <div className="flex justify-between mt-5">
                        {item.currentStatus === "Pending" && (
                          <button
                            onClick={() => UpdateStatus(item._id, "Processing")}
                            disabled={updatingStatus === item._id}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingStatus === item._id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Starting...
                              </>
                            ) : (
                              "Start Delivery"
                            )}
                          </button>
                        )}
                        {item.currentStatus === "Processing" && (
                          <button
                            onClick={() => UpdateStatus(item._id, "Delivered")}
                            disabled={updatingStatus === item._id}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[12px] font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingStatus === item._id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Completing...
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </button>
                        )}
                        {item.currentStatus === "Delivered" && (
                          <button
                            disabled
                            className="bg-emerald-500 text-white font-medium text-[12px] px-4 py-2 rounded-lg cursor-not-allowed"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500 font-medium text-lg">
                  🚫 No Orders found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-gray-700">✕</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Order Details
              </h2>
              <p className="text-sm text-gray-500">
                Order #{selectedItem._id.slice(0, 8)}
              </p>
            </div>

            <div className="space-y-4">
              {selectedItem?.packs?.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-white rounded-lg px-3 py-1.5 font-medium text-gray-600 border border-gray-200">
                      {p.vendorName}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Items
                    </p>
                    {p.items?.map((it, i2) => (
                      <div
                        key={i2}
                        className="flex justify-between items-center text-xs text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
                      >
                        <span>{it.name}</span>
                        <span className="font-semibold text-gray-900">
                          ×{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

// Lightweight weekly trend sparkline card
const TrendCard = ({ deliveries }) => {
  const daily = useMemo(() => {
    const counts = new Map();
    deliveries.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      ).toDateString();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      ).toDateString();
      arr.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
        value: counts.get(key) || 0,
      });
    }
    return arr;
  }, [deliveries]);

  const maxVal = Math.max(1, ...daily.map((d) => d.value));
  const width = 240;
  const height = 64;
  const step = daily.length > 1 ? width / (daily.length - 1) : 0;
  const points = daily
    .map((d, i) => {
      const x = i * step;
      const y = height - (d.value / maxVal) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const total = daily.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-gray-500">Weekly Trend</p>
            <h3 className="text-base font-semibold text-gray-900">
              Last 7 days
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">Delivered</p>
            <p className="text-xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              points={points}
            />
            <polygon
              fill="url(#trendGradient)"
              points={`${points} ${width},${height} 0,${height}`}
            />
          </svg>
          <div className="flex-1 flex justify-between text-[10px] text-gray-500">
            {daily.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
