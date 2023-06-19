import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import Icons from "unplugin-icons/vite"
import { crx, ManifestV3Export } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import { version } from "./package.json"
import iconStyles from "./src/popup/Icon.module.css"

export default defineConfig( ( { mode } ) => {
    const configs = {
        development: {
            build: {
                rollupOptions: {
                    input: [ "src/popup/index.html", "src/offscreen.html" ],
                },
            },
            plugins: [ react(), Icons( { compiler: "jsx" } ) ],
            server: {
                open: "src/popup/index.html",
            },
            worker: {
                format: "es"
            },
        },
        extension: {
            build: {
                rollupOptions: {
                    input: [ "src/offscreen.html" ],
                },
            },
            plugins: [ react(), Icons( { compiler: "jsx", scale: 24 / 18 } ), crx( { manifest: { ...manifest, version } as ManifestV3Export } ) ],
            worker: {
                format: "es"
            },
        },
        web: {
            plugins: [ react(), Icons( { compiler: "jsx" } ) ]
        }
    }
    if ( mode in configs )
        return configs[ mode ]
    else
        throw new Error( `Unknown mode: ${ mode }.` )
} )
