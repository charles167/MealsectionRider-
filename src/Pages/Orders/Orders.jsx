import React, { useEffect, useMemo, useState } from "react";
import SideBar from "../../components/SideBar/SideBar";
import { IoCheckmark, IoClose, IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { FiSearch } from "react-icons/fi";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { GoPackage } from "react-icons/go";
import { MdClose, MdOutlineContentPasteSearch } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";
import "./Orders.css";

const Orders = () => {
  const [openNav, setOpenNav] = useState(false);
  const [modal, setModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedOrderId, setAssignedOrderId] = useState("");
  const [allOrder, setAllOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [accepted, setAccepted] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [allRider, setAllRiders] = useState([]);
  const riderId = localStorage.getItem("riderId");
  const { socket } = useSocket();
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
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
      );

      if (response && response.data.orders) {
        console.log(response.data.orders);

        setAllOrders(response.data.orders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Something went wrong fetching orders");
    } finally {
      setLoading(false);
    }
  };
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

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = () => {
      fetchOrders();
    };

    // Listen for new orders
    socket.on("orders:new", handleOrderUpdate);
    // Listen for vendor accepting orders
    socket.on("vendors:packsUpdated", handleOrderUpdate);
    // Listen for order status changes
    socket.on("orders:status", handleOrderUpdate);
    // Listen for rider assignment
    socket.on("orders:assignRider", handleOrderUpdate);

    return () => {
      socket.off("orders:new", handleOrderUpdate);
      socket.off("vendors:packsUpdated", handleOrderUpdate);
      socket.off("orders:status", handleOrderUpdate);
      socket.off("orders:assignRider", handleOrderUpdate);
    };
  }, [socket]);

  const findRider = allRider?.find((item) => item._id === riderId);
  console.log(findRider);
  const university = findRider?.university;

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = allOrder.filter((order) => order.university === university);
    if (!q) return base;
    return base.filter((o) => {
      const id = o._id?.toLowerCase() || "";
      const name = o.userName?.toLowerCase() || "";
      const packsStr = (o.packs || [])
        .map((p) => p.vendorName || "")
        .join(" ")
        .toLowerCase();
      return id.includes(q) || name.includes(q) || packsStr.includes(q);
    });
  }, [allOrder, university, query]);

  // Counts for summary cards (not affected by search)
  const baseOrders = useMemo(
    () => allOrder.filter((order) => order.university === university),
    [allOrder, university]
  );
  const newOrdersCount = useMemo(
    () =>
      baseOrders.filter(
        (item) =>
          item.currentStatus === "Pending" &&
          item.rider === "Not assigned" &&
          item.packs.some((pack) => pack.accepted === null)
      ).length,
    [baseOrders]
  );
  const ongoingCount = useMemo(
    () =>
      baseOrders.filter(
        (item) => item.currentStatus !== "Delivered" && item.rider === riderId
      ).length,
    [baseOrders, riderId]
  );
  const completedCount = useMemo(
    () =>
      baseOrders.filter(
        (item) => item.currentStatus === "Delivered" && item.rider === riderId
      ).length,
    [baseOrders, riderId]
  );

  console.log(filteredOrders);

  const assignRider = async (orderId, riderName) => {
    try {
      setAcceptingOrder(orderId);
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API
        }/api/users/orders/${orderId}/assign-rider`,
        { rider: riderName }
      );
      setAssignedOrderId(orderId.slice(0, 8));
      setShowSuccessModal(true);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Error accepting order. Please try again.");
    } finally {
      setAcceptingOrder(null);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 no-wrap-all overflow-x-auto sm:overflow-visible">
      {openNav && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
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

      <div className="flex-1 md:ml-[240px] w-full overflow-y-auto">
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
                  Order Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage all your deliveries
                </p>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <GoPackage className="text-white/80" size={18} />
                  <p className="text-xs font-medium text-white/90">
                    New Orders
                  </p>
                </div>
                <p className="text-3xl font-bold">{newOrdersCount}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <MdOutlineContentPasteSearch
                    className="text-white/80"
                    size={18}
                  />
                  <p className="text-xs font-medium text-white/90">Ongoing</p>
                </div>
                <p className="text-3xl font-bold">{ongoingCount}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <IoCheckmark className="text-white/80" size={20} />
                  <p className="text-xs font-medium text-white/90">Completed</p>
                </div>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <FaRegMoneyBillAlt className="text-white/80" size={16} />
                  <p className="text-xs font-medium text-white/90">
                    Total Orders
                  </p>
                </div>
                <p className="text-3xl font-bold">{baseOrders.length}</p>
              </div>
            </div>
          </div>

          {/* New Orders Section */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div>
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  New Orders
                </h2>
                <p className="text-xs text-gray-500 ml-3 mt-1">
                  Available orders awaiting assignment
                </p>
              </div>
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, name, or vendor..."
                  className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all w-72"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Packages
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-44 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter(
                  (item) =>
                    item.currentStatus === "Pending" &&
                    item.rider === "Not assigned" &&
                    item.packs.every((pack) => pack.accepted !== null)
                ).length === 0 ? (
                <div className="text-center py-16 bg-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <GoPackage className="text-blue-500" size={32} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No new orders found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    New orders will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Packages
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter(
                        (item) =>
                          item.currentStatus === "Pending" &&
                          item.rider === "Not assigned"
                      )
                      .reverse()
                      .slice(0, 6)
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {item.userName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                              <GoPackage size={14} />
                              {item?.packs.length} Pack
                              {item.packs.length > 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                              >
                                View
                              </button>
                              {item.rider === "Not assigned" && (
                                <button
                                  onClick={() => {
                                    const allReviewed = item.packs.every(
                                      (pack) => pack.accepted !== null
                                    );
                                    if (!allReviewed) {
                                      toast.error(
                                        "You cannot accept this order yet. Some packs are still awaiting approval."
                                      );
                                      return;
                                    }
                                    assignRider(item._id, findRider?._id);
                                  }}
                                  disabled={acceptingOrder === item._id}
                                  className="px-4 py-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {acceptingOrder === item._id ? (
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
                                      Accepting...
                                    </>
                                  ) : (
                                    "Accept Order"
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {/* Ongoing Deliveries Section */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="mb-5">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-500 rounded-full" />
                Ongoing Deliveries
              </h2>
              <p className="text-xs text-gray-500 ml-3 mt-1">
                Active deliveries in progress
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Packages
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-44 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter(
                  (item) =>
                    item.currentStatus !== "Delivered" && item.rider === riderId
                ).length === 0 ? (
                <div className="text-center py-16 bg-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
                    <MdOutlineContentPasteSearch
                      className="text-amber-500"
                      size={32}
                    />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No ongoing deliveries
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Active deliveries will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Packages
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status & Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter(
                        (item) =>
                          item.currentStatus !== "Delivered" &&
                          item.rider === riderId
                      )
                      .slice()
                      .reverse()
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-amber-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {item.userName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                              <GoPackage size={14} />
                              {item?.packs.length} Pack
                              {item.packs.length > 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 items-center flex-wrap">
                              {item.currentStatus === "Pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      UpdateStatus(item._id, "Processing")
                                    }
                                    disabled={updatingStatus === item._id}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                  <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                                    Pending
                                  </span>
                                </>
                              )}
                              {item.currentStatus === "Processing" && (
                                <button
                                  onClick={() =>
                                    UpdateStatus(item._id, "Delivered")
                                  }
                                  disabled={updatingStatus === item._id}
                                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {/* Completed Deliveries Section */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="mb-5">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                Completed Deliveries
              </h2>
              <p className="text-xs text-gray-500 ml-3 mt-1">
                Successfully delivered orders
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter(
                  (item) =>
                    item.currentStatus === "Delivered" && item.rider === riderId
                ).length === 0 ? (
                <div className="text-center py-16 bg-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
                    <IoCheckmark className="text-emerald-500" size={36} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No completed deliveries yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Completed orders will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Delivery Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status & Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter((item) => item.currentStatus === "Delivered")
                      .reverse()
                      .slice(0, 6)
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-emerald-50/20 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {item.userName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 items-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                <IoCheckmark size={14} />
                                Delivered
                              </span>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Success Modal for Order Assignment */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-slideUp">
                {/* Confetti Background Effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div
                    className="absolute top-0 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="absolute top-10 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div
                    className="absolute top-5 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <div
                    className="absolute top-8 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <IoCheckmark className="text-white" size={48} />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-emerald-400 rounded-full animate-ping opacity-20" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order Accepted! 🎉
                  </h2>
                  <p className="text-gray-600 mb-1">
                    You've successfully accepted order
                  </p>
                  <p className="font-mono text-lg font-bold text-emerald-600 bg-emerald-50 inline-block px-4 py-2 rounded-xl mt-2">
                    #{assignedOrderId}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    The order is now assigned to you. Start the delivery when
                    ready!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all whitespace-nowrap"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      // Scroll to ongoing deliveries section
                      window.scrollTo({ top: 600, behavior: "smooth" });
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    View Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedItem && (
            <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <MdClose
                    className="text-gray-500 group-hover:text-gray-700"
                    size={20}
                  />
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Order #{selectedItem._id.slice(0, 10)}
                  </p>
                  {/* Delivery Address for all modals */}
                  {selectedItem?.Address && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="block text-xs font-semibold text-purple-700 mb-1">
                        Delivery Address:
                      </span>
                      <span className="text-sm text-purple-900">
                        {selectedItem.Address}
                      </span>
                    </div>
                  )}
                  {selectedItem?.deliveryNote && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="block text-xs font-semibold text-blue-700 mb-1">
                        Rider Note:
                      </span>
                      <span className="text-sm text-blue-900">
                        {selectedItem.deliveryNote}
                      </span>
                    </div>
                  )}
                  {/* Fallback for generic note field if riderNote is not present */}
                  {!selectedItem?.deliveryNote &&
                    selectedItem?.deliveryNote && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <span className="block text-xs font-semibold text-blue-700 mb-1">
                          Note:
                        </span>
                        <span className="text-sm text-blue-900">
                          {selectedItem.deliveryNote}
                        </span>
                      </div>
                    )}
                </div>

                <div className="space-y-4">
                  {selectedItem?.packs.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100"
                    >
                      <h3 className="text-sm font-bold text-gray-900 mb-2">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-white rounded-lg px-3 py-1.5 font-medium text-gray-600 border border-gray-200">
                          {item.vendorName}
                        </span>
                        {item.accepted === true ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-xs rounded-lg px-3 py-1.5 font-medium border border-emerald-200">
                            <IoCheckmark size={14} />
                            Accepted
                          </span>
                        ) : item.accepted === null ? (
                          <span className="text-amber-700 bg-amber-50 text-xs rounded-lg px-3 py-1.5 font-medium border border-amber-200">
                            Awaiting
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 text-xs rounded-lg px-3 py-1.5 font-medium border border-red-200">
                            <IoClose size={14} />
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Items
                        </p>
                        {item.items.map((pack, packIdx) => (
                          <div
                            key={packIdx}
                            className="flex justify-between items-center text-xs text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
                          >
                            <span>{pack.name}</span>
                            <span className="font-semibold text-gray-900">
                              ×{pack.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accept Order button, only show if order is eligible */}
                {selectedItem?.rider === "Not assigned" &&
                  selectedItem?.packs?.every(
                    (pack) => pack.accepted !== false
                  ) &&
                  selectedItem?.packs?.some(
                    (pack) => pack.accepted === null
                  ) && (
                    <button
                      onClick={() => {
                        // Accept order logic
                        assignRider(selectedItem._id, findRider?._id);
                        setSelectedItem(null);
                      }}
                      className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-800 text-white font-medium hover:from-green-700 hover:to-green-900 transition-all text-[14px] shadow-lg mb-2"
                      disabled={acceptingOrder === selectedItem._id}
                    >
                      {acceptingOrder === selectedItem._id
                        ? "Accepting..."
                        : "Accept Order"}
                    </button>
                  )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
