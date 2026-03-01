import { getAllChapters } from "@/lib/blog.server";

const BASE = "https://ethosian.info";

export async function loader() {
  const chapters = getAllChapters();

  const urls = [
    { loc: BASE, priority: "1.0", changefreq: "weekly" },
    { loc: `${BASE}/chapters`, priority: "0.9", changefreq: "weekly" },
    ...chapters.map((c) => ({
      loc: `${BASE}/chapters/${c.slug}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq }) => `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
