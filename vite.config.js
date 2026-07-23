import { defineConfig } from "vite";
import { resolve, dirname, basename } from "path";
import fs from "fs";
import * as sass from "sass";

// Автоматически находим все HTML файлы в папке src и делаем из них точки входа
function getHtmlEntries() {
  const srcDir = resolve(__dirname, "src");
  const files = fs.readdirSync(srcDir);
  const entries = {};

  files.forEach((file) => {
    if (file.endsWith(".html")) {
      const name = basename(file, ".html");
      // Имя ключа будет строго совпадать с именем файла (index, categories, about и т.д.)
      entries[name] = resolve(srcDir, file);
    }
  });

  return entries;
}

function criticalCssPlugin() {
  return {
    name: "vite-plugin-critical-inline",
    transformIndexHtml(html, ctx) {
      const pageName = basename(ctx.filename, ".html");
      const criticalPath = resolve(process.cwd(), `src/sass/${pageName}.critical.sass`);

      try {
        if (fs.existsSync(criticalPath)) {
          const result = sass.compile(criticalPath, {
            style: "compressed",
            loadPaths: [dirname(criticalPath)],
          });

          html = html.replace("</head>", `<style data-critical="${pageName}">${result.css}</style>\n</head>`);
        }
      } catch (e) {
        console.error(`Ошибка компиляции critical sass для [${pageName}]:`, e);
      }

      if (ctx.server) {
        return html.replace("</body>", '<script>document.body.classList.add("content-loaded")</script>\n</body>');
      }

      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\';document.body.classList.add(\'content-loaded\')">\n<noscript><link rel="stylesheet" href="$1"></noscript>'
      );
    },
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
      // Динамический сбор всех страниц из папки src/
      input: getHtmlEntries(),
      output: {
        // Управляем именами выходных файлов JS строго по имени точки входа
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },

  plugins: [criticalCssPlugin()],
});