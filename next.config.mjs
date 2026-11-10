/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes plain HTML to out/, then scripts/postbuild.mjs
  // adds the Pagefind search index and llms.txt / llms-full.txt to the same folder.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
