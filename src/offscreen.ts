import { init } from "./sql.ts"
import { embed } from "./embed.ts"
import { Query, queryParser, storeParser } from "./types.ts"
import { cosineSimilarity, mixEmbeddings, split, tokenize } from "./utils.ts"

const sql = init`CREATE TABLE IF NOT EXISTS pages ( added TEXT, embeddings BLOB, removed TEXT, seen TEXT, text TEXT, title TEXT, url TEXT );
DELETE FROM pages WHERE DATETIME( seen ) <= DATETIME( 'now', '-14 days' );`

const search = async ( { exact, from, query, to, url }: Query ) => {
    // const words = tokenize( exact )
    // const excludeIndex = words.findIndex( _ => _.startsWith( "-" ) )
    // const [ include, exclude ] = excludeIndex === - 1 ? [ words, [] ] : [ words.slice( 0, excludeIndex ), words.slice( excludeIndex ).filter( _ => _ !== "-" ).map( word => word.replace( /^-/, "" ) ) ]
    const pages = await sql`
        SELECT * FROM pages
        WHERE url GLOB '*' || ${ url } || '*'
        AND DATE( added ) >= DATE( ${ from ?? 0 } )
        AND DATE( seen ) <= DATE( ${ to ?? "now" }, '+1 day' );`
    const embeddings = await embed( query )
    return ( await Promise.all( pages.map( async page => {
        // const body = tokenize( ( await sql`SELECT GROUP_CONCAT( text, CHAR( 10 ) ) AS body FROM pages WHERE url = ${ page.url } AND seen = ${ page.seen } AND title = ${ page.title }` )[ 0 ].body )
        // if ( include.every( word => body.some( _ => _ === word ) ) && exclude.every( word => body.every( _ => _ !== word ) ) )
        return {
            ...page,
            score: cosineSimilarity( new Float32Array( page.embeddings.buffer ), embeddings )
        }
        // return "exclude"
    } ) ) )
        // .filter( _ => _ !== "exclude" )
        .sort( ( a, b ) => ( b.score - a.score ) ).slice( 0, 10 )
}
const store = async ( { body, title, url }: { body: string, title: string, url: string } ) => {
    const now = ( await sql`SELECT DATETIME( 'now' ) AS now;` )[ 0 ].now
    const triplets = [ "\n" + title + "\n", ...split( body ).map( ( sentence, index, sentences ) => [ sentences[ index - 1 ] ?? "", sentence, sentences[ index + 1 ] ?? "" ].join( "\n" ) ) ]
    const sentencesInDb = await sql`SELECT * FROM pages WHERE url = ${ url } AND removed IS NULL AND title = ${ title }`
    for ( const { text } of sentencesInDb )
        if ( triplets.includes( text ) )
            await sql`UPDATE pages SET seen = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text } AND title = ${ title }`
        else
            await sql`UPDATE pages SET removed = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text } AND title = ${ title }`
    console.log( "sentences in db", sentencesInDb, triplets )
    for ( const triplet of triplets.filter( text => ! sentencesInDb.map( _ => _.text ).includes( text ) ).map( _ => _.split( "\n" ) ) )
        await sql`INSERT INTO pages ( added, embeddings, seen, text, title, url ) VALUES ( datetime( ${ now } ), ${ mixEmbeddings( await embed( title ), await embed( triplet[ 0 ] ), await embed( triplet[ 1 ] ), await embed( triplet[ 2 ] ) ).buffer }, datetime( ${ now } ), ${ triplet.join( "\n" ) }, ${ title }, ${ url } );`
    console.log( "current pages", await sql`SELECT * FROM pages;` )
}

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    const queryParsing = queryParser.safeParse( message )
    if ( queryParsing.success ) {
        search( queryParsing.data ).then( sendResponse )
        return true
    }
    const storeParsing = storeParser.safeParse( message )
    const title = sender.tab?.title
    const url = sender.tab?.url
    if ( storeParsing.success && title && url )
        store( { body: storeParsing.data.body, title, url } )
    console.log( "received in offscreen", message )
} )
