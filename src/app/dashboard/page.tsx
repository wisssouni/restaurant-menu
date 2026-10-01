import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UtensilsCrossed, QrCode, Tag, ArrowRight, ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const { count: itemCount } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const { count: availableCount } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("available", true);

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const menuUrl = `${siteUrl}/menu/${restaurant.slug}`;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-orange-500 mb-1">{greeting} 👋</p>
        <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ExternalLink size={13} />
            {menuUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total items"
          value={itemCount ?? 0}
          sub={`${availableCount ?? 0} available`}
          icon={<UtensilsCrossed size={18} />}
          color="orange"
        />
        <StatCard
          label="Categories"
          value={categoryCount ?? 0}
          sub="sections on menu"
          icon={<Tag size={18} />}
          color="blue"
        />
        <StatCard
          label="Menu status"
          value={(itemCount ?? 0) > 0 ? "Live" : "Empty"}
          sub={(itemCount ?? 0) > 0 ? "Customers can view it" : "Add items to go live"}
          icon={<QrCode size={18} />}
          color={(itemCount ?? 0) > 0 ? "green" : "gray"}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            href="/dashboard/menu"
            icon={<UtensilsCrossed size={22} className="text-orange-500" />}
            bg="bg-orange-50"
            title="Manage Menu"
            description="Add, edit or remove food items and categories"
          />
          <ActionCard
            href="/dashboard/qr"
            icon={<QrCode size={22} className="text-violet-500" />}
            bg="bg-violet-50"
            title="QR Code"
            description="Download and print for your tables"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "gray";
}) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    blue:   "bg-blue-100 text-blue-600",
    green:  "bg-emerald-100 text-emerald-600",
    gray:   "bg-gray-100 text-gray-500",
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  bg,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  bg: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="card-hover group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${bg} mb-4`}>{icon}</div>
        <ArrowRight
          size={16}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1"
        />
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}
