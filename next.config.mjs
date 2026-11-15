const isPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site: works on GitHub Pages and Vercel alike.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Project pages are served under /<repo>.
  basePath: isPages ? "/atama-ga-amata" : "",
};

export default nextConfig;
