import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: restaurant } = await supabase
    .from("restaurants").select("*").eq("owner_id", user.id).single();
  if (!restaurant) redirect("/register");

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex">
      <DashboardNav restaurant={restaurant} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
