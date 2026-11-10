// Serves the static export in out/ at http://localhost:3000, the way a static host would.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".wasm": "application/wasm", ".pf_meta": "application/octet-stream",
  ".pf_index": "application/octet-stream", ".pf_fragment": "application/octet-stream", ".pagefind": "application/octet-stream",
};

if (!fs.existsSync(root)) {
  console.error("No out/ folder. Run npm run build first.");
  process.exit(1);
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.endsWith("/")) return res.writeHead(308, { Location: url + "/" }).end();
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": types[".html"] });
      return fs.createReadStream(path.join(root, "404.html")).pipe(res);
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Serving out/ at http://localhost:${port}`));
