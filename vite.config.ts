import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import Icons from "unplugin-icons/vite"
import { crx, ManifestV3Export } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import { version } from "./package.json"
import { comlink } from "vite-plugin-comlink"

export default defineConfig( ( { mode } ) => {
    const configs = {
        extension: {
            build: {
                rollupOptions: {
                    input: [ "src/offscreen/index.html" ],
                },
            },
            plugins: [
                comlink(),
                react(),
                Icons( { compiler: "jsx", scale: 24 / 18 } ),
                crx( { manifest: { ...manifest, version } as ManifestV3Export } )
            ],
            worker: {
                plugins: [
                    comlink()
                ]
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
