import ActivitySection from "@/components/ActivitySection";
import GallerySection from "@/components/GallerySection";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <ActivitySection />
        <GallerySection />
      </main>
    </div>
  );
}
