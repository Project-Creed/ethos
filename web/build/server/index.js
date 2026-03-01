import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, Meta, Links, ScrollRestoration, Scripts, Link, useLoaderData } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function links() {
  return [{
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg"
  }];
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("div", {
    className: "app-shell",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "pointer-events-none fixed inset-0 overflow-hidden",
      "aria-hidden": "true",
      children: [/* @__PURE__ */ jsx("div", {
        className: "absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-amber-500/4 blur-[140px]"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-indigo-700/4 blur-[120px]"
      })]
    }), /* @__PURE__ */ jsxs("header", {
      className: "top-bar relative z-10",
      children: [/* @__PURE__ */ jsxs("a", {
        href: "/",
        className: "flex items-center gap-3",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10",
          children: /* @__PURE__ */ jsx("span", {
            className: "text-base font-bold text-amber-400",
            children: "E"
          })
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "m-0 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500",
            children: "A Framework for Living"
          }), /* @__PURE__ */ jsx("h1", {
            className: "m-0 text-xl font-bold text-white",
            children: "Ethos"
          })]
        })]
      }), /* @__PURE__ */ jsx("nav", {
        className: "flex items-center gap-6",
        children: /* @__PURE__ */ jsx("a", {
          href: "/chapters",
          className: "text-sm font-medium text-slate-400 hover:text-white transition-colors",
          children: "Chapters"
        })
      })]
    }), /* @__PURE__ */ jsx("main", {
      className: "content relative z-10",
      children: /* @__PURE__ */ jsx(Outlet, {})
    }), /* @__PURE__ */ jsxs("footer", {
      className: "relative z-10 mt-16 border-t border-[#1c2338] pb-8 pt-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2.5",
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/8",
            children: /* @__PURE__ */ jsx("span", {
              className: "text-sm font-bold text-amber-400",
              children: "E"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-base font-bold text-white",
              children: "Ethos"
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-0.5 text-xs text-slate-500",
              children: "A secular framework for the well-lived life."
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-1.5 text-xs text-slate-500 sm:text-right",
          children: [/* @__PURE__ */ jsx("p", {
            children: "81 chapters across 5 pillars"
          }), /* @__PURE__ */ jsx("p", {
            children: "Personal • Relational • Societal • Ethical • Spiritual"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-6 flex flex-col gap-2 border-t border-[#1c2338] pt-6 sm:flex-row sm:items-center sm:justify-between",
        children: [/* @__PURE__ */ jsxs("p", {
          className: "text-xs text-slate-600",
          children: ["© ", (/* @__PURE__ */ new Date()).getFullYear(), " Ethos. Licensed under", " ", /* @__PURE__ */ jsx("span", {
            className: "text-slate-500",
            children: "CC BY-NC-ND 4.0"
          }), "."]
        }), /* @__PURE__ */ jsx("a", {
          href: "/chapters",
          className: "text-xs text-slate-500 hover:text-amber-400 transition-colors",
          children: "Read all chapters →"
        })]
      })]
    })]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center p-8 text-center",
    children: /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-bold text-white",
        children: "Something went wrong"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 text-slate-400",
        children: "Please try refreshing the page."
      })]
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const PILLARS = [{
  label: "Personal",
  chapters: "Discipline, Purpose, Resilience, Mindfulness, Sleep, Fitness",
  description: "Build the inner foundations that make everything else possible.",
  color: "amber"
}, {
  label: "Relational",
  chapters: "Marriage, Friendship, Parenting, Mentorship, Community",
  description: "Understand what you owe the people closest to you.",
  color: "indigo"
}, {
  label: "Societal",
  chapters: "Leadership, Charity, Justice, Teamwork, Networking",
  description: "Extend your responsibility beyond yourself.",
  color: "emerald"
}, {
  label: "Ethical",
  chapters: "Integrity, Honesty, Accountability, Transparency, Courage",
  description: "Hold yourself to a standard that survives scrutiny.",
  color: "violet"
}, {
  label: "Philosophical",
  chapters: "Legacy, Wisdom, Meaning-Making, Transcendence, Hope",
  description: "Think in longer arcs than most people are trained to use.",
  color: "sky"
}];
const FEATURED_CHAPTERS = [{
  slug: "purpose",
  title: "Purpose",
  description: "Purpose is the decision to take your life seriously. Most people live reactively — purpose is the deliberate override."
}, {
  slug: "discipline",
  title: "Discipline",
  description: "Discipline is not punishment. It is the bridge between what you intend and what you actually do."
}, {
  slug: "integrity",
  title: "Integrity",
  description: "Your values, your words, and your actions must align. This is harder than it sounds."
}, {
  slug: "resilience",
  title: "Resilience",
  description: "What matters is not whether adversity arrives — it will — but how you move through it."
}, {
  slug: "wisdom",
  title: "Wisdom",
  description: "Wisdom is the ability to act well in the face of incomplete information and irreversible consequences."
}, {
  slug: "legacy",
  title: "Legacy",
  description: "Legacy is not about being remembered. It is about the direction in which your life pushed things."
}];
const STATS = [{
  value: "82",
  label: "Chapters"
}, {
  value: "5",
  label: "Pillars"
}, {
  value: "Free",
  label: "To Read"
}, {
  value: "Secular",
  label: "Framework"
}];
function meta$2() {
  return [{
    title: "Ethos — A Framework for the Well-Lived Life"
  }, {
    name: "description",
    content: "Ethos is a secular framework for living with intention, integrity, and a long view. 82 chapters covering discipline, relationships, ethics, and meaning."
  }, {
    name: "robots",
    content: "index, follow"
  }];
}
const home = UNSAFE_withComponentProps(function HomePage() {
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-5",
    children: [/* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
      children: STATS.map(({
        value,
        label
      }) => /* @__PURE__ */ jsxs("div", {
        className: "rounded-xl border border-[#1c2338] bg-[#0d1019] px-4 py-3 text-center",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-2xl font-bold text-amber-400",
          children: value
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-0.5 text-[11px] text-slate-400",
          children: label
        })]
      }, label))
    }), /* @__PURE__ */ jsxs("section", {
      className: "relative overflow-hidden rounded-2xl border border-[#1c2338] bg-[#0d1019] p-8 shadow-2xl sm:p-12",
      children: [/* @__PURE__ */ jsx("div", {
        className: "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/6 blur-3xl"
      }), /* @__PURE__ */ jsx("div", {
        className: "pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-600/5 blur-3xl"
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative max-w-2xl",
        children: [/* @__PURE__ */ jsxs("span", {
          className: "inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-amber-400",
          children: [/* @__PURE__ */ jsx("span", {
            className: "h-1.5 w-1.5 rounded-full bg-amber-400"
          }), "Ethosism — A Secular Philosophy for Modern Life"]
        }), /* @__PURE__ */ jsxs("h2", {
          className: "mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl",
          children: ["What does it mean", " ", /* @__PURE__ */ jsx("span", {
            className: "text-amber-400",
            children: "to live well?"
          })]
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-5 text-[15px] leading-relaxed text-slate-300 max-w-xl",
          children: "Not in abstract terms — but concretely. Chapter by chapter, domain by domain: how to manage your time, how to treat the people you love, what honesty actually demands, how to face adversity without it breaking you."
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-3 text-sm leading-relaxed text-slate-400 max-w-xl",
          children: "Ethos makes no claims about the supernatural and draws from philosophy, psychology, and hard-won collective experience without belonging to any tradition exclusively. It is secular. It is rigorous. It is free to read."
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-8 flex flex-wrap items-center gap-4",
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/chapters",
            className: "gold-btn rounded-xl px-7 py-3 text-sm font-bold",
            children: "Read the Chapters"
          }), /* @__PURE__ */ jsx(Link, {
            to: "/chapters/introduction",
            className: "rounded-xl border border-[#1c2338] px-6 py-3 text-sm font-medium text-slate-300 hover:border-amber-500/30 hover:text-white transition-colors",
            children: "Start with the Introduction"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("section", {
      children: [/* @__PURE__ */ jsx("p", {
        className: "mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500",
        children: "Five Pillars"
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
        children: PILLARS.map(({
          label,
          chapters,
          description
        }) => /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-bold uppercase tracking-wider text-amber-400",
            children: label
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-sm font-semibold leading-snug text-slate-100",
            children: description
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-[11px] leading-relaxed text-slate-500",
            children: chapters
          })]
        }, label))
      })]
    }), /* @__PURE__ */ jsxs("section", {
      children: [/* @__PURE__ */ jsx("p", {
        className: "mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500",
        children: "Featured Chapters"
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        children: FEATURED_CHAPTERS.map(({
          slug,
          title,
          description
        }) => /* @__PURE__ */ jsxs(Link, {
          to: `/chapters/${slug}`,
          className: "group block rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5 transition-colors hover:border-amber-500/30",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-base font-bold text-white group-hover:text-amber-400 transition-colors",
            children: title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-sm leading-relaxed text-slate-400",
            children: description
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-xs font-semibold text-amber-400/70 group-hover:text-amber-400 transition-colors",
            children: "Read chapter →"
          })]
        }, slug))
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "grid gap-4 sm:grid-cols-2",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "rounded-2xl border border-[#1c2338] bg-[#0d1019] p-6",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400",
          children: "What Ethos Is"
        }), /* @__PURE__ */ jsx("ul", {
          className: "mt-3 space-y-2 text-sm text-slate-300",
          children: ["A concrete, domain-by-domain guide to living well", "Grounded in evidence, reason, and human experience", "Honest about what is hard and what is uncertain", "Written to be tested against real decisions", "Free to read, share, and discuss"].map((item) => /* @__PURE__ */ jsxs("li", {
            className: "flex items-start gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
            }), item]
          }, item))
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-2xl border border-[#1c2338] bg-[#0d1019] p-6",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500",
          children: "What Ethos Is Not"
        }), /* @__PURE__ */ jsx("ul", {
          className: "mt-3 space-y-2 text-sm text-slate-400",
          children: ["A religion or spiritual tradition", "A self-help book promising transformation in 30 days", "A philosophy only for seminars or academics", "A set of principles too vague to apply", "A system that requires agreement on everything"].map((item) => /* @__PURE__ */ jsxs("li", {
            className: "flex items-start gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600"
            }), item]
          }, item))
        })]
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-lg font-bold text-white",
        children: "Ready to examine how you live?"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 max-w-md mx-auto text-sm leading-relaxed text-slate-400",
        children: "Goodness is not a mystery. The 82 chapters of Ethos lay out, domain by domain, what a well-lived life actually looks like."
      }), /* @__PURE__ */ jsx(Link, {
        to: "/chapters",
        className: "gold-btn mt-6 inline-block rounded-xl px-8 py-3 text-sm font-bold",
        children: "Browse All Chapters"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-3 text-xs text-slate-500",
        children: "Free to read. No account required."
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const CHAPTERS_DIR = path.join(__dirname$1, "..", "..", "..", "chapters");
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}
function extractDescription(content) {
  const withoutHeading = content.replace(/^#\s+.+$/m, "").trim();
  const lines = withoutHeading.split("\n");
  const paragraphLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (paragraphLines.length > 0) break;
      continue;
    }
    paragraphLines.push(trimmed);
  }
  const raw = paragraphLines.join(" ").replace(/\*\*/g, "").replace(/\*/g, "");
  return raw.length > 200 ? raw.slice(0, 197) + "…" : raw;
}
function filenameToSlug(filename) {
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "");
}
function filenameToOrder(filename) {
  const match = filename.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : 999;
}
function getAllChapters() {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  return fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith(".md") && /^\d+/.test(f)).sort().map((filename) => {
    const content = fs.readFileSync(path.join(CHAPTERS_DIR, filename), "utf-8");
    return {
      slug: filenameToSlug(filename),
      order: filenameToOrder(filename),
      title: extractTitle(content),
      description: extractDescription(content)
    };
  });
}
function getChapter(slug) {
  if (!fs.existsSync(CHAPTERS_DIR)) return null;
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith(".md") && /^\d+/.test(f));
  const filename = files.find((f) => filenameToSlug(f) === slug);
  if (!filename) return null;
  const content = fs.readFileSync(path.join(CHAPTERS_DIR, filename), "utf-8");
  const html = marked(content);
  return {
    slug,
    order: filenameToOrder(filename),
    title: extractTitle(content),
    description: extractDescription(content),
    html
  };
}
function meta$1() {
  return [{
    title: "Chapters — Ethos"
  }, {
    name: "description",
    content: "All 82 chapters of Ethos — a secular framework for the well-lived life. Read about purpose, discipline, relationships, ethics, and meaning."
  }, {
    name: "robots",
    content: "index, follow"
  }];
}
async function loader$1() {
  const chapters = getAllChapters();
  return {
    chapters
  };
}
const chapters__index = UNSAFE_withComponentProps(function ChaptersIndex() {
  const {
    chapters
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "rounded-2xl border border-[#1c2338] bg-[#0d1019] p-7",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500",
        children: "Ethos"
      }), /* @__PURE__ */ jsx("h1", {
        className: "mt-2 text-3xl font-bold text-white",
        children: "All Chapters"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 max-w-lg text-sm leading-relaxed text-slate-400",
        children: "82 chapters covering personal development, relationships, ethics, society, and the philosophical questions of a well-lived life."
      })]
    }), chapters.length === 0 ? /* @__PURE__ */ jsx("p", {
      className: "text-slate-400",
      children: "No chapters found."
    }) : /* @__PURE__ */ jsx("div", {
      className: "grid gap-3 sm:grid-cols-2",
      children: chapters.map((chapter) => /* @__PURE__ */ jsxs(Link, {
        to: `/chapters/${chapter.slug}`,
        className: "group flex items-start gap-4 rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5 transition-colors hover:border-amber-500/30",
        children: [/* @__PURE__ */ jsx("span", {
          className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#1c2338] bg-[#10131f] text-[11px] font-bold text-slate-500 group-hover:border-amber-500/25 group-hover:text-amber-400 transition-colors",
          children: String(chapter.order).padStart(2, "0")
        }), /* @__PURE__ */ jsxs("div", {
          className: "min-w-0",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-sm font-bold leading-snug text-white group-hover:text-amber-400 transition-colors",
            children: chapter.title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2",
            children: chapter.description
          })]
        })]
      }, chapter.slug))
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: chapters__index,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  params
}) {
  const chapter = getChapter(params.slug);
  if (!chapter) throw new Response("Not Found", {
    status: 404
  });
  const all = getAllChapters();
  const idx = all.findIndex((c) => c.slug === params.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const related = all.filter((c) => c.slug !== params.slug).slice(Math.max(0, idx - 2), idx + 2).filter((c) => c.slug !== params.slug).slice(0, 3);
  return {
    chapter,
    prev,
    next,
    related
  };
}
function meta({
  data
}) {
  if (!data) return [{
    title: "Chapter Not Found — Ethos"
  }];
  const {
    chapter
  } = data;
  return [{
    title: `${chapter.title} — Ethos`
  }, {
    name: "description",
    content: chapter.description
  }, {
    name: "robots",
    content: "index, follow"
  }, {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: chapter.title,
      description: chapter.description,
      isPartOf: {
        "@type": "Book",
        name: "Ethos"
      }
    }
  }];
}
const chapters_$slug = UNSAFE_withComponentProps(function ChapterPost() {
  const {
    chapter,
    prev,
    next,
    related
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-6",
    children: [/* @__PURE__ */ jsxs("nav", {
      className: "flex items-center gap-2 text-xs text-slate-500",
      children: [/* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "hover:text-slate-300 transition-colors",
        children: "Home"
      }), /* @__PURE__ */ jsx("span", {
        children: "/"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/chapters",
        className: "hover:text-slate-300 transition-colors",
        children: "Chapters"
      }), /* @__PURE__ */ jsx("span", {
        children: "/"
      }), /* @__PURE__ */ jsx("span", {
        className: "text-slate-400 truncate",
        children: chapter.title
      })]
    }), /* @__PURE__ */ jsxs("article", {
      className: "rounded-2xl border border-[#1c2338] bg-[#0d1019] p-7 sm:p-10",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "mb-8 border-b border-[#1c2338] pb-8",
        children: [/* @__PURE__ */ jsxs("p", {
          className: "text-[11px] font-medium text-amber-400/70",
          children: ["Chapter ", String(chapter.order).padStart(2, "0")]
        }), /* @__PURE__ */ jsx("h1", {
          className: "mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl",
          children: chapter.title
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-3 text-base leading-relaxed text-slate-400",
          children: chapter.description
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "prose",
        dangerouslySetInnerHTML: {
          __html: chapter.html
        }
      })]
    }), /* @__PURE__ */ jsxs("nav", {
      className: "grid gap-3 sm:grid-cols-2",
      children: [prev ? /* @__PURE__ */ jsxs(Link, {
        to: `/chapters/${prev.slug}`,
        className: "group flex items-center gap-3 rounded-xl border border-[#1c2338] bg-[#0d1019] p-4 transition-colors hover:border-amber-500/30",
        children: [/* @__PURE__ */ jsx("span", {
          className: "text-lg text-slate-500 group-hover:text-amber-400 transition-colors",
          children: "←"
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-[10px] text-slate-500",
            children: "Previous chapter"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm font-semibold text-slate-200 group-hover:text-white transition-colors",
            children: prev.title
          })]
        })]
      }) : /* @__PURE__ */ jsx("div", {}), next ? /* @__PURE__ */ jsxs(Link, {
        to: `/chapters/${next.slug}`,
        className: "group flex items-center justify-end gap-3 rounded-xl border border-[#1c2338] bg-[#0d1019] p-4 text-right transition-colors hover:border-amber-500/30 sm:col-start-2",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-[10px] text-slate-500",
            children: "Next chapter"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm font-semibold text-slate-200 group-hover:text-white transition-colors",
            children: next.title
          })]
        }), /* @__PURE__ */ jsx("span", {
          className: "text-lg text-slate-500 group-hover:text-amber-400 transition-colors",
          children: "→"
        })]
      }) : null]
    }), related.length > 0 && /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("p", {
        className: "mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500",
        children: "Related Chapters"
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-3 sm:grid-cols-3",
        children: related.map((c) => /* @__PURE__ */ jsxs(Link, {
          to: `/chapters/${c.slug}`,
          className: "group rounded-xl border border-[#1c2338] bg-[#0d1019] p-4 transition-colors hover:border-amber-500/30",
          children: [/* @__PURE__ */ jsxs("p", {
            className: "text-[11px] text-slate-500",
            children: ["Chapter ", String(c.order).padStart(2, "0")]
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-1.5 text-sm font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors",
            children: c.title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed",
            children: c.description
          })]
        }, c.slug))
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7 text-center",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-base font-bold text-white",
        children: "Continue reading Ethos"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-2 text-sm leading-relaxed text-slate-400",
        children: "82 chapters covering every domain of a well-lived life. Free to read."
      }), /* @__PURE__ */ jsx(Link, {
        to: "/chapters",
        className: "gold-btn mt-5 inline-block rounded-xl px-8 py-3 text-sm font-bold",
        children: "Browse All Chapters"
      })]
    }), /* @__PURE__ */ jsx(Link, {
      to: "/chapters",
      className: "block text-sm text-slate-500 hover:text-slate-300 transition-colors",
      children: "← Back to all chapters"
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: chapters_$slug,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DBMJkjs_.js", "imports": ["/assets/chunk-LFPYN7LY-BJCondou.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-BoUVUHlp.js", "imports": ["/assets/chunk-LFPYN7LY-BJCondou.js"], "css": ["/assets/root-N39C8DvA.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-CqhC4Tdi.js", "imports": ["/assets/chunk-LFPYN7LY-BJCondou.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/chapters._index": { "id": "routes/chapters._index", "parentId": "root", "path": "chapters", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/chapters._index-CTMlTibH.js", "imports": ["/assets/chunk-LFPYN7LY-BJCondou.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/chapters.$slug": { "id": "routes/chapters.$slug", "parentId": "root", "path": "chapters/:slug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/chapters._slug-BUwHKn3K.js", "imports": ["/assets/chunk-LFPYN7LY-BJCondou.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-0ae0f1dc.js", "version": "0ae0f1dc", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/chapters._index": {
    id: "routes/chapters._index",
    parentId: "root",
    path: "chapters",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/chapters.$slug": {
    id: "routes/chapters.$slug",
    parentId: "root",
    path: "chapters/:slug",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
