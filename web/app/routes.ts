import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("chapters", "routes/chapters._index.tsx"),
  route("chapters/:slug", "routes/chapters.$slug.tsx"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
] satisfies RouteConfig;
