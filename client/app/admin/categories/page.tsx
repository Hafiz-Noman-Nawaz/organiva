'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';

const PRESET_IMAGES: { label: string; url: string }[] = [];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.success && res.categories) {
        const sorted = [...res.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(sorted);
      }
    } catch (e: any) {
      console.error(e);
      setErr(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage(PRESET_IMAGES[0].url);
    setOrder(categories.length);
    setIsActive(true);
    setMsg('');
    setErr('');
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImage(cat.image || PRESET_IMAGES[0].url);
    setOrder(cat.order ?? 0);
    setIsActive(cat.isActive !== false);
    setMsg('');
    setErr('');
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg('');
    setErr('');

    const token = localStorage.getItem('organiva_admin_token') || undefined;

    const payload = {
      name,
      slug,
      description,
      image,
      order: Number(order) || 0,
      isActive,
    };

    try {
      if (editingCategory) {
        const res = await api.put(`/categories/admin/${editingCategory._id}`, payload, token);
        if (res.success) {
          setMsg('Category successfully updated in Atlas database!');
          setTimeout(() => {
            setShowModal(false);
            fetchCategories();
          }, 800);
        }
      } else {
        const res = await api.post('/categories/admin', payload, token);
        if (res.success) {
          setMsg('New category successfully created in Atlas database!');
          setTimeout(() => {
            setShowModal(false);
            fetchCategories();
          }, 800);
        }
      }
    } catch (error: any) {
      setErr(error.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this category?')) return;
    const token = localStorage.getItem('organiva_admin_token') || undefined;
    try {
      await api.delete(`/categories/admin/${id}`, token);
      fetchCategories();
    } catch (error: any) {
      alert(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#171A18] tracking-tight">
              Categories & Spaces CMS
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Atlas DB Live
            </span>
          </div>
          <p className="text-xs text-[#525B54] mt-1">
            Manage store categories, room spaces, and hero folder cards. Changes propagate instantly to the live storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Hero Interactive Folio Explainer Card */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/20 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center shrink-0 mt-0.5">
          <FolderOpen size={18} />
        </div>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#171A18]">Interactive Folio sync:</span>
            <span className="bg-[#5B755D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Order #0, #1, #2
            </span>
          </div>
          <p className="text-[#525B54] leading-relaxed">
            The first 3 active categories (ordered by Display Order) automatically render as the 3 interactive papers inside the Homepage <strong>Hero Folder</strong>. When visitors hover over the folder, these 3 room solutions fan out with full click-through navigation.
          </p>
        </div>
      </div>

      {/* Categories Table / Card List */}
      <div className="bg-white rounded-2xl border border-[#5B755D]/15 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#5B755D]/10 flex items-center justify-between">
          <span className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
            Active Catalog Categories ({categories.length})
          </span>
          <span className="text-[11px] text-[#7F8681]">
            Drag or edit Order to adjust hierarchy
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#7F8681]">Loading categories from MongoDB Atlas...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7F8681]">No categories found in database. Click "Add New Category" to create one.</div>
        ) : (
          <div className="divide-y divide-[#5B755D]/10">
            {categories.map((cat, idx) => {
              const isHeroCard = idx < 3;
              return (
                <div
                  key={cat._id || cat.slug}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isHeroCard ? 'bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/30'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/20 shrink-0">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5B755D]">
                          <Layers size={20} />
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-[#171A18] truncate">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-mono text-[#7F8681] bg-gray-100 px-1.5 py-0.2 rounded">
                          slug: {cat.slug}
                        </span>
                        {isHeroCard && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#5B755D] text-white px-2 py-0.5 rounded-full">
                            <Sparkles size={10} />
                            Hero Paper #{idx + 1}
                          </span>
                        )}
                        {!cat.isActive && (
                          <span className="text-[9px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#525B54] line-clamp-1">
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Order Display */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-[#7F8681] block">Display Order</span>
                      <span className="text-xs font-black text-[#171A18] px-2 py-0.5 rounded bg-white border border-[#5B755D]/20">
                        {cat.order ?? idx}
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-xl bg-white hover:bg-[#EBF1EB] text-[#2E332F] border border-[#5B755D]/20 transition-all cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-all cursor-pointer"
                      title="Archive Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#5B755D]/20 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#5B755D]/10">
              <h2 className="text-lg font-black text-[#171A18]">
                {editingCategory ? 'Edit Space Category' : 'Create New Space Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <Check size={16} />
                <span>{msg}</span>
              </div>
            )}

            {err && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171A18] mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kitchen & Pantry, Closet Systems, Study Desk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#5B755D]/25 focus:border-[#5B755D] focus:outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171A18] mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. kitchen, closet, workspace"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5B755D]/25 focus:border-[#5B755D] focus:outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171A18] mb-1">
                    Display Order (Rank)
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    placeholder="0, 1, 2..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5B755D]/25 focus:border-[#5B755D] focus:outline-none text-xs font-bold"
                  />
                  <span className="text-[10px] text-[#7F8681] mt-0.5 block">
                    Lowest numbers appear in the Hero Folder
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171A18] mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief room description (e.g. Vacuum compression cubes, modular dividers)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#5B755D]/25 focus:border-[#5B755D] focus:outline-none text-xs font-medium"
                />
              </div>

              <div>
                <CloudinaryUploader
                  label="Category Cover Image (Cloudinary Hosted)"
                  value={image}
                  onChange={(url) => setImage(url)}
                  folder="organiva/categories"
                />

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-[#7F8681] block mb-1.5">
                    Or Quick Select Catalog Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`p-1.5 rounded-lg border text-[10px] font-medium text-left truncate transition-all cursor-pointer ${
                          image === preset.url
                            ? 'border-[#5B755D] bg-[#EBF1EB] text-[#1F3524] font-bold'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-[#5B755D] focus:ring-[#5B755D] cursor-pointer"
                />
                <label htmlFor="isActive" className="font-bold text-[#171A18] cursor-pointer">
                  Active (Visible on Storefront and Hero Folio)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#5B755D]/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
