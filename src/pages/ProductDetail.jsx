// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Minus, Plus, ShoppingBag, ArrowLeft, Truck, Shield } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { SEED_PRODUCTS } from "../data/seedProducts";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() };
          setProduct(p);
          setRelated(SEED_PRODUCTS.filter((s) => s.category === p.category && s.id !== id).slice(0, 4));
        } else {
          const found = SEED_PRODUCTS.find((p) => p.id === id);
          setProduct(found || null);
          if (found) setRelated(SEED_PRODUCTS.filter((s) => s.category === found.category && s.id !== id).slice(0, 4));
        }
      } catch {
        const found = SEED_PRODUCTS.find((p) => p.id === id);
        setProduct(found || null);
        if (found) setRelated(SEED_PRODUCTS.filter((s) => s.category === found.category && s.id !== id).slice(0, 4));
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-ink-400">Product not found.</p>
        <Link to="/products" className="btn-primary inline-block mt-4">Back to Shop</Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-ink-400 mb-8">
        <Link to="/" className="hover:text-ink-900">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-ink-900">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-ink-900">{product.category}</Link>
        <span>/</span>
        <span className="text-ink-700">{product.name}</span>
      </div>

      {/* Main */}
      <div className="grid md:grid-cols-2 gap-16 mb-20">
        {/* Image */}
        <div className="aspect-square bg-ink-50 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-xs font-mono text-ember-500 uppercase tracking-widest mb-3">
            {product.category}
          </span>
          <h1 className="font-display text-4xl text-ink-900 mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
              ))}
            </div>
            <span className="text-sm text-ink-500 font-mono">{product.rating} ({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-4xl text-ink-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-ink-400 line-through font-mono text-lg">${product.originalPrice}</span>
                <span className="bg-ember-500 text-white text-xs font-mono px-2 py-0.5">−{discount}%</span>
              </>
            )}
          </div>

          <p className="text-ink-500 leading-relaxed mb-8">{product.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {product.tags?.map((tag) => (
              <span key={tag} className="text-xs font-mono border border-ink-200 px-3 py-1 text-ink-500">
                #{tag}
              </span>
            ))}
          </div>

          {/* Quantity + Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-ink-200">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-ink-50 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-mono text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-3 hover:bg-ink-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium text-sm transition-all duration-200 ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-ink-900 text-cream hover:bg-ember-500"
              }`}
            >
              <ShoppingBag size={18} />
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>

          {/* Stock indicator */}
          <p className="text-sm text-ink-400 mb-8">
            {product.stock > 20 ? (
              <span className="text-green-600">✓ In stock</span>
            ) : (
              <span className="text-ember-600">Only {product.stock} left</span>
            )}
          </p>

          {/* Perks */}
          <div className="border-t border-ink-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <Truck size={16} /> Free delivery on orders over $50
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <Shield size={16} /> 30-day returns, no questions asked
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-3xl mb-8">More in {product.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
