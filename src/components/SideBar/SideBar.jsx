import React from "react";
import { GrAppsRounded } from "react-icons/gr";
import { LuNewspaper } from "react-icons/lu";
import { GrHistory } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
const SideBar = ({ setOpenNav }) => {
  const pathToItem = {
    "/": "home",
    "/order": "order",
    "/history": "history",
  };
  const selectedItem = pathToItem[location.pathname] || "home";
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white/90 backdrop-blur-sm shadow-sm w-full overflow-y-auto border-r border-gray-100">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <img
          src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
          alt="logo"
          className="w-[140px] hover:opacity-90 transition-opacity"
        />

        {/* Close only visible on mobile */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpenNav?.(false)}
          aria-label="Close sidebar"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>

      <div className="mt-3">
        <div
          onClick={() => {
            navigate("/");
          }}
          className={`flex items-center gap-3 h-11 cursor-pointer w-full px-4 ${
            selectedItem === "home"
              ? "bg-red-50/60 border-r-4 border-[var(--default)] text-[var(--default)]"
              : "bg-transparent"
          } `}
        >
          <GrAppsRounded />
          <div className="text-[13px] font-medium">Overview</div>
        </div>

        <div
          onClick={() => {
            navigate("/order");
          }}
          className={`flex items-center gap-3 h-11 cursor-pointer w-full px-4 ${
            selectedItem === "order"
              ? "bg-red-50/60 border-r-4 border-[var(--default)] text-[var(--default)]"
              : "bg-transparent"
          } `}
        >
          <LuNewspaper />
          <div className="text-[13px] font-medium">Orders</div>
        </div>
        <div
          onClick={() => {
            navigate("/history");
          }}
          className={`flex items-center gap-3 h-11 cursor-pointer w-full px-4 ${
            selectedItem === "history"
              ? "bg-red-50/60 border-r-4 border-[var(--default)] text-[var(--default)]"
              : "bg-transparent"
          } `}
        >
          <GrHistory />
          <div className="text-[13px] font-medium">History</div>
        </div>
        <div
          onClick={() => {
            localStorage.clear();
            window.location.replace("/");
          }}
          className="absolute bottom-0 flex justify-center text-red-500 bg-[#f6f6f6] hover:bg-[#f1f1f1] items-center gap-2 h-11 cursor-pointer w-full px-4"
        >
          <CiLogout />
          <div className="text-[13px]">Sign Out</div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
