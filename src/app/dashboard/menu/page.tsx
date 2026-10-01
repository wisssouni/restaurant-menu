import { createClient } from "@/lib/supabase/server";
import MenuManager from "@/components/MenuManager";

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*, category:categories(id, name)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at");

  return (
    <MenuManager
      restaurant={restaurant}
      initialCategories={categories ?? []}
      initialItems={menuItems ?? []}
    />
  );
}
