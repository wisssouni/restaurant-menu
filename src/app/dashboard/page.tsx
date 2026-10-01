import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UtensilsCrossed, QrCode, Tag, ArrowRight, ExternalLink, TrendingUp, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants").select("*").eq("owner_id", user!.id).single();

  const { count: itemCount } = await supabase
    .from("menu_items").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id);

  const { count: availableCount } = await supabase
    .from("menu_items").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("available", true);

  const { count: categoryCount } = await supabase
    .from("categories").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const menuUrl = `${siteUrl}/menu/${restaurant.slug}`;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "☀️" : hour < 18 ? "👋" : "🌙";
  const isLive = (itemCount ?? 0) > 0;

  return (
    <div className="space-y-8">

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white px-7 py-8">
        {/* Background gradient blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-amber-400 opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{emoji}</span>
              <span className="text-sm font-medium text-orange-300">{greeting}</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-gray-400 text-sm mt-1">{restaurant.description}</p>
            )}
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-orange-300 transition-colors"
            >
              <ExternalLink size={11} />
              {menuUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>

          {/* Live badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl self-start sm:self-auto ${isLive ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-gray-700 border border-gray-600"}`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            <span className={`text-sm font-semibold ${isLive ? "text-emerald-300" : "text-gray-400"}`}>
              {isLive ? "Menu is live" : "Menu is empty"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          value={itemCount ?? 0}
          label="Total items"
          icon={<UtensilsCrossed size={16} />}
          color="orange"
        />
        <StatCard
          value={availableCount ?? 0}
          label="Available"
          icon={<TrendingUp size={16} />}
          color="green"
        />
        <StatCard
          value={categoryCount ?? 0}
          label="Categories"
          icon={<Tag size={16} />}
          color="blue"
        />
        <StatCard
          value={isLive ? "Live" : "Draft"}
          label="Status"
          icon={<Sparkles size={16} />}
          color={isLive ? "green" : "gray"}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            href="/dashboard/menu"
            gradient="from-orange-500 to-amber-400"
            icon={<UtensilsCrossed size={24} className="text-white" />}
            title="Manage Menu"
            description="Add, edit or remove food items and categories"
            stat={`${itemCount ?? 0} items`}
          />
          <ActionCard
            href="/dashboard/qr"
            gradient="from-violet-500 to-purple-400"
            icon={<QrCode size={24} className="text-white" />}
            title="QR Code"
            description="Download and print for your tables"
            stat="Print ready"
          />
        </div>
      </div>

      {/* Menu URL card */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your menu link</p>
          <p className="text-sm font-medium text-gray-700 break-all">{menuUrl}</p>
          <p className="text-xs text-gray-400 mt-1">Share this link or use the QR code on your tables</p>
        </div>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <ExternalLink size={14} />
          Preview
        </a>
      </div>

    </div>
  );
}

function StatCard({ value, label, icon, color }: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "gray";
}) {
  const colors = {
    orange: { bg: "bg-orange-50", text: "text-orange-500", val: "text-orange-600" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-500",   val: "text-blue-600" },
    green:  { bg: "bg-emerald-50",text: "text-emerald-500",val: "text-emerald-600" },
    gray:   { bg: "bg-gray-50",   text: "text-gray-400",   val: "text-gray-600" },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className={`inline-flex p-2 rounded-xl ${c.bg} ${c.text} mb-3`}>{icon}</div>
      <p className={`text-2xl font-black ${c.val}`}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}

function ActionCard({ href, gradient, icon, title, description, stat }: {
  href: string;
  gradient: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
}) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-lg transition-all duration-200">
      {/* Colored top strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-sm`}>
            {icon}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {stat}
          </div>
        </div>
        <h3 className="font-black text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
          Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
