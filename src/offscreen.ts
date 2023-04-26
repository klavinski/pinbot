import { init } from "./sql.ts"
import { embed } from "./embed.ts"
import { Query, queryParser, storeParser } from "./types.ts"
import { split } from "./utils.ts"

const sql = init( `CREATE VIRTUAL TABLE IF NOT EXISTS pages USING FTS5 ( body, date UNINDEXED, title, url, tokenize=\"porter unicode61 remove_diacritics 2\" );
CREATE TABLE IF NOT EXISTS pairs ( embeddings BLOB, text TEXT );` )

const cosineSimilarity = ( a: Float32Array, b: Float32Array ) => {
    let dot = 0
    let normA = 0
    let normB = 0
    for ( let i = 0; i < a.length; i ++ ) {
        dot += a[ i ] * b[ i ]
        normA += a[ i ] ** 2
        normB += b[ i ] ** 2
    }
    return dot / ( Math.sqrt( normA * normB ) )
}

const search = async ( { exact, from, query, to, url }: Query ) => {
    const pages = await sql( `
        SELECT * FROM pairs, pages${ exact ? "( $1 )" : "" }
        WHERE url GLOB '*' || $2 || '*'
        ${ from ? `AND date >= DATE( '${ from }' )` : "" }
        ${ to ? `AND date <= DATE( '${ to }', '+1 day' )` : "" }
        AND date >= DATE( 'now', '-14 days' )
        AND text = body
        AND ( TRUE OR $1 = $1 )`, // otherwise, "SQLite3Error: Bind index is out of range." when not using $1
    [ exact, url ] )
    const embeddings = await embed( query )
    return await Promise.all( pages.map( async page => {
        const sentences = await Promise.all( [ page.title, ...split( page.body ) ].map( async sentence => {
            console.log( sentence, embeddings, await sql( "SELECT text, $1 FROM pairs WHERE text = $1;", [ sentence ] ) )
            return {
                text: sentence, score: cosineSimilarity( embeddings, new Float32Array( ( await sql( "SELECT embeddings FROM pairs WHERE text = $1;", [ sentence ] ) )[ 0 ].embeddings.buffer ) )
            }
        } ) )
        return {
            ...page,
            score: cosineSimilarity( embeddings, new Float32Array( page.embeddings.buffer ) ),
            sentences
        }
    } ) )
}

const store = async ( { body, title, url }: { body: string, title: string, url: string } ) => {
    await Promise.all( [ body, title, ...split( body ) ].map( async sentence => {
        await sql( "INSERT INTO pairs ( embeddings, text ) VALUES ( $1, $2 );", [ ( await embed( sentence ) ).buffer, sentence ] )
    } ) )
    await sql( "INSERT INTO pages ( body, date, title, url ) VALUES ( $1, date( 'now' ), $2, $3);", [ body, title, url ] )
    console.log( "current pages", await sql( "SELECT * FROM pages;" ) )
    console.log( "current sentences", await sql( "SELECT * FROM pairs;" ) )
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
