import { init } from "./sql.ts"
import { embed } from "./embed.ts"
import { Query, queryParser, storeParser } from "./types.ts"
import { cosineSimilarity, split, tokenize } from "./utils.ts"

const sql = init`CREATE TABLE IF NOT EXISTS pages ( added TEXT, embeddings BLOB, removed TEXT, seen TEXT, text TEXT, url TEXT );
DELETE FROM pages WHERE DATETIME( seen ) <= DATETIME( 'now', '-14 days' );`
const search = async ( { exact, from, query, to, url }: Query ) => {
    const pages = await sql`
        SELECT * FROM pages
        WHERE url GLOB '*' || ${ url } || '*'
        AND DATE( added ) >= DATE( ${ from ?? 0 } )
        AND DATE( seen ) <= DATE( ${ to ?? "now" }, '+1 day' );`
    const embeddings = await embed( query )
    const scores = pages.map( _ => cosineSimilarity( new Float32Array( _.embeddings.buffer ), embeddings ) )
    const words = tokenize( exact )
    const excludeIndex = words.findIndex( _ => _.startsWith( "-" ) )
    const [ include, exclude ] = excludeIndex === - 1 ? [ words, [] ] : [ words.slice( 0, excludeIndex ), words.slice( excludeIndex ).filter( _ => _ !== "-" ).map( word => word.replace( /^-/, "" ) ) ]
    return ( await Promise.all( pages.map( async page => {
        const otherFragments = await sql`
        SELECT * FROM pages
        WHERE url = ${ page.url }
        AND DATETIME( seen ) = DATETIME( ${ page.seen } );`
        console.log( otherFragments )
        const wordsInPage = otherFragments.flatMap( _ => tokenize( _.text ) )
        if ( include.every( word => wordsInPage.some( _ => _ === word ) ) && exclude.every( word => wordsInPage.every( _ => _ !== word ) ) )
            return {
                ...page,
                scores: {
                    page: scores.reduce( ( a, b ) => a + b, 0 ) / scores.length,
                    sentence: cosineSimilarity( new Float32Array( page.embeddings.buffer ), embeddings ),
                },
                title: otherFragments.find( _ => _.text.startsWith( "\n" ) && _.text.endsWith( "\n" ) ).text.replace( "\n", "" )
            }
        else return "exclude"
    } ) ) ).filter( _ => _ !== "exclude" )
}
const store = async ( { body, title, url }: { body: string, title: string, url: string } ) => {
    const now = ( await sql`SELECT DATETIME( 'now' ) AS now;` )[ 0 ].now
    const triplets = [ "\n" + title + "\n", ...split( body ).map( ( sentence, index, sentences ) => [ sentences[ index - 1 ] ?? "", sentence, sentences[ index + 1 ] ?? "" ].join( "\n" ) ) ]
    const sentencesInDb = await sql`SELECT * FROM pages WHERE url = ${ url } AND removed IS NULL`
    for ( const { text } of sentencesInDb )
        if ( triplets.includes( text ) )
            await sql`UPDATE pages SET seen = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text }`
        else
            await sql`UPDATE pages SET removed = DATETIME( ${ now } ) WHERE url = ${ url } AND removed IS NULL AND text = ${ text }`
    console.log( "sentences in db", sentencesInDb, triplets )
    for ( const text of triplets.filter( text => ! sentencesInDb.map( _ => _.text ).includes( text ) ) )
        await sql`INSERT INTO pages ( added, embeddings, seen, text, url ) VALUES ( datetime( ${ now } ), ${ ( await embed( text ) ).buffer }, datetime( ${ now } ), ${ text }, ${ url } );`
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
