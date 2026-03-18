// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white border border-ink-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square bg-ink-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-ember-500 text-white text-xs font-mono px-2 py-1">
            −{discount}%
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white text-ink-500 text-xs font-body px-2 py-1 border border-ink-100">
          {product.category}
        </span>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-base text-ink-900 leading-snug mb-1 hover:text-ember-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}
              />
            ))}
          </div>
          <span className="text-xs text-ink-400 font-mono">({product.reviews})</span>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono font-medium text-ink-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-xs text-ink-400 line-through font-mono">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="p-2 bg-ink-900 text-cream hover:bg-ember-500 transition-colors"
            title="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
