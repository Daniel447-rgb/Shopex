// src/context/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing)
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "UPDATE_QTY":
      return state.map((i) =>
        i.id === action.id ? { ...i, qty: action.qty } : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const stored = JSON.parse(localStorage.getItem("shopex_cart") || "[]");
  const [items, dispatch] = useReducer(cartReducer, stored);

  useEffect(() => {
    localStorage.setItem("shopex_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item) => dispatch({ type: "ADD", item });
  const removeFromCart = (id) => dispatch({ type: "REMOVE", id });
  const updateQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
