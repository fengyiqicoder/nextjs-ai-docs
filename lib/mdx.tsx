import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx-components";

// Compiles a page at build time. The output is static HTML: no MDX runtime ships to the browser.
export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false, defaultLang: "plaintext" }],
    ],
  });
  return <Content components={mdxComponents} />;
}
