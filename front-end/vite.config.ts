// front-end/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "/default-risk/",
    build: {
        outDir: "../dist", // Go up one level to write to root-level dist/
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                fail: resolve(__dirname, "fail.html"),
                pass: resolve(__dirname, "pass.html"),
            },
        },
    },
});
