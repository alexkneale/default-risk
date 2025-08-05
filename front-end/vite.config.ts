// front-end/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "/default-risk/",
    build: {
        outDir: "../dist",
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
