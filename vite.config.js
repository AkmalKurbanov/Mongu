import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import * as sass from "sass";

export default defineConfig({
  base: "/",
  root: "src",
  publicDir: resolve(__dirname, "public"),

  plugins: [
    {
      name: "cleanup-and-inline",
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          const pageName = ctx.filename.split(/[\\/]/).pop().replace(".html", "");
          const isBuild = !!ctx.bundle; // Флаг: true - режим сборки, false - dev-режим
          const scriptsToMove = [];

          // 1. Собираем и вырезаем ВСЕ скрипты для переноса вниз (работает и в dev, и в build)
          html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
            // Оставляем системный скрипт Vite для работы Hot Reload в dev-режиме
            if (src.includes('@vite/client')) return match; 
            
            scriptsToMove.push(match);
            return ''; 
          });

          // 2. Инлайн критического CSS (РАБОТАЕТ ВСЕГДА)
          const sassPath = resolve(__dirname, `src/sass/${pageName}.critical.sass`);
          if (fs.existsSync(sassPath)) {
            try {
              let sassContent = fs.readFileSync(sassPath, "utf8");
              // В dev-режиме пути абсолютные (/assets/), в build - относительные (./assets/)
              sassContent = sassContent.replace(/url\(['"]?(?:\.\.\/|\.\/)*assets\//g, isBuild ? 'url("./assets/' : 'url("/assets/');
              
              const result = sass.compileString(sassContent, { 
                syntax: "indented", 
                style: "compressed", 
                loadPaths: [resolve(__dirname, "src/sass")] 
              });
              
              if (result.css.trim().length > 0) {
                html = html.replace(/<link\b/i, `<style>${result.css}</style>\n    $&`);
              }
            } catch (error) {
              console.error(`\n[ОШИБКА VITE] Не удалось скомпилировать ${pageName}.critical.sass:`, error.message);
            }
          } else {
            console.warn(`\n[ПРЕДУПРЕЖДЕНИЕ] Критический SASS не найден по пути: ${sassPath}`);
          }

          // 3. Обработка Критического JS
          if (isBuild) {
            // === РЕЖИМ СБОРКИ (BUILD) ===
            const criticalJsName = `${pageName}.critical`;
            const jsChunk = Object.values(ctx.bundle).find(asset => asset.type === 'chunk' && asset.name === criticalJsName);
            
            if (jsChunk) {
              const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${criticalJsName}[^"']*["'][^>]*><\\/script>`, 'i');
              html = html.replace(scriptRegex, '');
              scriptsToMove.push(`<script>${jsChunk.code}</script>`);
              delete ctx.bundle[jsChunk.fileName];
            }

            // ЖЕСТКАЯ ОЧИСТКА: Удаляем пустые CSS файлы
            Object.keys(ctx.bundle).forEach(key => {
              const asset = ctx.bundle[key];
              if (asset.type === 'asset' && asset.fileName.endsWith('.css')) {
                const content = asset.source.toString().trim();
                if (content.length === 0) {
                  const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${asset.fileName}["'][^>]*>`, 'gi');
                  html = html.replace(linkRegex, '');
                  delete ctx.bundle[key];
                }
              }
            });
          } else {
            // === РЕЖИМ РАЗРАБОТКИ (DEV) ===
            const criticalJsPath = resolve(__dirname, `src/js/${pageName}.critical.js`);
            if (fs.existsSync(criticalJsPath)) {
              // Если файл есть, принудительно подключаем его в HTML, чтобы Vite его увидел
              const devScriptTag = `<script type="module" src="/js/${pageName}.critical.js"></script>`;
              // Проверяем, чтобы не добавить дважды
              if (!scriptsToMove.some(s => s.includes(`${pageName}.critical.js`))) {
                scriptsToMove.push(devScriptTag);
              }
            }
          }

          // 4. Вставляем скрипты перед </body>
          if (scriptsToMove.length > 0) {
            html = html.replace('</body>', `\n    ${scriptsToMove.join('\n    ')}\n  </body>`);
          }

          // Добавь этот блок прямо перед 'return html;' в твоем handler
html = html.replace(
  /<link([^>]*)rel=["']stylesheet["']([^>]*)\/?>/gi,
  (match, p1, p2) => {
    // Если уже обработано — пропускаем
    if (match.includes('onload=')) return match;

    // Метод: загрузка с media="print" и переключение на "all" через JS
    // Это стандарт для Google PageSpeed, он самый стабильный
    return `<link${p1}rel="stylesheet" media="print" onload="this.onload=null;this.media='all'"` + 
           `${p2}>` +
           `<noscript><link rel="stylesheet"${p1}${p2}></noscript>`;
  }
);

          return html;
        },
      },
    },
  ],

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    modulePreload: false,
    cssCodeSplit: true,
    minify: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        category: resolve(__dirname, "src/category.html"),
        tour: resolve(__dirname, "src/tour.html"),
        categories: resolve(__dirname, "src/categories.html"),
        "tour.critical": resolve(__dirname, "src/js/tour.critical.js"),
      },
      output: {
        entryFileNames: "assets/js/[name].js",
        chunkFileNames: "assets/js/[name].js",
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith(".css")) return "assets/css/[name]-[hash].css";
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) return "assets/fonts/[name].[ext]";
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(assetInfo.name)) return "assets/images/[name].[ext]";
          return "assets/[name].[ext]";
        },
      },
    },
  },
});