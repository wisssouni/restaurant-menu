"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UtensilsCrossed, QrCode, LayoutDashboard, LogOut, ChefHat } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/lib/types";
import clsx from "clsx";

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
];

export default function DashboardNav({ restaurant }: { restaurant: Restaurant }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-gray-900 text-white shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <ChefHat size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{restaurant.name}</p>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                pathname === href
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <ChefHat size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm truncate max-w-[140px]">{restaurant.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                pathname === href ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <Icon size={18} />
            </Link>
          ))}
          <button onClick={handleSignOut} className="p-2 rounded-lg text-gray-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
