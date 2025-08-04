import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: "/alexkneale/default-risk/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
