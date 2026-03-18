// src/pages/Cart.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { items, removeFromCart, updateQty, clearCart, total, count } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = total > 50 ? 0 : 5.99;
  const discountAmt = total * discount;
  const finalTotal = total - discountAmt + shipping;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "WELCOME20") {
      setDiscount(0.2);
      setCouponMsg("20% discount applied!");
    } else {
      setDiscount(0);
      setCouponMsg("Invalid coupon code.");
    }
  };

  const placeOrder = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setCheckingOut(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        subtotal: total,
        discount: discountAmt,
        shipping,
        total: finalTotal,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      alert("Failed to place order. Please try again.");
    }
    setCheckingOut(false);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-4xl text-ink-900 mb-3">Order Placed!</h1>
        <p className="text-ink-500 mb-8">
          Thanks for your order! We'll send a confirmation email to {currentUser?.email}.
        </p>
        <Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-ink-200 mb-6" />
        <h1 className="font-display text-3xl text-ink-900 mb-3">Your cart is empty</h1>
        <p className="text-ink-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-ink-900 mb-8">
        Cart <span className="text-ink-300 font-normal">({count} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 bg-white border border-ink-100 p-4">
              <Link to={`/products/${item.id}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover bg-ink-50 flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.id}`}>
                  <h3 className="font-display text-lg text-ink-900 hover:text-ember-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-xs text-ink-400 mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-ink-200">
                    <button onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeFromCart(item.id)} className="p-2 hover:bg-ink-50">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-mono text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2 hover:bg-ink-50">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium text-ink-900">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-ink-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-ink-100 p-6 h-fit space-y-4">
          <h2 className="font-display text-2xl text-ink-900 mb-2">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon (WELCOME20)</span>
                <span className="font-mono">−${discountAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-600">
              <span>Shipping</span>
              <span className="font-mono">
                {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-ink-100 pt-3 flex justify-between text-ink-900 font-medium">
              <span>Total</span>
              <span className="font-mono text-lg">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="input-field pl-8 text-sm py-2"
                />
              </div>
              <button onClick={applyCoupon} className="btn-outline px-4 py-2 text-xs">Apply</button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-1 ${discount > 0 ? "text-green-600" : "text-red-500"}`}>
                {couponMsg}
              </p>
            )}
            <p className="text-xs text-ink-400 mt-1">Try: WELCOME20</p>
          </div>

          {shipping > 0 && (
            <p className="text-xs text-ink-400 bg-ink-50 p-3">
              Add ${(50 - total).toFixed(2)} more for free shipping!
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={checkingOut}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {checkingOut ? "Placing Order…" : (
              <>Place Order <ArrowRight size={16} /></>
            )}
          </button>

          {!currentUser && (
            <p className="text-xs text-center text-ink-400">
              <Link to="/login" className="underline hover:text-ink-700">Sign in</Link> to place your order
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
