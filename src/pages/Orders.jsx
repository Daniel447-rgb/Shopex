// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!currentUser) return <Navigate to="/login" />;

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [currentUser]);

  if (loading) return <div className="text-center py-24 text-ink-400">Loading orders…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-ink-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={64} className="mx-auto text-ink-200 mb-4" />
          <p className="font-display text-2xl text-ink-600 mb-2">No orders yet</p>
          <p className="text-ink-400 mb-6">Your order history will appear here.</p>
          <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-ink-100 p-6">
              {/* Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-ink-50">
                <div>
                  <p className="text-xs font-mono text-ink-400 mb-0.5">Order ID</p>
                  <p className="font-mono text-sm text-ink-700">#{order.id.slice(0, 16)}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-ink-400 mb-0.5">Date</p>
                  <p className="text-sm text-ink-700">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-ink-400 mb-0.5">Total</p>
                  <p className="font-mono font-medium text-ink-900">${order.total?.toFixed(2)}</p>
                </div>
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-ink-100 text-ink-600"}`}>
                    {order.status || "pending"}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover bg-ink-50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-ink-400 mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <p className="font-mono text-sm text-ink-700 flex-shrink-0">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
