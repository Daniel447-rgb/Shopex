// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { SEED_PRODUCTS, CATEGORIES } from "../data/seedProducts";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Top Rated"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("Featured");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 300]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (!snap.empty) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setProducts(SEED_PRODUCTS);
        }
      } catch {
        setProducts(SEED_PRODUCTS);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sort) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Top Rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFiltered(result);
  }, [products, activeCategory, search, sort, priceRange]);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink-900 mb-1">
          {activeCategory === "All" ? "All Products" : activeCategory}
        </h1>
        <p className="text-ink-400 text-sm">{filtered.length} items</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* Category */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-400 mb-3">Category</h3>
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategory(cat)}
                      className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${
                        activeCategory === cat
                          ? "bg-ink-900 text-cream"
                          : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-400 mb-3">
                Price: ${priceRange[0]} – ${priceRange[1]}
              </h3>
              <input
                type="range"
                min={0}
                max={300}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-ember-500"
              />
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort Bar */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field flex-1"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field w-auto min-w-[180px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-outline px-3"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-ink-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-display text-2xl text-ink-600 mb-2">No products found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-white w-72 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">Filters</h3>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 mb-3">Category</h4>
                <ul className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => { handleCategory(cat); setSidebarOpen(false); }}
                        className={`w-full text-left text-sm px-2 py-1.5 ${
                          activeCategory === cat ? "bg-ink-900 text-cream" : "text-ink-700 hover:bg-ink-50"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}
