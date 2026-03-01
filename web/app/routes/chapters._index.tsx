import { Link, useLoaderData } from "react-router";
import { getAllChapters } from "@/lib/blog.server";

export function meta() {
  return [
    { title: "Chapters — Ethos" },
    {
      name: "description",
      content:
        "All 82 chapters of Ethos — a secular framework for the well-lived life. Read about purpose, discipline, relationships, ethics, and meaning.",
    },
    { name: "robots", content: "index, follow" },
  ];
}

export async function loader() {
  const chapters = getAllChapters();
  return { chapters };
}

export default function ChaptersIndex() {
  const { chapters } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-[#1c2338] bg-[#0d1019] p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Ethos
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">All Chapters</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
          82 chapters covering personal development, relationships, ethics, society, and the
          philosophical questions of a well-lived life.
        </p>
      </div>

      {/* Chapter list */}
      {chapters.length === 0 ? (
        <p className="text-slate-400">No chapters found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              to={`/chapters/${chapter.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5 transition-colors hover:border-amber-500/30"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#1c2338] bg-[#10131f] text-[11px] font-bold text-slate-500 group-hover:border-amber-500/25 group-hover:text-amber-400 transition-colors">
                {String(chapter.order).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-snug text-white group-hover:text-amber-400 transition-colors">
                  {chapter.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {chapter.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
