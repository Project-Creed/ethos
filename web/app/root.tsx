import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./app.css";

export function links() {
  return [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-indigo-400/6 blur-[120px]" />
      </div>

      <header className="top-bar relative z-10">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-50">
            <span className="text-base font-bold text-amber-600">E</span>
          </div>
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
              A Framework for Living
            </p>
            <h1 className="m-0 text-xl font-bold text-slate-900">Ethos</h1>
          </div>
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="/chapters"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Chapters
          </a>
        </nav>
      </header>

      <main className="content relative z-10">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-16 border-t border-[#e4ddd2] pb-8 pt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-50">
              <span className="text-sm font-bold text-amber-600">E</span>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Ethos</p>
              <p className="mt-0.5 text-xs text-slate-500">
                A secular framework for the well-lived life.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-500 sm:text-right">
            <p>81 chapters across 5 pillars</p>
            <p>Personal &bull; Relational &bull; Societal &bull; Ethical &bull; Spiritual</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[#e4ddd2] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Ethos. Licensed under{" "}
            <span className="text-slate-500">CC BY-NC-ND 4.0</span>.
          </p>
          <a
            href="/chapters"
            className="text-xs text-slate-500 hover:text-amber-700 transition-colors"
          >
            Read all chapters →
          </a>
        </div>
      </footer>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-slate-600">Please try refreshing the page.</p>
      </div>
    </div>
  );
}
