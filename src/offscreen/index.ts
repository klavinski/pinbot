import { z } from "zod"
import { api } from "./api.ts"

const call = async <F extends ( ...args: T ) => unknown, T extends unknown[]>( f: F, args: T ) => await f( ...args )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    console.log( message )
    for ( const [ key, handler ] of Object.entries( api ) ) {
        const parsing = z.object( { [ key ]: z.any().array() } ).safeParse( message )
        if ( parsing.success )
            call( handler, parsing.data[ key ] ).then( _ => { console.log( "returning", _ ); sendResponse( _ ) } )
    }
    return true
} )
