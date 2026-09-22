'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Package, Plus, Edit, Star, Check, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortBenefit, setShortBenefit] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionStatement, setSolutionStatement] = useState('');
  const [isHero, setIsHero] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/admin/all', token || undefined),
        api.get('/categories'),
      ]);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories?.length > 0 && !categoryId) {
          setCategoryId(catRes.categories[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setSku(`ORG-${Math.floor(100 + Math.random() * 900)}`);
    setShortBenefit('');
    setImage('/images/products/spintidy-main.webp');
    setPrice('');
    setSalePrice('');
    setCostPrice('');
    setStock('50');
    setDescription('');
    setProblemStatement('');
    setSolutionStatement('');
    setIsHero(false);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSlug(p.slug);
    setSku(p.sku);
    setCategoryId(p.category?._id || p.category);
    setShortBenefit(p.shortBenefit || '');
    setImage(p.images?.[0] || '/images/products/orbitseal-main.webp');
    setPrice(String(p.price));
    setSalePrice(p.salePrice ? String(p.salePrice) : '');
    setCostPrice(p.costPrice ? String(p.costPrice) : '');
    setStock(String(p.stock));
    setDescription(p.description || '');
    setProblemStatement(p.problemStatement || '');
    setSolutionStatement(p.solutionStatement || '');
    setIsHero(p.isHero || false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg('');
    const token = localStorage.getItem('organiva_admin_token');

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: sku.toUpperCase(),
      category: categoryId,
      shortBenefit,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : 0,
      stock: Number(stock),
      description,
      problemStatement,
      solutionStatement,
      isHero,
      images: image ? [image, ...(editingProduct?.images?.slice(1) || [])] : (editingProduct?.images || ['/images/products/orbitseal-main.webp']),
      benefits: editingProduct?.benefits || [
        { number: '01', title: 'EASY TO USE', description: 'Simple everyday operation.' },
        { number: '02', title: 'SAVES TIME', description: 'Saves time and money.' },
      ],
      specifications: editingProduct?.specifications || [
        { key: 'Material', value: 'Durable Matte ABS' },
        { key: 'Warranty', value: 'Organiva 7-Day Replacement' },
      ],
    };

    try {
      if (editingProduct) {
        await api.put(`/products/admin/${editingProduct._id}`, payload, token || undefined);
      } else {
        await api.post('/products/admin', payload, token || undefined);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Error saving product');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">
            Catalog CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-0.5">
            Products & Hero Management
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs shadow-md transition-all cursor-pointer w-fit"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7F8681] border-b border-[#5B755D]/10">
              <tr>
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Selling Price</th>
                <th className="py-3 px-4 font-bold">Cost Price</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold">Hero Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF8F5] border border-gray-100 shrink-0 relative">
                        <Image src={p.images?.[0] || '/images/products/orbitseal-main.webp'} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-[#171A18] block line-clamp-1">{p.title}</span>
                        <span className="text-[11px] text-[#7F8681]">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#525B54]">{p.category?.name || 'General'}</td>
                  <td className="py-3 px-4 font-extrabold text-[#171A18]">
                    PKR {p.salePrice || p.price}
                  </td>
                  <td className="py-3 px-4 text-[#7F8681]">PKR {p.costPrice || 0}</td>
                  <td className="py-3 px-4 font-bold text-[#5B755D]">{p.stock} units</td>
                  <td className="py-3 px-4">
                    {p.isHero ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#1F3524] text-[#8EB892] flex items-center gap-1 w-fit shadow-xs">
                        <Star size={11} fill="currentColor" />
                        <span>ACTIVE HERO</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#7F8681]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF1EB] text-[#5B755D] font-bold text-xs transition-colors border border-[#5B755D]/20 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#5B755D]/20 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#171A18]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            {msg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Sale Price (Optional PKR)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Supplier Cost (Confidential PKR)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Short Benefit / Core Promise *</label>
                  <input
                    type="text"
                    required
                    value={shortBenefit}
                    onChange={(e) => setShortBenefit(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Problem Statement ("Still dealing with...?")</label>
                  <textarea
                    rows={2}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Solution Statement ("There's a simpler way...")</label>
                  <textarea
                    rows={2}
                    value={solutionStatement}
                    onChange={(e) => setSolutionStatement(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <CloudinaryUploader
                    label="Product Display Photo (Upload to Cloudinary)"
                    value={image}
                    onChange={(url) => setImage(url)}
                    folder="organiva/products"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHero}
                      onChange={(e) => setIsHero(e.target.checked)}
                      className="text-[#5B755D] rounded"
                    />
                    <span className="font-bold text-sm text-[#171A18]">
                      Set as Primary Storefront Hero Product
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {formLoading ? 'Saving & Indexing...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
