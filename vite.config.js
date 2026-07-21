import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import fs from "fs";
import * as sass from "sass";

function criticalCssPlugin() {
  return {
    name: "vite-plugin-critical-inline",
    transformIndexHtml(html, ctx) { // <-- Добавили аргумент ctx
      const criticalPath = resolve(process.cwd(), "src/sass/index.critical.sass");

      try {
        if (fs.existsSync(criticalPath)) {
          const result = sass.compile(criticalPath, {
            style: "compressed",
            loadPaths: [dirname(criticalPath)]
          });
          
          html = html.replace(
            "</head>",
            `<style data-critical="true">${result.css}</style>\n</head>`
          );
        }
      } catch (e) {
        console.error("Ошибка компиляции critical sass:", e);
      }

      // Если мы находимся в режиме DEV (запущен локальный сервер)
      if (ctx.server) {
        // Просто сразу снимаем "завесу", добавляя класс через микро-скрипт перед закрытием body
        return html.replace(
          '</body>',
          '<script>document.body.classList.add("content-loaded")</script>\n</body>'
        );
      }

      // Если мы в режиме BUILD (продакшен)
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
  },

  plugins: [criticalCssPlugin()],
});
