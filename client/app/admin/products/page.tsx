'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Star,
  Check,
  Sparkles,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  TrendingUp,
  Boxes,
  AlertTriangle,
  X,
  UploadCloud,
  ImageIcon,
  ShieldAlert,
  Loader2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';

interface BenefitItem {
  number: string;
  title: string;
  description: string;
}

interface SpecItem {
  key: string;
  value: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Purge Demo Modal
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortBenefit, setShortBenefit] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionStatement, setSolutionStatement] = useState('');
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Multi-image gallery state
  const [images, setImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Benefits & Specs builders
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [specifications, setSpecifications] = useState<SpecItem[]>([]);

  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    } catch (e: any) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from title if not manually modified
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManual) {
      setSlug(newTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const generateRandomSku = () => {
    const num = Math.floor(100 + Math.random() * 900);
    setSku(`ORG-${num}`);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setIsSlugManual(false);
    generateRandomSku();
    setCategoryId(categories[0]?._id || '');
    setShortBenefit('');
    setPrice('');
    setSalePrice('');
    setCostPrice('');
    setStock('50');
    setDescription('');
    setProblemStatement('');
    setSolutionStatement('');
    setIsHero(false);
    setIsFeatured(true);
    setIsActive(true);
    setImages([]);
    setManualImageUrl('');
    setBenefits([
      { number: '01', title: 'INSTANT TRANSFORMATION', description: 'Eliminates clutter in seconds and saves daily routine time.' },
      { number: '02', title: 'PREMIUM DURABILITY', description: 'Engineered with high-grade, resilient materials for lasting quality.' },
      { number: '03', title: 'TOOL-FREE SETUP', description: 'Zero drilling, installs cleanly with non-marking mounts or magnets.' },
    ]);
    setSpecifications([
      { key: 'Material', value: 'High-Density Matte ABS / Solid Hardware' },
      { key: 'Warranty', value: 'Organiva 7-Day Replacement Guarantee' },
      { key: 'Nationwide Delivery', value: '2-4 Business Days via Cash on Delivery' },
    ]);
    setMsg(null);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title || '');
    setSlug(p.slug || '');
    setIsSlugManual(true);
    setSku(p.sku || '');
    setCategoryId(p.category?._id || p.category || categories[0]?._id || '');
    setShortBenefit(p.shortBenefit || '');
    setPrice(p.price ? String(p.price) : '');
    setSalePrice(p.salePrice ? String(p.salePrice) : '');
    setCostPrice(p.costPrice ? String(p.costPrice) : '');
    setStock(p.stock !== undefined ? String(p.stock) : '50');
    setDescription(p.description || '');
    setProblemStatement(p.problemStatement || '');
    setSolutionStatement(p.solutionStatement || '');
    setIsHero(Boolean(p.isHero));
    setIsFeatured(p.isFeatured !== false);
    setIsActive(p.isActive !== false);
    setImages(p.images && p.images.length > 0 ? [...p.images] : []);
    setManualImageUrl('');
    setBenefits(
      p.benefits && p.benefits.length > 0
        ? p.benefits
        : [
            { number: '01', title: 'INSTANT TRANSFORMATION', description: 'Eliminates clutter in seconds.' },
            { number: '02', title: 'PREMIUM QUALITY', description: 'Engineered for long-term daily performance.' },
          ]
    );
    setSpecifications(
      p.specifications && p.specifications.length > 0
        ? p.specifications
        : [{ key: 'Material', value: 'High-Density Matte ABS' }, { key: 'Warranty', value: 'Organiva 7-Day Replacement Guarantee' }]
    );
    setMsg(null);
    setShowModal(true);
  };

  // Image Gallery Handlers
  const handleAddUploadedImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleAddManualImage = () => {
    if (manualImageUrl.trim() && !images.includes(manualImageUrl.trim())) {
      setImages((prev) => [...prev, manualImageUrl.trim()]);
      setManualImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // Benefits Builder Handlers
  const handleBenefitChange = (index: number, field: keyof BenefitItem, val: string) => {
    setBenefits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddBenefit = () => {
    const nextNum = String(benefits.length + 1).padStart(2, '0');
    setBenefits((prev) => [...prev, { number: nextNum, title: '', description: '' }]);
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  // Specs Builder Handlers
  const handleSpecChange = (index: number, field: keyof SpecItem, val: string) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Product (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg(null);
    const token = localStorage.getItem('organiva_admin_token');

    // Clean valid benefits and specs
    const cleanBenefits = benefits.filter((b) => b.title.trim() && b.description.trim());
    const cleanSpecs = specifications.filter((s) => s.key.trim() && s.value.trim());

    const finalImages = images.length > 0 ? images : ['/images/products/orbitseal-main.webp'];

    const payload = {
      title: title.trim(),
      slug: (slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      sku: sku.trim().toUpperCase(),
      category: categoryId,
      shortBenefit: shortBenefit.trim(),
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : 0,
      stock: Number(stock),
      description: description.trim(),
      problemStatement: problemStatement.trim(),
      solutionStatement: solutionStatement.trim(),
      isHero,
      isFeatured,
      isActive,
      images: finalImages,
      benefits: cleanBenefits,
      specifications: cleanSpecs,
    };

    try {
      if (editingProduct) {
        await api.put(`/products/admin/${editingProduct._id}`, payload, token || undefined);
        setMsg({ text: 'Product updated successfully & re-indexed into Knowledge Base.', type: 'success' });
      } else {
        await api.post('/products/admin', payload, token || undefined);
        setMsg({ text: 'Product created successfully & published.', type: 'success' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchData();
      }, 700);
    } catch (err: any) {
      setMsg({ text: err.message || 'Error saving product', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Single Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.delete(`/products/admin/${productToDelete._id}`, token || undefined);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
        setProductToDelete(null);
      } else {
        alert(res.message || 'Failed to delete product');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Purge All Demo Products
  const handlePurgeDemoProducts = async () => {
    setPurgeLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.post('/products/admin/purge-samples', {}, token || undefined);
      if (res.success) {
        setShowPurgeModal(false);
        fetchData();
      } else {
        alert(res.message || 'Failed to purge demo products');
      }
    } catch (e: any) {
      alert(e.message || 'Error purging demo products');
    } finally {
      setPurgeLoading(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.shortBenefit?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryFilter !== 'all') {
      list = list.filter((p) => {
        const catId = p.category?._id || p.category;
        const catSlug = p.category?.slug;
        return catId === selectedCategoryFilter || catSlug === selectedCategoryFilter;
      });
    }

    return list;
  }, [products, searchQuery, selectedCategoryFilter]);

  // Calculations for Margin Preview in Form
  const sellingPriceNum = Number(salePrice) || Number(price) || 0;
  const costPriceNum = Number(costPrice) || 0;
  const profitNum = sellingPriceNum - costPriceNum;
  const marginPercent = sellingPriceNum > 0 ? Math.round((profitNum / sellingPriceNum) * 100) : 0;
  const discountPercent =
    Number(price) > 0 && Number(salePrice) > 0 && Number(salePrice) < Number(price)
      ? Math.round(((Number(price) - Number(salePrice)) / Number(price)) * 100)
      : 0;

  // KPI Metrics
  const totalUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const heroProduct = products.find((p) => p.isHero);
  const lowStockCount = products.filter((p) => Number(p.stock) < 10).length;

  return (
    <div className="space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">Catalog CMS</span>
            <span className="text-[10px] bg-[#EBF1EB] text-[#435845] font-extrabold px-2 py-0.5 rounded-full border border-[#5B755D]/20">
              Live Storefront Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-0.5">
            Products & Hero Management
          </h1>
          <p className="text-xs text-[#525B54] mt-0.5">
            Manage real storefront products, upload high-res imagery, manage stock, and customize DTC copy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowPurgeModal(true)}
            title="Clear initial demo products in 1 click"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear Demo Products</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#5B755D]/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7F8681] font-semibold">Total Products</span>
            <Package size={16} className="text-[#5B755D]" />
          </div>
          <div className="text-2xl font-black text-[#171A18] mt-1">{products.length}</div>
          <span className="text-[11px] text-[#525B54]">Active in store</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#5B755D]/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7F8681] font-semibold">Primary Storefront Hero</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-sm font-extrabold text-[#171A18] mt-1.5 truncate line-clamp-1">
            {heroProduct ? heroProduct.title : 'None Selected'}
          </div>
          <span className="text-[11px] text-[#5B755D] font-bold">
            {heroProduct ? `SKU: ${heroProduct.sku}` : 'Assign a hero product below'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#5B755D]/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7F8681] font-semibold">Total Stock Inventory</span>
            <Boxes size={16} className="text-[#5B755D]" />
          </div>
          <div className="text-2xl font-black text-[#171A18] mt-1">{totalUnits} units</div>
          <span className="text-[11px] text-[#525B54]">Ready for COD fulfillment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#5B755D]/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7F8681] font-semibold">Low Stock Alert</span>
            <AlertTriangle size={16} className={lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'} />
          </div>
          <div className="text-2xl font-black text-[#171A18] mt-1">{lowStockCount} items</div>
          <span className="text-[11px] text-[#7F8681]">{lowStockCount > 0 ? 'Stock under 10 units' : 'Inventory healthy'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#5B755D]/15 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, SKU, or tagline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-xl focus:outline-none focus:border-[#5B755D]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#7F8681]">
            <SlidersHorizontal size={14} />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs font-bold text-[#171A18] bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
                <th className="py-3 px-4 font-bold">Supplier Cost</th>
                <th className="py-3 px-4 font-bold">Profit Margin</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold">Hero Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#5B755D] mb-2" />
                    <span>Loading live catalog from MongoDB...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <Package size={36} className="mx-auto text-gray-300 mb-2.5" />
                    <h4 className="text-sm font-bold text-[#171A18]">No products found</h4>
                    <p className="text-xs text-[#7F8681] mt-0.5 max-w-sm mx-auto">
                      {searchQuery
                        ? 'No products match your search query. Try clearing the search filter.'
                        : 'Your catalog is ready for real products! Click "Add New Product" to list your first item.'}
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-4 px-4 py-2 bg-[#5B755D] text-white text-xs font-bold rounded-xl hover:bg-[#435845] transition-all cursor-pointer"
                    >
                      + Add New Product
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const sell = p.salePrice || p.price || 0;
                  const cost = p.costPrice || 0;
                  const profit = sell - cost;
                  const margin = sell > 0 ? Math.round((profit / sell) * 100) : 0;
                  const isLow = Number(p.stock) < 10;
                  const isOut = Number(p.stock) <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF8F5] border border-gray-100 shrink-0 relative shadow-2xs">
                            <Image
                              src={p.images?.[0] || '/images/products/orbitseal-main.webp'}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                            {p.images?.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[8px] font-bold px-1 rounded-tl-sm">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#171A18] line-clamp-1">{p.title}</span>
                              {p.isActive === false && (
                                <span className="text-[9px] font-extrabold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  DRAFT
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#7F8681]">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#525B54] font-medium">{p.category?.name || 'General'}</td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#171A18]">PKR {sell.toLocaleString()}</div>
                        {p.salePrice && p.price && p.salePrice < p.price && (
                          <div className="text-[10px] text-gray-400 line-through">PKR {p.price.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#7F8681]">PKR {cost.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <TrendingUp size={11} />
                          <span>+{margin}%</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold inline-flex items-center gap-1 ${
                            isOut
                              ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'
                              : isLow
                              ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full'
                              : 'text-[#5B755D]'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.isHero ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#1F3524] text-[#8EB892] flex items-center gap-1 w-fit shadow-2xs">
                            <Star size={11} fill="currentColor" />
                            <span>ACTIVE HERO</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#7F8681]">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on Storefront Link */}
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            title="Preview on Storefront"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B755D] hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={14} />
                          </Link>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF1EB] text-[#5B755D] font-bold text-xs transition-colors border border-[#5B755D]/20 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setProductToDelete(p)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171A18]">Delete Product?</h3>
                <span className="text-xs text-red-600 font-semibold">This action is permanent and cannot be undone</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-white shrink-0 border border-gray-200">
                <Image
                  src={productToDelete.images?.[0] || '/images/products/orbitseal-main.webp'}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-[#171A18] truncate">{productToDelete.title}</h4>
                <div className="text-[11px] text-[#7F8681]">SKU: {productToDelete.sku}</div>
                <div className="text-[11px] font-bold text-[#5B755D]">
                  PKR {(productToDelete.salePrice || productToDelete.price || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#525B54] leading-relaxed">
              Deleting this product will permanently erase it from the database, remove all its verified reviews, clean up its inventory logs, and de-index it from the Orgi AI Concierge.
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Demo Products Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#171A18]">Purge All Demo Products?</h3>
                <span className="text-xs text-[#7F8681]">Start fresh with a 100% clean catalog</span>
              </div>
            </div>

            <p className="text-xs text-[#525B54] leading-relaxed">
              This will permanently delete the 8 sample demo items (OrbitSeal, SpinTidy, SpaceVault, MagDock, CleanPress, AeroGlow, AutoGrip, CableGrid) so that only the real products you upload remain.
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={purgeLoading}
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeLoading}
                onClick={handlePurgeDemoProducts}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {purgeLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Purging Demo Products...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm & Purge All Demo Items</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#5B755D]/20 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B755D]">
                  {editingProduct ? 'Update Storefront Item' : 'New Catalog Listing'}
                </span>
                <h3 className="text-lg font-bold text-[#171A18]">
                  {editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Product'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {msg && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2 border-b pb-1.5">
                  <Package size={16} className="text-[#5B755D]" />
                  <span>1. Product Core Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organiva 360° Rotating Spice Turntable"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Slug / URL Handle *</label>
                      <button
                        type="button"
                        onClick={() => setIsSlugManual(!isSlugManual)}
                        className="text-[10px] text-[#5B755D] hover:underline"
                      >
                        {isSlugManual ? 'Lock (auto-sync)' : 'Customize'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setIsSlugManual(true);
                        setSlug(e.target.value);
                      }}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-700 focus:border-[#5B755D] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#7F8681] mt-0.5 block">
                      Live URL: /products/{slug || 'product-handle'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Stock Keeping Unit (SKU) *</label>
                      <button
                        type="button"
                        onClick={generateRandomSku}
                        className="text-[10px] text-[#5B755D] hover:underline flex items-center gap-0.5"
                      >
                        <RefreshCw size={10} />
                        <span>Generate</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs uppercase font-mono font-bold focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Category / Space *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:border-[#5B755D] focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Short Benefit / Core Tagline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brings hidden bottles and spices forward with 360° ball-bearing glide."
                      value={shortBenefit}
                      onChange={(e) => setShortBenefit(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING, COSTS & PROFIT MARGIN */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2 border-b pb-1.5">
                  <TrendingUp size={16} className="text-[#5B755D]" />
                  <span>2. Pricing, Supplier Cost & Margins</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Regular Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 2950"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Sale / Offer Price (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Optional discounted price"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold text-[#5B755D] focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Supplier Cost Price (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Internal cost per unit"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-700 focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Margin Calculation Preview */}
                {sellingPriceNum > 0 && (
                  <div className="p-3 bg-[#EBF1EB] rounded-2xl border border-[#5B755D]/25 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#435845] font-bold block">Live Pricing Analytics:</span>
                      <span className="text-[#171A18] font-medium">
                        Customer pays: <strong>PKR {sellingPriceNum.toLocaleString()}</strong>
                        {discountPercent > 0 && ` (Save ${discountPercent}%)`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#435845] font-bold block">Gross Profit per Unit:</span>
                      <span className="font-extrabold text-emerald-800">
                        PKR {profitNum.toLocaleString()} ({marginPercent}% margin)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: INVENTORY & VISIBILITY FLAGS */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2 border-b pb-1.5">
                  <Boxes size={16} className="text-[#5B755D]" />
                  <span>3. Stock Inventory & Visibility</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">In-Stock Quantity (Units) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-2.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded text-[#5B755D]"
                      />
                      <span className="font-bold text-xs text-[#171A18]">
                        Active & Published on Storefront
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-[#5B755D]"
                      />
                      <span className="font-bold text-xs text-[#171A18]">
                        Highlight as Featured System on Homepage
                      </span>
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 p-3 bg-[#FAF8F5] hover:bg-[#EBF1EB] transition-colors rounded-xl border border-[#5B755D]/20 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHero}
                        onChange={(e) => setIsHero(e.target.checked)}
                        className="rounded text-[#5B755D] w-4 h-4"
                      />
                      <div>
                        <div className="font-bold text-xs text-[#171A18] flex items-center gap-1.5">
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          <span>Primary Storefront Hero Product</span>
                        </div>
                        <p className="text-[11px] text-[#7F8681]">
                          Setting this will display this product as the flagship recommendation on the homepage and AI concierge.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PRODUCT IMAGES GALLERY */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#171A18] flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#5B755D]" />
                    <span>4. Product Images Gallery ({images.length})</span>
                  </div>
                  <span className="text-[10px] text-[#7F8681] font-semibold">First image is the storefront Cover</span>
                </h4>

                {/* Gallery Thumbnail Strip */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border p-1 bg-white shadow-2xs group ${
                          idx === 0 ? 'border-[#5B755D] ring-2 ring-[#5B755D]/30' : 'border-gray-200'
                        }`}
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                          <Image src={img} alt="" fill sizes="180px" className="object-cover" />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px]">
                          {idx === 0 ? (
                            <span className="font-black text-[#5B755D] uppercase tracking-wider">COVER</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="text-[#7F8681] hover:text-[#5B755D] font-bold"
                            >
                              Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-[#FAF8F5] rounded-2xl border border-dashed border-gray-300 p-4">
                    <ImageIcon size={28} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 font-medium">No images added yet. Upload via Cloudinary or paste a direct image URL.</p>
                  </div>
                )}

                {/* Image Upload Component */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-gray-200 space-y-3">
                  <CloudinaryUploader
                    label="Upload High-Resolution Product Image (Cloudinary CDN)"
                    onChange={handleAddUploadedImage}
                    folder="organiva/products"
                  />

                  <div className="pt-2 border-t border-gray-200 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or enter direct image URL (https://...)"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-3.5 py-2 bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: DTC COPYWRITING (Problem, Solution, Description) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2 border-b pb-1.5">
                  <Sparkles size={16} className="text-[#5B755D]" />
                  <span>5. DTC Product Storytelling & Copy</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1">Full Product Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the aesthetic, utility, and everyday convenience of this system..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Problem Statement ("Still dealing with...?")</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Deep kitchen cabinets turn into clutter black holes where jars fall over..."
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Solution Statement ("There's a simpler way...")</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. A smooth 360-degree rotation brings everything from the deepest cabinet corner right to your fingertips in 1 second."
                      value={solutionStatement}
                      onChange={(e) => setSolutionStatement(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#5B755D] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: DYNAMIC BENEFITS BUILDER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2">
                    <Check size={16} className="text-[#5B755D]" />
                    <span>6. Key Product Benefits ({benefits.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="text-[11px] font-bold text-[#5B755D] hover:underline cursor-pointer"
                  >
                    + Add Benefit Point
                  </button>
                </div>

                <div className="space-y-2.5">
                  {benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 flex items-start gap-2"
                    >
                      <input
                        type="text"
                        placeholder="01"
                        value={b.number}
                        onChange={(e) => handleBenefitChange(idx, 'number', e.target.value)}
                        className="w-12 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-center"
                      />
                      <input
                        type="text"
                        placeholder="Headline e.g. BALL-BEARING GLIDE"
                        value={b.title}
                        onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                        className="w-1/3 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Short explanation..."
                        value={b.description}
                        onChange={(e) => handleBenefitChange(idx, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: DYNAMIC SPECIFICATIONS BUILDER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-[#5B755D]" />
                    <span>7. Technical Specifications ({specifications.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-[11px] font-bold text-[#5B755D] hover:underline cursor-pointer"
                  >
                    + Add Specification
                  </button>
                </div>

                <div className="space-y-2.5">
                  {specifications.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Property e.g. Material"
                        value={s.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        className="w-1/3 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Value e.g. Extra-Thick Matte ABS"
                        value={s.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving & Publishing to Store...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingProduct ? 'Save Changes' : 'Publish Product to Store'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
