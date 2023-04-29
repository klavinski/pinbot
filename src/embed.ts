import browser from "webextension-polyfill"
import { z } from "zod"

const iframe = document.querySelector( "iframe" )!
const sandbox = new Promise<Window>( ( resolve, reject ) => {
    window.addEventListener( "message", () => {
        iframe.contentWindow ? resolve( iframe.contentWindow ) : reject( "No contentWindow" )
    }, { once: true } )
} )
iframe.src = browser.runtime.getURL( "src/sandbox.html" )

const embedWithoutCache = ( text: string ) => new Promise<Float32Array>( async resolve => {
    const controller = new AbortController()
    window.addEventListener( "message", ( { data } ) => {
        const parsing = z.object( { text: z.literal( text ), embeddings: z.instanceof( Float32Array ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data.embeddings )
        }
    }, { signal: controller.signal } );
    ( await sandbox ).postMessage( text, "*" )
} )

const cache = new Map<string, Float32Array>()

export const embed = async ( text: string ) => {
    if ( ! cache.has( text ) )
        cache.set( text, await embedWithoutCache( text ) )
    return cache.get( text )!
}
