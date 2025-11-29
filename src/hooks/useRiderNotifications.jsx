import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

/**
 * Rider notification hook - listens for new assignments and order updates
 */
export function useRiderNotifications(riderId) {
  const { socket } = useSocket?.() || {};
  const audioRef = useRef(null);

  useEffect(() => {
    if (!socket || !riderId) return;

    // Create notification sound
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTgjMGHm7A7+OZURE"
      );
    }

    const playNotificationSound = () => {
      try {
        audioRef.current?.play();
      } catch (err) {
        console.log("Could not play notification sound:", err);
      }
    };

    // Listen for order status changes (rider assignment)
    const handleOrderStatus = (updatedOrder) => {
      // Check if this rider was just assigned
      if (
        updatedOrder.rider &&
        String(updatedOrder.rider) === String(riderId) &&
        updatedOrder.currentStatus !== "Delivered"
      ) {
        playNotificationSound();

        const deliveryFee = updatedOrder.deliveryFee || 0;
        const riderShare = deliveryFee * 0.5; // 50% of delivery fee

        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛵</span>
                <div>
                  <p className="font-bold text-gray-900">
                    New Delivery Assignment!
                  </p>
                  <p className="text-sm text-gray-600">
                    Order #{updatedOrder._id?.slice(-6)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Earn: ₦{riderShare.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = "/order";
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                View Details
              </button>
            </div>
          ),
          {
            duration: 10000,
            style: {
              background: "#fff",
              padding: "16px",
            },
          }
        );
      }
    };

    // Listen for vendor pack updates (orders being accepted/ready for pickup)
    const handlePacksUpdated = (updatedOrder) => {
      // Check if all packs are accepted and order is ready for assignment
      const allAccepted = updatedOrder.packs?.every((p) => p.accepted === true);

      if (allAccepted && !updatedOrder.rider) {
        playNotificationSound();

        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-bold text-gray-900">
                    Order Ready for Pickup!
                  </p>
                  <p className="text-sm text-gray-600">
                    Order #{updatedOrder._id?.slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = "/order";
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                View Available Orders
              </button>
            </div>
          ),
          {
            duration: 8000,
            style: {
              background: "#fff",
              padding: "16px",
            },
          }
        );
      }
    };

    // Register socket listeners
    socket.on("orders:status", handleOrderStatus);
    socket.on("vendors:packsUpdated", handlePacksUpdated);

    // Cleanup
    return () => {
      socket.off("orders:status", handleOrderStatus);
      socket.off("vendors:packsUpdated", handlePacksUpdated);
    };
  }, [socket, riderId]);
}
