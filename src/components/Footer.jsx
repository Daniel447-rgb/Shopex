// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-display text-3xl text-cream mb-3">
            Shop<span className="text-ember-400">ex</span>
          </p>
          <p className="text-sm leading-relaxed max-w-xs text-ink-400">
            A curated marketplace for quality goods across fashion, tech, home, and more.
            Every product, thoughtfully selected.
          </p>
        </div>
        <div>
          <h4 className="text-cream text-xs font-mono uppercase tracking-widest mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            {["All Products", "Fashion", "Electronics", "Home & Living", "Beauty"].map((l) => (
              <li key={l}>
                <Link to="/products" className="hover:text-cream transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-cream text-xs font-mono uppercase tracking-widest mb-4">Info</h4>
          <ul className="space-y-2 text-sm">
            {["About Us", "Contact", "Shipping Policy", "Returns", "Privacy Policy"].map((l) => (
              <li key={l}><a href="#" className="hover:text-cream transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} Shopex. Built with React + Firebase.
      </div>
    </footer>
  );
}
