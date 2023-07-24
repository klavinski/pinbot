import { z } from "zod"
import { api } from "./api.ts"

const call = async <F extends ( ...args: T ) => unknown, T extends unknown[]>( f: F, args: T ) => await f( ...args )

let counter = 0
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    const localCounter = counter ++
    console.log( localCounter, "got", message )
    for ( const [ key, handler ] of Object.entries( api ) ) {
        const parsing = z.object( { [ key ]: z.any().array() } ).safeParse( message )
        if ( parsing.success )
            call( handler, parsing.data[ key ] ).then( _ => { console.log( localCounter, "returning", _ ); sendResponse( _ ) } )
    }
    return true
} )
