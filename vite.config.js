import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import * as sass from "sass";

export default defineConfig({
  base: "./",
  root: "src",

  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@use "/sass/settings/variables" as *\n`,
      },
    },
  },

  plugins: [
    {
      name: "inline-critical-sass",
      handleHotUpdate({ file, server }) {
        const normalizedPath = file.replace(/\\/g, "/");
        if (normalizedPath.includes("src/sass")) {
          server.ws.send({ type: "full-reload" });
          return [];
        }
      },
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          const pageName = ctx.filename
            .split(/[\\/]/)
            .pop()
            .replace(".html", "");

          let sassPath = resolve(__dirname, `src/sass/${pageName}.critical.sass`);

          if (!fs.existsSync(sassPath)) {
            sassPath = resolve(__dirname, "src/sass/critical.sass");
          }

          if (fs.existsSync(sassPath)) {
            try {
              const sassContent = fs.readFileSync(sassPath, "utf8");
              const additionalData = `@use "sass/settings/variables" as *\n`;

              const result = sass.compileString(additionalData + sassContent, {
                syntax: "indented",
                style: "compressed",
                loadPaths: [
                  resolve(__dirname, "src"),
                  resolve(__dirname, "src/sass"),
                ],
              });

              html = html.replace(
                "</head>",
                `<style id="critical-css">${result.css}</style></head>`
              );
            } catch (error) {
              console.error(`\n❌ Ошибка компиляции критических стилей для страницы [${pageName}]:\n`, error.message);
              
              if (process.env.NODE_ENV === "production") {
                throw error; 
              } else {
                const errorHtml = `
                  <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);color:#ff5555;padding:40px;font-family:monospace;z-index:99999;overflow:auto;font-size:16px;line-height:1.5;">
                    <h2 style="color:#ff3333;margin-top:0;">Sass Compilation Error [${pageName}.critical.sass]</h2>
                    <pre style="background:#1a1a1a;padding:20px;border-radius:8px;border:1px solid #333;white-space:pre-wrap;">${error.stack || error.message}</pre>
                    <p style="color:#888;">Исправь ошибку в Sass-файле, и страница перезагрузится автоматически.</p>
                  </div>
                `;
                html = html.replace("<body>", `<body>${errorHtml}`);
              }
            }
          }

          html = html.replace(
            /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+\.(?:core|main|css)[^"]*)"\s*>/g,
            '<link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'">'
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

    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        category: resolve(__dirname, "src/category.html"),
        tour: resolve(__dirname, "src/tour.html"),
        // categories: resolve(__dirname, "src/categories.html"),
      },

      output: {
        entryFileNames: "assets/js/[name].js",
        chunkFileNames: "assets/js/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            if (assetInfo.name.includes("core")) {
              return "assets/css/core.css";
            }
            return "assets/css/[name].css";
          }

          if (assetInfo.name && /\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return "assets/fonts/[name].[ext]";
          }

          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(assetInfo.name)) {
            return "assets/images/[name].[ext]";
          }

          return "assets/[name].[ext]";
        },
      },
    },
  },

  server: {
    watch: {
      usePolling: true,
    },
  },
});