import ActivitySection from "@/components/ActivitySection";
import GallerySection from "@/components/GallerySection";
import HeroSection from "@/components/HeroSection";

import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { count } = await supabaseServer
    .from("works")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection submissionCount={count || 0} />
        <ActivitySection />
        <GallerySection />
      </main>
    </div>
  );
}
