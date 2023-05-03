import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"

export default defineConfig( ( { mode } ) => {
    const configs = {
        extension: {
            build: {
                rollupOptions: {
                    input: [ "src/offscreen.html" ],
                },
            },
            plugins: [ react(), crx( { manifest } ) ],
            worker: {
                format: "es"
            },
        },
        web: {
            plugins: [ react() ]
        }
    }
    if ( mode in configs )
        return configs[ mode ]
    else
        throw new Error( `Unknown mode: ${ mode }.` )
} )
