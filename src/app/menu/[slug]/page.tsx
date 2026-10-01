import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { MenuItem, Category } from "@/lib/types";
import PublicMenu from "@/components/PublicMenu";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("slug", slug)
    .single();
  return { title: restaurant ? `${restaurant.name} — Menu` : "Menu" };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurant) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("available", true)
    .order("created_at");

  return (
    <PublicMenu
      restaurant={restaurant}
      categories={(categories ?? []) as Category[]}
      items={(items ?? []) as MenuItem[]}
    />
  );
}
