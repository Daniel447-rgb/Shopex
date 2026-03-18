// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl font-bold text-ink-900">
            Shop<span className="text-ember-500">ex</span>
          </Link>
          <p className="text-ink-400 mt-2 text-sm">Create your account</p>
        </div>

        <div className="bg-white border border-ink-100 p-8 shadow-sm">
          <h2 className="font-display text-2xl text-ink-900 mb-6">Sign Up</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-ink-900 underline hover:text-ember-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
