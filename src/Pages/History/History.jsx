import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import SideBar from "../../components/SideBar/SideBar";
import { IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import { CiMoneyCheck1 } from "react-icons/ci";
import { FiSearch, FiDownload } from "react-icons/fi";
import "../Orders/Orders.css";

const History = () => {
  const [openNav, setOpenNav] = useState(false);
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setaddLoading] = useState(false);
  const [allRider, setAllRiders] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  const findRider = allRider?.find((item) => item._id === riderId);
  // Fetch all withdrawals on mount
  useEffect(() => {
    fetchUsers();

    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/riders/withdraw`
      );
      setWithdrawals(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) {
      return toast.error("Enter an amount");
    } else if (findRider?.availableBal < amount) {
      toast.error("insufficient Funds");
    } else {
      try {
        setaddLoading(true);
        const { data } = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API}/api/riders/withdraw`,
          {
            riderId: findRider?._id, // replace with actual rider id from auth context
            riderName: findRider?.userName, // replace with actual rider name
            amount: Number(amount),
          }
        );
        setWithdrawals([data, ...withdrawals]);
        setModal(false);
        setAmount("");
        fetchWithdrawals();
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("Error creating withdrawal");
      } finally {
        setaddLoading(false);
      }
    }
  };

  const filteredWithdrawals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withdrawals.filter((w) => {
      const statusLabel =
        w.status === true
          ? "Completed"
          : w.status === false
          ? "Rejected"
          : "Pending";
      const matchStatus =
        statusFilter === "All" || statusLabel === statusFilter;
      if (!q) return matchStatus;
      const dateStr = w.date
        ? new Date(w.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      const amountStr = (w.amount || 0).toString();
      return (
        matchStatus &&
        (dateStr.toLowerCase().includes(q) ||
          amountStr.includes(q) ||
          statusLabel.toLowerCase().includes(q))
      );
    });
  }, [withdrawals, query, statusFilter]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Amount", "Status"],
      ...filteredWithdrawals.map((w) => [
        w.date
          ? new Date(w.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
        w.amount || 0,
        w.status === true
          ? "Completed"
          : w.status === false
          ? "Rejected"
          : "Pending",
      ]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `withdrawals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {openNav && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300 ${
          openNav ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-[270px] md:w-[240px]`}
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
                  Withdrawal History
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your earnings and withdrawals
                </p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-6 shadow-2xl shadow-purple-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
                      <CiMoneyCheck1 size={28} className="text-white" />
                    </div>
                    <p className="text-purple-100 text-sm font-medium mb-2">
                      Available Balance
                    </p>
                    <p className="text-4xl font-bold text-white mb-6">
                      ₦{findRider?.availableBal?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModal(true)}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-purple-600 font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Request Withdrawal
                </button>
              </div>
            </div>
          </div>

          {/* Withdrawal History Section */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <div>
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  Transaction History
                </h2>
                <p className="text-xs text-gray-500 ml-3 mt-1">
                  View and manage all your withdrawal requests
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by date, amount..."
                    className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all w-56"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all font-medium"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Rejected</option>
                </select>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  <FiDownload size={16} /> Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-7 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse" />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : filteredWithdrawals.length > 0 ? (
                    filteredWithdrawals.map((w) => (
                      <tr
                        key={w._id}
                        className="hover:bg-purple-50/20 transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {new Date(w.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900">
                            ₦{w.amount ? w.amount.toLocaleString() : "0"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              w.status === true
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : w.status === false
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {w.status === true
                              ? "✓ Completed"
                              : w.status === false
                              ? "✕ Rejected"
                              : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-16 text-center bg-white"
                      >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-4">
                          <CiMoneyCheck1
                            className="text-purple-500"
                            size={32}
                          />
                        </div>
                        <p className="text-gray-600 font-medium">
                          No withdrawals yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Your withdrawal history will appear here
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdraw modal */}
          {modal && (
            <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp">
                <button
                  onClick={() => setModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <MdClose
                    className="text-gray-500 group-hover:text-gray-700"
                    size={20}
                  />
                </button>

                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                    <CiMoneyCheck1 className="text-purple-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Request Withdrawal
                  </h2>
                  <p className="text-sm text-gray-500">
                    Available balance: ₦
                    {findRider?.availableBal?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the amount you wish to withdraw
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={addLoading}
                    onClick={handleWithdraw}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      addLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/30 hover:shadow-xl"
                    }`}
                  >
                    {addLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm Withdrawal"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
