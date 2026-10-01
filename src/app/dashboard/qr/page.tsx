import { createClient } from "@/lib/supabase/server";
import QRPage from "@/components/QRPage";

export default async function QrCodePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const menuUrl = `${siteUrl}/menu/${restaurant.slug}`;

  return <QRPage restaurantName={restaurant.name} menuUrl={menuUrl} />;
}
