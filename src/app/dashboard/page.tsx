import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UtensilsCrossed, QrCode, Tag, ArrowRight, ExternalLink, TrendingUp, Zap } from "lucide-react";

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
  const isLive = (itemCount ?? 0) > 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white px-7 py-8 min-h-[180px] flex flex-col justify-between">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500 opacity-[0.12] blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-amber-400 opacity-[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-4 right-4 w-24 h-24 bg-orange-400 opacity-[0.15] blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">{greeting}</p>
          <div className="flex items-center gap-4 mb-1">
            <div className="relative w-14 h-14 shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-orange-500 opacity-40 blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-orange-500/20 border border-orange-400/30 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo2.png" alt="Plato" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{restaurant.name}</h1>
          </div>
          {restaurant.description && (
            <p className="text-gray-500 text-sm mt-1">{restaurant.description}</p>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between mt-6 pt-6 border-t border-white/8">
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium"
          >
            <ExternalLink size={11} />
            {menuUrl.replace(/^https?:\/\//, "")}
          </a>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            isLive
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-white/8 text-gray-500 border border-white/10"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
            {isLive ? "Live" : "No items yet"}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total items",  value: itemCount ?? 0,     icon: <UtensilsCrossed size={15} />, accent: "text-orange-500",  bg: "bg-orange-50"  },
          { label: "Available",    value: availableCount ?? 0, icon: <TrendingUp size={15} />,      accent: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Categories",   value: categoryCount ?? 0,  icon: <Tag size={15} />,             accent: "text-blue-500",    bg: "bg-blue-50"    },
          { label: "Status",       value: isLive ? "Live" : "Draft", icon: <Zap size={15} />,      accent: isLive ? "text-emerald-500" : "text-gray-400", bg: isLive ? "bg-emerald-50" : "bg-gray-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2 rounded-xl ${stat.bg} ${stat.accent} mb-3`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-black ${stat.accent}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          href="/dashboard/menu"
          title="Manage Menu"
          description="Add, edit or remove food items and categories"
          badge={`${itemCount ?? 0} items`}
          gradient="from-orange-500 to-amber-400"
          icon={<UtensilsCrossed size={22} className="text-white" />}
        />
        <ActionCard
          href="/dashboard/qr"
          title="QR Code"
          description="Download and print your table QR codes"
          badge="Print ready"
          gradient="from-gray-800 to-gray-700"
          icon={<QrCode size={22} className="text-white" />}
        />
      </div>

      {/* ── Menu URL strip ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your public menu URL</p>
          <p className="text-sm text-gray-600 font-medium truncate">{menuUrl}</p>
        </div>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-orange flex items-center gap-2 whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <ExternalLink size={14} />
          Open menu
        </a>
      </div>

    </div>
  );
}

function ActionCard({ href, title, description, badge, gradient, icon }: {
  href: string;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
      {/* Top gradient bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-md`}>
            {icon}
          </div>
          <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        </div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
        <div className="flex items-center gap-1.5 mt-5 text-xs font-bold text-gray-400 group-hover:text-gray-700 transition-colors">
          Go to {title}
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-150" />
        </div>
      </div>
    </Link>
  );
}
