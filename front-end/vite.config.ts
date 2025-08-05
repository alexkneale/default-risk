import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    base: "/default-risk/",
    root: "front-end", // point to your front-end folder
    build: {
        outDir: "../dist", // put build output in root-level dist/
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "front-end/index.html"),
                fail: resolve(__dirname, "front-end/fail.html"),
                pass: resolve(__dirname, "front-end/pass.html"),
            },
        },
    },
});
