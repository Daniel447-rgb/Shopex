// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    navigate("/");
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 bg-cream border-b border-ink-100 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold text-ink-900 tracking-tight">
          Shop<span className="text-ember-500">ex</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/products" className="text-sm font-body text-ink-600 hover:text-ink-900 transition-colors">
            Shop
          </Link>
          <Link to="/products?category=Fashion" className="text-sm font-body text-ink-600 hover:text-ink-900 transition-colors">
            Fashion
          </Link>
          <Link to="/products?category=Electronics" className="text-sm font-body text-ink-600 hover:text-ink-900 transition-colors">
            Electronics
          </Link>
          <Link to="/products?category=Home" className="text-sm font-body text-ink-600 hover:text-ink-900 transition-colors">
            Home
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => navigate("/products")}
            className="p-2 text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-ink-500 hover:text-ink-900 transition-colors">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0 -right-0 bg-ember-500 text-white text-xs font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-1 p-2 text-ink-500 hover:text-ink-900 transition-colors"
            >
              <User size={20} />
              {currentUser && <ChevronDown size={14} />}
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-ink-100 shadow-xl py-2 z-50">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 border-b border-ink-100">
                      <p className="text-xs text-ink-400 font-body">Signed in as</p>
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {currentUser.displayName || currentUser.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserOpen(false)}
                        className="block px-4 py-2 text-sm text-ember-600 hover:bg-ink-50 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setUserOpen(false)}
                      className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-ink-500 hover:text-ink-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-cream px-4 py-4 flex flex-col gap-4">
          {["Shop All", "Fashion", "Electronics", "Home", "Beauty"].map((label) => (
            <Link
              key={label}
              to={label === "Shop All" ? "/products" : `/products?category=${label}`}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-body text-ink-700 hover:text-ink-900"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
