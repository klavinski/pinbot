import { z } from "zod"
import Worker from "./worker.ts?worker"
const worker = new Worker()

import * as browser from "webextension-polyfill"
import { Query, queryParser, storeParser } from "./popup/types.ts"
import { split } from "./utils.ts"

const iframe = document.querySelector( "iframe" )!
const sandbox = new Promise<Window>( ( resolve, reject ) => {
    window.addEventListener( "message", () => {
        iframe.contentWindow ? resolve( iframe.contentWindow ) : reject( "No contentWindow" )
    }, { once: true } )
} )
iframe.src = browser.runtime.getURL( "src/sandbox.html" )

const embed = ( text: string ) => text === "" ? Promise.resolve( null ) : new Promise<Float32Array | null>( async resolve => {
    const controller = new AbortController()
    window.addEventListener( "message", ( { data } ) => {
        try {
            const { embeddings } = z.object( { text: z.literal( text ), embeddings: z.instanceof( Float32Array ) } ).parse( data )
            controller.abort()
            resolve( embeddings )
        }
        catch ( e ) {}
    }, { signal: controller.signal } );
    ( await sandbox ).postMessage( text, "*" )
} )

const search = ( query: Query & { embeddings: Float32Array | null } ) => new Promise( async resolve => {
    const controller = new AbortController()
    worker.addEventListener( "message", ( { data } ) => {
        console.log( "received in offscreen", data, "matching with", query )
        const parsing = z.object( { query: z.object( Object.fromEntries( Object.entries( query ).map( ( [ k, v ] ) => [ k, v instanceof Float32Array ? z.instanceof( Float32Array ) : z.literal( v ) ] ) ) ), results: z.array( z.unknown() ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data.results )
        }
    }, { signal: controller.signal } )
    worker.postMessage( query )
} )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    const queryParsing = queryParser.safeParse( message )
    if ( queryParsing.success ) {
        embed( queryParsing.data.query ).then( embeddings => search( { ...queryParsing.data, embeddings } ) ).then( sendResponse )
        return true
    }
    const storeParsing = storeParser.safeParse( message )
    const title = sender.tab?.title
    const url = sender.tab?.url
    if ( storeParsing.success && title && url ) {
        Promise.all( [ title, ...split( storeParsing.data.body ) ].map( async sentence => ( { embeddings: await embed( sentence ), text: sentence } ) ) ).then( async sentences =>
            worker.postMessage( { store: { body: storeParsing.data.body, embeddings: await embed( storeParsing.data.body ), sentences, title, url } } )
        )
    }
    console.log( "received in offscreen", message )
} )
