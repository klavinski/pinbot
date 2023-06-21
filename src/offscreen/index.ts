
// import { Query, queryParser, storeParser } from "./types.ts"
// import { cosineSimilarity, mixEmbeddings, split, tokenize } from "./utils.ts"

// const search = async ( { exact, from, query, to, url }: Query ) => {
//     // const words = tokenize( exact )
//     // const excludeIndex = words.findIndex( _ => _.startsWith( "-" ) )
//     // const [ include, exclude ] = excludeIndex === - 1 ? [ words, [] ] : [ words.slice( 0, excludeIndex ), words.slice( excludeIndex ).filter( _ => _ !== "-" ).map( word => word.replace( /^-/, "" ) ) ]
//     const pages = await sql`
//         SELECT * FROM pages
//         WHERE url GLOB '*' || ${ url } || '*'
//         AND DATE( added ) >= DATE( ${ from ?? 0 } )
//         AND DATE( seen ) <= DATE( ${ to ?? "now" }, '+1 day' );`
//     const embeddings = await embed( query )
//     return ( await Promise.all( pages.map( async page => {
//         // const body = tokenize( ( await sql`SELECT GROUP_CONCAT( text, CHAR( 10 ) ) AS body FROM pages WHERE url = ${ page.url } AND seen = ${ page.seen } AND title = ${ page.title }` )[ 0 ].body )
//         // if ( include.every( word => body.some( _ => _ === word ) ) && exclude.every( word => body.every( _ => _ !== word ) ) )
//         return {
//             ...page,
//             score: cosineSimilarity( new Float32Array( page.embeddings.buffer ), embeddings )
//         }
//         // return "exclude"
//     } ) ) )
//         // .filter( _ => _ !== "exclude" )
//         .sort( ( a, b ) => ( b.score - a.score ) ).slice( 0, 10 )
// }
// const store = async ( { body, title, url }: { body: string, title: string, url: string } ) => {
//     const now = ( await sql`SELECT DATETIME( 'now' ) AS now;` )[ 0 ].now
//     const triplets = [ "\n" + title + "\n", ...split( body ).map( ( sentence, index, sentences ) => [ sentences[ index - 1 ] ?? "", sentence, sentences[ index + 1 ] ?? "" ].join( "\n" ) ) ]
//     const sentencesInDb = await sql`SELECT * FROM pages WHERE url = ${ url } AND removed IS NULL AND title = ${ title }`
//     for ( const { text } of sentencesInDb )
//         if ( triplets.includes( text ) )
//             await sql`UPDATE pages SET seen = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text } AND title = ${ title }`
//         else
//             await sql`UPDATE pages SET removed = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text } AND title = ${ title }`
//     console.log( "sentences in db", sentencesInDb, triplets )
//     for ( const triplet of triplets.filter( text => ! sentencesInDb.map( _ => _.text ).includes( text ) ).map( _ => _.split( "\n" ) ) )
//         await sql`INSERT INTO pages ( added, embeddings, seen, text, title, url ) VALUES ( datetime( ${ now } ), ${ mixEmbeddings( await embed( title ), await embed( triplet[ 0 ] ), await embed( triplet[ 1 ] ), await embed( triplet[ 2 ] ) ).buffer }, datetime( ${ now } ), ${ triplet.join( "\n" ) }, ${ title }, ${ url } );`
//     console.log( "current pages", await sql`SELECT * FROM pages;` )
// }
import { z } from "zod"
import { api } from "./api.ts"

const call = async <F extends ( ...args: T ) => unknown, T extends unknown[]>( f: F, args: T ) => await f( ...args )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    console.log( message )
    for ( const [ key, handler ] of Object.entries( api ) ) {
        const parsing = z.object( { [ key ]: z.any().array() } ).safeParse( message )
        if ( parsing.success )
            call( handler, parsing.data[ key ] ).then( sendResponse )
    }
    return true
} )
