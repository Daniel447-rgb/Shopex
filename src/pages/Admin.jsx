// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { SEED_PRODUCTS } from "../data/seedProducts";
import {
  Package, ShoppingCart, Users, TrendingUp,
  Plus, Trash2, Edit2, X, Check, Upload
} from "lucide-react";

const EMPTY_PRODUCT = {
  name: "", category: "Fashion", price: "", originalPrice: "",
  description: "", image: "", stock: "", featured: false, rating: 4.5, reviews: 0, tags: [],
};

const CATEGORIES = ["Fashion", "Electronics", "Food", "Home", "Beauty", "Sports"];

export default function Admin() {
  const { userProfile, currentUser } = useAuth();
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  // Redirect non-admins
  if (userProfile && userProfile.role !== "admin") return <Navigate to="/" />;
  if (!currentUser) return <Navigate to="/login" />;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pSnap, oSnap, uSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "users")),
      ]);
      setProducts(pSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setOrders(oSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      setProducts(SEED_PRODUCTS);
    }
    setLoading(false);
  }

  async function seedProducts() {
    setSeeding(true);
    try {
      for (const p of SEED_PRODUCTS) {
        await addDoc(collection(db, "products"), p);
      }
      setSeedDone(true);
      loadData();
    } catch (e) {
      alert("Seed failed: " + e.message);
    }
    setSeeding(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product.id);
    setForm({ ...product });
    setModalOpen(true);
  }

  async function saveProduct() {
    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock),
      tags: typeof form.tags === "string" ? form.tags.split(",").map((t) => t.trim()) : form.tags,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "products", editing), data);
      } else {
        await addDoc(collection(db, "products"), data);
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert("Save failed: " + e.message);
    }
    setSaving(false);
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      loadData();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch {}
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const STATS = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-ember-500" },
    { label: "Products", value: products.length, icon: Package, color: "text-blue-500" },
    { label: "Orders", value: orders.length, icon: ShoppingCart, color: "text-green-500" },
    { label: "Customers", value: users.length, icon: Users, color: "text-purple-500" },
  ];

  const STATUS_COLORS = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-900">Admin Dashboard</h1>
          <p className="text-ink-400 text-sm mt-1">Manage your store</p>
        </div>
        {tab === "products" && (
          <div className="flex gap-3">
            {!seedDone && (
              <button
                onClick={seedProducts}
                disabled={seeding}
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <Upload size={16} />
                {seeding ? "Seeding…" : "Seed Sample Data"}
              </button>
            )}
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Product
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-100 mb-8">
        {["overview", "products", "orders", "customers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-ink-900 text-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-400">Loading…</div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {STATS.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white border border-ink-100 p-6">
                    <div className={`mb-3 ${color}`}>
                      <Icon size={24} />
                    </div>
                    <p className="font-mono text-2xl font-medium text-ink-900">{value}</p>
                    <p className="text-xs text-ink-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-ink-100 p-6">
                <h2 className="font-display text-xl mb-4">Recent Orders</h2>
                {orders.slice(0, 5).length === 0 ? (
                  <p className="text-ink-400 text-sm">No orders yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-ink-400 text-xs font-mono uppercase">
                        <th className="text-left pb-2">Order</th>
                        <th className="text-left pb-2">Customer</th>
                        <th className="text-left pb-2">Total</th>
                        <th className="text-left pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id}>
                          <td className="py-2.5 font-mono text-xs text-ink-400">#{o.id.slice(0, 8)}</td>
                          <td className="py-2.5 text-ink-700">{o.userEmail}</td>
                          <td className="py-2.5 font-mono">${o.total?.toFixed(2)}</td>
                          <td className="py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || "bg-ink-100 text-ink-600"}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {tab === "products" && (
            <div className="bg-white border border-ink-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-ink-400 text-xs font-mono uppercase">
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4 hidden md:table-cell">Category</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4 hidden sm:table-cell">Stock</th>
                    <th className="text-left p-4 hidden lg:table-cell">Featured</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-ink-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover bg-ink-100 flex-shrink-0" />
                          <span className="font-medium text-ink-900 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-ink-500">{p.category}</td>
                      <td className="p-4 font-mono text-ink-900">${parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`text-xs font-mono ${p.stock < 10 ? "text-red-500" : "text-green-600"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {p.featured ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-ink-300" />}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-16 text-ink-400">
                  <Package size={48} className="mx-auto mb-3 text-ink-200" />
                  <p>No products yet. Add one or seed sample data.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Orders ── */}
          {tab === "orders" && (
            <div className="bg-white border border-ink-100">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-ink-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 text-ink-200" />
                  <p>No orders yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-ink-400 text-xs font-mono uppercase">
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4 hidden md:table-cell">Customer</th>
                      <th className="text-left p-4 hidden sm:table-cell">Items</th>
                      <th className="text-left p-4">Total</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-ink-50">
                        <td className="p-4 font-mono text-xs text-ink-400">#{o.id.slice(0, 8)}</td>
                        <td className="p-4 hidden md:table-cell text-ink-700">{o.userEmail}</td>
                        <td className="p-4 hidden sm:table-cell text-ink-500">{o.items?.length || 0} items</td>
                        <td className="p-4 font-mono text-ink-900">${o.total?.toFixed(2)}</td>
                        <td className="p-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${STATUS_COLORS[o.status] || "bg-ink-100"}`}
                          >
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Customers ── */}
          {tab === "customers" && (
            <div className="bg-white border border-ink-100">
              {users.length === 0 ? (
                <div className="text-center py-16 text-ink-400">
                  <Users size={48} className="mx-auto mb-3 text-ink-200" />
                  <p>No registered users yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-ink-400 text-xs font-mono uppercase">
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4 hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-ink-50">
                        <td className="p-4 font-medium text-ink-900">{u.name}</td>
                        <td className="p-4 text-ink-500">{u.email}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.role === "admin" ? "bg-ember-100 text-ember-700" : "bg-ink-100 text-ink-600"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell text-ink-400 text-xs font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Product Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-ink-100">
              <h2 className="font-display text-xl">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-900">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Product Name", key: "name", type: "text" },
                { label: "Price ($)", key: "price", type: "number" },
                { label: "Original Price ($)", key: "originalPrice", type: "number" },
                { label: "Stock Quantity", key: "stock", type: "number" },
                { label: "Image URL", key: "image", type: "url" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input-field"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input-field"
                  placeholder="e.g. wool, winter, sweater"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-ember-500"
                />
                <span className="text-sm text-ink-700">Featured product</span>
              </label>

              {form.image && (
                <img src={form.image} alt="preview" className="w-full h-40 object-cover bg-ink-100" />
              )}
            </div>
            <div className="p-6 border-t border-ink-100 flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
              <button onClick={saveProduct} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
