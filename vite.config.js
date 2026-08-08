import { defineConfig } from "vite";
import { resolve, basename } from "path";
import fs from "fs";
import htmlInject from "vite-plugin-html-inject";

// Автоматически находим все HTML файлы в папке src
function getHtmlEntries() {
  const srcDir = resolve(__dirname, "src");
  const files = fs.readdirSync(srcDir);
  const entries = {};

  files.forEach((file) => {
    if (file.endsWith(".html")) {
      const name = basename(file, ".html");
      entries[name] = resolve(srcDir, file);
    }
  });

  return entries;
}

// Плагин разделения стилей по новому CSS-маркеру
function splitCriticalCssPlugin() {
  return {
    name: "vite-plugin-split-critical",
    enforce: "post",
    
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html.replace('</body>', '<script>document.body.classList.add("content-loaded")</script>\n</body>');
      }
    },

    generateBundle(options, bundle) {
      const markerRegex = /#CRITICAL_END\s*\{[^}]*\}/;
      const criticalMap = {};

      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "asset" && fileName.endsWith(".css")) {
          let css = chunk.source.toString();
          const match = css.match(markerRegex);

          if (match) {
            const markerIndex = match.index;
            const markerLength = match[0].length;

            const criticalCss = css.substring(0, markerIndex).trim();
            const nonCriticalCss = css.substring(markerIndex + markerLength).trim();

            chunk.source = nonCriticalCss;
            
            const baseName = basename(fileName, '.css');
            criticalMap[baseName] = criticalCss;
          }
        }
      }

      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "asset" && fileName.endsWith(".html")) {
          let html = chunk.source.toString();
          const htmlBaseName = basename(fileName, '.html');
          
          if (criticalMap[htmlBaseName]) {
            const criticalCss = criticalMap[htmlBaseName];
            
            html = html.replace('</head>', `<style data-critical="${htmlBaseName}">\n${criticalCss}\n</style>\n</head>`);
            
            html = html.replace(
              /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
              (match, href) => `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet';document.body.classList.add('content-loaded')">\n<noscript><link rel="stylesheet" href="${href}"></noscript>`
            );
            
            chunk.source = html;
          }
        }
      }
    }
  };
}

export default defineConfig({
  base: "/",
  root: "src",
  publicDir: resolve(__dirname, "public"),

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: true,
    assetsInlineLimit: 0,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: getHtmlEntries(),
      output: {
        entryFileNames: "assets/js/[name].js",
        chunkFileNames: "assets/js/[name].js",

        
        
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || (assetInfo.names && assetInfo.names[0]);
          if (!name) return "assets/[name].[ext]";

          const extType = name.split('.').at(-1).toLowerCase();
          
          if (/png|jpe?g|svg|gif|webp|avif|ico/i.test(extType)) {
            let subDir = "";
            const originalPath = assetInfo.originalFileName || (assetInfo.originalFileNames && assetInfo.originalFileNames[0]);
            
            if (originalPath) {
              const normalizedPath = originalPath.replace(/\\/g, '/');
              const match = normalizedPath.match(/(?:images|img)\/(.+)\/[^/]+$/);
              if (match && match[1]) {
                subDir = match[1] + "/";
              }
            }
            return `assets/images/${subDir}[name].[ext]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name].[ext]`;
          }
          
          return `assets/media/[name].[ext]`;
        },
      },
    },
  },

  plugins: [
    htmlInject(),
    splitCriticalCssPlugin()
  ],
});