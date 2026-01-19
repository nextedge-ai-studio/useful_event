import WorkCard from "@/components/WorkCard";

type Work = {
  id: string;
  title: string;
  author: string;
  description: string;
  voteCount: number;
  hasVoted: boolean;
  imageUrl?: string | null;
  imageUrls?: string[];
  demoUrl?: string | null;
  gradient?: string;
  onVote?: (id: string) => void;
  votingDisabled?: boolean;
};

type GalleryGridProps = {
  works: Work[];
};

export default function GalleryGrid({ works }: GalleryGridProps) {
  return (
    <section id="gallery" className="scroll-mt-28 py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Gallery
            </p>
            <h2 className="font-serif text-3xl text-slate-900 sm:text-4xl">
              精選作品
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600">
            以雲端般的視覺語彙承載創意，為投票與收藏而生的展覽牆。
          </p>
        </div>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {works.map((work) => (
            <div key={work.id} className="mb-6">
              <WorkCard {...work} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
