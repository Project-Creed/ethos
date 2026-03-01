import { Link, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { getChapter, getAllChapters } from "@/lib/blog.server";
import type { TocEntry } from "@/lib/blog.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const chapter = getChapter(params.slug!);
  if (!chapter) throw new Response("Not Found", { status: 404 });

  const all = getAllChapters();
  const idx = all.findIndex((c) => c.slug === params.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const related = all
    .filter((c) => c.slug !== params.slug)
    .slice(Math.max(0, idx - 2), idx + 2)
    .filter((c) => c.slug !== params.slug)
    .slice(0, 3);

  return { chapter, prev, next, related };
}

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> | undefined }) {
  if (!data) return [{ title: "Chapter Not Found — Ethos" }];
  const { chapter } = data;
  return [
    { title: `${chapter.title} — Ethos` },
    { name: "description", content: chapter.description },
    { name: "robots", content: "index, follow" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: chapter.title,
        description: chapter.description,
        isPartOf: {
          "@type": "Book",
          name: "Ethos",
        },
      },
    },
  ];
}

function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          On this page
        </p>
        <nav className="flex flex-col gap-0.5">
          {toc.map(({ id, text, level }) => (
            <a
              key={id}
              href={`#${id}`}
              className={[
                "block rounded py-1 text-xs leading-snug transition-colors",
                level === 3 ? "pl-3" : "pl-0",
                activeId === id
                  ? "font-semibold text-amber-700"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              {text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function ChapterPost() {
  const { chapter, prev, next, related } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/chapters" className="hover:text-slate-700 transition-colors">
          Chapters
        </Link>
        <span>/</span>
        <span className="text-slate-600 truncate">{chapter.title}</span>
      </nav>

      {/* Article + TOC sidebar */}
      <div className="flex gap-10 items-start">
        <article className="min-w-0 flex-1 rounded-2xl border border-[#e1e6f0] bg-white p-7 sm:p-10">
          <header className="mb-8 border-b border-[#e1e6f0] pb-8">
            <p className="text-[11px] font-medium text-amber-700/70">
              Chapter {String(chapter.order).padStart(2, "0")}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {chapter.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{chapter.description}</p>
          </header>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: chapter.html }}
          />
        </article>

        <TableOfContents toc={chapter.toc} />
      </div>

      {/* Prev / Next navigation */}
      <nav className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/chapters/${prev.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-[#e1e6f0] bg-white p-4 transition-colors hover:border-amber-400/40"
          >
            <span className="text-lg text-slate-500 group-hover:text-amber-700 transition-colors">←</span>
            <div>
              <p className="text-[10px] text-slate-500">Previous chapter</p>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/chapters/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-[#e1e6f0] bg-white p-4 text-right transition-colors hover:border-amber-400/40 sm:col-start-2"
          >
            <div>
              <p className="text-[10px] text-slate-500">Next chapter</p>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                {next.title}
              </p>
            </div>
            <span className="text-lg text-slate-500 group-hover:text-amber-700 transition-colors">→</span>
          </Link>
        ) : null}
      </nav>

      {/* Related chapters */}
      {related.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Related Chapters
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((c) => (
              <Link
                key={c.slug}
                to={`/chapters/${c.slug}`}
                className="group rounded-xl border border-[#e1e6f0] bg-white p-4 transition-colors hover:border-amber-400/40"
              >
                <p className="text-[11px] text-slate-500">Chapter {String(c.order).padStart(2, "0")}</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                  {c.title}
                </p>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl border border-amber-400/30 bg-amber-50 p-7 text-center">
        <p className="text-base font-bold text-slate-900">Continue reading Ethos</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          82 chapters covering every domain of a well-lived life. Free to read.
        </p>
        <Link
          to="/chapters"
          className="gold-btn mt-5 inline-block rounded-xl px-8 py-3 text-sm font-bold"
        >
          Browse All Chapters
        </Link>
      </div>

      {/* Back link */}
      <Link
        to="/chapters"
        className="block text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← Back to all chapters
      </Link>
    </div>
  );
}
