import { Link } from "react-router";

const PILLARS = [
  {
    label: "Personal",
    chapters: "Discipline, Purpose, Resilience, Mindfulness, Sleep, Fitness",
    description: "Build the inner foundations that make everything else possible.",
    color: "amber",
  },
  {
    label: "Relational",
    chapters: "Marriage, Friendship, Parenting, Mentorship, Community",
    description: "Understand what you owe the people closest to you.",
    color: "indigo",
  },
  {
    label: "Societal",
    chapters: "Leadership, Charity, Justice, Teamwork, Networking",
    description: "Extend your responsibility beyond yourself.",
    color: "emerald",
  },
  {
    label: "Ethical",
    chapters: "Integrity, Honesty, Accountability, Transparency, Courage",
    description: "Hold yourself to a standard that survives scrutiny.",
    color: "violet",
  },
  {
    label: "Philosophical",
    chapters: "Legacy, Wisdom, Meaning-Making, Transcendence, Hope",
    description: "Think in longer arcs than most people are trained to use.",
    color: "sky",
  },
];

const FEATURED_CHAPTERS = [
  { slug: "purpose", title: "Purpose", description: "Purpose is the decision to take your life seriously. Most people live reactively — purpose is the deliberate override." },
  { slug: "discipline", title: "Discipline", description: "Discipline is not punishment. It is the bridge between what you intend and what you actually do." },
  { slug: "integrity", title: "Integrity", description: "Your values, your words, and your actions must align. This is harder than it sounds." },
  { slug: "resilience", title: "Resilience", description: "What matters is not whether adversity arrives — it will — but how you move through it." },
  { slug: "wisdom", title: "Wisdom", description: "Wisdom is the ability to act well in the face of incomplete information and irreversible consequences." },
  { slug: "legacy", title: "Legacy", description: "Legacy is not about being remembered. It is about the direction in which your life pushed things." },
];

const STATS = [
  { value: "82", label: "Chapters" },
  { value: "5", label: "Pillars" },
  { value: "Free", label: "To Read" },
  { value: "Secular", label: "Framework" },
];

export function meta() {
  return [
    { title: "Ethos — A Framework for the Well-Lived Life" },
    {
      name: "description",
      content:
        "Ethos is a secular framework for living with intention, integrity, and a long view. 82 chapters covering discipline, relationships, ethics, and meaning.",
    },
    { name: "robots", content: "index, follow" },
  ];
}

export default function HomePage() {
  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl border border-[#1c2338] bg-[#0d1019] px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold text-amber-400">{value}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1c2338] bg-[#0d1019] p-8 shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-600/5 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Ethosism — A Secular Philosophy for Modern Life
          </span>

          <h2 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
            What does it mean{" "}
            <span className="text-amber-400">to live well?</span>
          </h2>

          <p className="mt-5 text-[15px] leading-relaxed text-slate-300 max-w-xl">
            Not in abstract terms — but concretely. Chapter by chapter, domain by domain: how to
            manage your time, how to treat the people you love, what honesty actually demands, how
            to face adversity without it breaking you.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xl">
            Ethos makes no claims about the supernatural and draws from philosophy, psychology, and
            hard-won collective experience without belonging to any tradition exclusively. It is
            secular. It is rigorous. It is free to read.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/chapters"
              className="gold-btn rounded-xl px-7 py-3 text-sm font-bold"
            >
              Read the Chapters
            </Link>
            <Link
              to="/chapters/introduction"
              className="rounded-xl border border-[#1c2338] px-6 py-3 text-sm font-medium text-slate-300 hover:border-amber-500/30 hover:text-white transition-colors"
            >
              Start with the Introduction
            </Link>
          </div>
        </div>
      </section>

      {/* Five Pillars */}
      <section>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Five Pillars
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ label, chapters, description }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{label}</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-slate-100">{description}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{chapters}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Chapters */}
      <section>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Featured Chapters
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CHAPTERS.map(({ slug, title, description }) => (
            <Link
              key={slug}
              to={`/chapters/${slug}`}
              className="group block rounded-2xl border border-[#1c2338] bg-[#0d1019] p-5 transition-colors hover:border-amber-500/30"
            >
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              <p className="mt-4 text-xs font-semibold text-amber-400/70 group-hover:text-amber-400 transition-colors">
                Read chapter →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* What this is / is not */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#1c2338] bg-[#0d1019] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
            What Ethos Is
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {[
              "A concrete, domain-by-domain guide to living well",
              "Grounded in evidence, reason, and human experience",
              "Honest about what is hard and what is uncertain",
              "Written to be tested against real decisions",
              "Free to read, share, and discuss",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[#1c2338] bg-[#0d1019] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            What Ethos Is Not
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {[
              "A religion or spiritual tradition",
              'A self-help book promising transformation in 30 days',
              "A philosophy only for seminars or academics",
              "A set of principles too vague to apply",
              "A system that requires agreement on everything",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <p className="text-lg font-bold text-white">
          Ready to examine how you live?
        </p>
        <p className="mt-2 max-w-md mx-auto text-sm leading-relaxed text-slate-400">
          Goodness is not a mystery. The 82 chapters of Ethos lay out, domain by domain, what a
          well-lived life actually looks like.
        </p>
        <Link
          to="/chapters"
          className="gold-btn mt-6 inline-block rounded-xl px-8 py-3 text-sm font-bold"
        >
          Browse All Chapters
        </Link>
        <p className="mt-3 text-xs text-slate-500">Free to read. No account required.</p>
      </section>
    </div>
  );
}
