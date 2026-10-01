"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, QrCode, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/lib/types";
import clsx from "clsx";

const navLinks = [
  { href: "/dashboard",      label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu",     icon: UtensilsCrossed },
  { href: "/dashboard/qr",   label: "QR Code",  icon: QrCode },
];

export default function DashboardNav({ restaurant }: { restaurant: Restaurant }) {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-950 text-white shrink-0 border-r border-white/5">

        {/* Brand */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-orange-500 opacity-30 blur-md" />
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-orange-500/20 border border-orange-400/30 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo2.png" alt="Plato" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <p className="font-black text-base text-white tracking-tight">Plato</p>
              <p className="text-xs text-gray-500 font-medium">Restaurant Dashboard</p>
            </div>
          </div>
        </div>

        {/* Restaurant pill */}
        <div className="mx-4 mb-6 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-500 font-medium mb-0.5">Active restaurant</p>
          <p className="text-sm font-bold text-white truncate">{restaurant.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                pathname === href
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-gray-500 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon size={16} strokeWidth={pathname === href ? 2.5 : 2} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-6 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-white/8 hover:text-white transition-all w-full"
          >
            <LogOut size={16} />
            Sign out
          </button>
          <p className="text-xs text-gray-700 text-center mt-4">Powered by Plato</p>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur text-white h-14 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10 p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo2.png" alt="Plato" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-sm tracking-tight">Plato</span>
          <span className="text-gray-600 text-xs">·</span>
          <span className="text-gray-400 text-xs font-medium truncate max-w-[100px]">{restaurant.name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {navLinks.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                pathname === href ? "bg-orange-500 text-white" : "text-gray-500 hover:text-white"
              )}
            >
              <Icon size={17} />
            </Link>
          ))}
          <button onClick={handleSignOut} className="p-2 rounded-lg text-gray-500 hover:text-white ml-1">
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
