import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"

export default defineConfig( {
    build: {
        rollupOptions: {
            input: [ "src/offscreen.html" ],
        },
    },
    plugins: [
        react(),
        crx( { manifest } ),
    ],
    worker: {
        format: "es"
    }
} )
