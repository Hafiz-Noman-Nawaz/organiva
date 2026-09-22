'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/setup';

  useEffect(() => {
    if (isAuthPage) return;
    const token = localStorage.getItem('organiva_admin_token');
    const rawUser = localStorage.getItem('organiva_admin_user');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      if (rawUser) {
        try {
          setAdminUser(JSON.parse(rawUser));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isSuper = adminUser?.isSuperAdmin || adminUser?.role === 'superadmin';
  const permissions: string[] = adminUser?.permissions || [];

  const hasPerm = (p: string) => {
    if (isSuper) return true;
    return permissions.includes(p) || permissions.includes('*');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, visible: true },
    {
      name: 'Orders Pipeline',
      href: '/admin/orders',
      icon: ShoppingBag,
      visible: hasPerm('orders:view') || hasPerm('orders:manage'),
    },
    {
      name: 'Product CMS',
      href: '/admin/products',
      icon: Package,
      visible: hasPerm('products:view') || hasPerm('products:manage'),
    },
    {
      name: 'Category & Space CMS',
      href: '/admin/categories',
      icon: Layers,
      visible: hasPerm('products:view') || hasPerm('products:manage'),
    },
    {
      name: 'Inventory & Suppliers',
      href: '/admin/inventory',
      icon: Boxes,
      visible: hasPerm('inventory:view') || hasPerm('suppliers:manage'),
    },
    // SuperAdmin ONLY
    {
      name: 'Staff & RBAC',
      href: '/admin/staff',
      icon: Users,
      visible: isSuper,
    },
  ].filter((item) => item.visible);

  const handleLogout = () => {
    localStorage.removeItem('organiva_admin_token');
    localStorage.removeItem('organiva_admin_user');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col lg:flex-row text-[#171A18]">
      {/* Mobile Header */}
      <header className="lg:hidden bg-[#1F3524] text-white p-4 flex items-center justify-between border-b border-[#2B4530]">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded" />
          <span className="font-bold text-sm">ORGANIVA CMS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1F3524] text-white flex flex-col justify-between p-5 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center">
              <Image src="/logo.png" alt="Organiva" width={28} height={28} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block">ORGANIVA</span>
              <span className="text-[10px] text-[#8EB892] font-semibold tracking-wider uppercase">
                Admin Operations
              </span>
            </div>
          </Link>

          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#5B755D] text-white shadow-xs'
                      : 'text-[#CAD3CA] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/10">
          {/* User Profile Card */}
          {adminUser && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white truncate max-w-[130px]">{adminUser.name}</span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isSuper
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                  }`}
                >
                  {isSuper ? 'Super Admin' : adminUser.role}
                </span>
              </div>
              <span className="text-[#8EB892] text-[10px] block truncate">{adminUser.email}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[#CAD3CA] hover:text-white transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-300 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
