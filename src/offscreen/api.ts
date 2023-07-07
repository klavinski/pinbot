import { tags } from "./tags.ts"
import { cosineSimilarity, parseHtml } from "../utils.ts"
import { asPin } from "../types.ts"
import { icons } from "../icons.tsx"
import { parse as parseDate } from "chrono-node"
import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const { readDoc } = winkNLP( model )

const dbWorker = new ComlinkWorker<typeof import( "./workers/db.ts" )>( new URL( "./workers/db.ts", import.meta.url ) )
const transformersWorker = new ComlinkWorker<typeof import( "./workers/transformers.ts" )>( new URL( "./workers/transformers.ts", import.meta.url ) )

const tagsMap = new Map<string, Promise<Float32Array>>()

const classify = async ( text: string ) => {
    const occurrences = [ ...( await dbWorker.sql`SELECT * FROM pins WHERE isPinned = true;` ).map( asPin ).flatMap( _ => parseHtml( _.text ).tags ) ]
    const textEmbedding = await transformersWorker.embed( text )
    return ( await Promise.all( [ ...new Set( [ ...occurrences, ...tags ] ).values() ].map( async tag => {
        if ( ! tagsMap.has( tag ) )
            tagsMap.set( tag, transformersWorker.embed( tag ) )
        const tagEmbedding = await tagsMap.get( tag )!
        return { name: tag, score: cosineSimilarity( textEmbedding, tagEmbedding ), count: occurrences.filter( _ => _ === tag ).length }
    } ) ) ).sort( ( a, b ) => b.score - a.score )
}

const iconEmbeddings = Promise.all( Object.entries( icons ).map( async ( [ name ] ) => ( { name: name as keyof typeof icons, embedding: await transformersWorker.embed( name ) } ) ) )

const emptyEmbedding = new Float32Array( 384 ).fill( 0 )

const mixEmbeddings = ( [ a = emptyEmbedding, b = emptyEmbedding, c = emptyEmbedding ]: [ Float32Array | undefined, Float32Array | undefined, Float32Array | undefined ] ) => new Float32Array ( Array.from( { length: a.length }, ( _, i ) => ( 0 * a[ i ] + 1 * b[ i ] + 0 * c[ i ] ) / 3 ) )

export const api = {
    addPin: async ( { body, screenshot, title, url }: { body: string, screenshot: string, title: string, url: string } ) => {
        const embeddings = new Map<string, Float32Array>()
        const summary = await transformersWorker.summarize( body )
        const tags = await classify( [ title, body ].join( "\n" ) )
        const text = `<p>${ title }</p><p>${ summary }</p><p>${ tags.slice( 0, 3 ).filter( _ => _.score > 0.23 ).map( _ => `<tag>${ _.name }</tag>` ).join( " " ) }</p>`
        const embedding = await transformersWorker.embed( parseHtml( text ).text )
        const pin = asPin( ( await dbWorker.sql`INSERT OR REPLACE INTO pins ( embedding, isPinned, screenshot, text, timestamp, url ) VALUES ( ${ embedding.buffer }, 1, ${ screenshot }, ${ text }, datetime( 'now' ), ${ url } ) RETURNING *;` )[ 0 ] )
        const sentences = readDoc( body ).sentences().out().flatMap( _ => _.split( "\n" ) ).filter( _ => ! [ "", "\t", " " ].includes( _ ) )
        await Promise.all( sentences.map( async _ => embeddings.set( _, await transformersWorker.embed( _ ) ) ) )
        const triplets = [ [ "", title, "" ] as const, ...sentences.map( ( _, i ) => [ sentences[ i - 1 ] ?? "", _, sentences[ i + 1 ] ?? "" ] as const ) ]
        await Promise.all( triplets.map( async _ => await dbWorker.sql`INSERT OR REPLACE INTO pages ( embedding, text, timestamp, url ) VALUES ( ${ mixEmbeddings( _.map( _ => embeddings.get( _ ) ) as Parameters<typeof mixEmbeddings>[ 0 ] ).buffer }, ${ _.join( "\n" ) }, ${ pin.timestamp }, ${ pin.url } )` ) )
        return pin
    },
    classify,
    getDrafts: async () => ( await dbWorker.sql`SELECT * FROM pins WHERE isPinned = false ORDER BY timestamp DESC;` ).map( asPin ),
    getIcon: async ( query: string ) => {
        const queryEmbedding = await transformersWorker.embed( query )
        return ( await iconEmbeddings )
            .map( ( { name, embedding } ) => ( { name, score: name === "Clock" && parseDate( query ).length > 0 ? 1 : cosineSimilarity( embedding, queryEmbedding ) } ) )
            .reduce( ( best, current ) => best.score > current.score ? best : current ).name
    },
    getPin: async ( { timestamp, url }: { timestamp: string, url: string } ) => asPin( ( await dbWorker.sql`SELECT * FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url }` )[ 0 ] ),
    removePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => {
        await dbWorker.sql`DELETE FROM pages WHERE timestamp = ${ timestamp } AND url = ${ url };`
        await dbWorker.sql`DELETE FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url };`
        return null
    },
    search: async ( { text, tags }: { text: string, tags: string[] } ) => {
        const embedding = await transformersWorker.embed( text )
        const results = ( await dbWorker.sql( [ `SELECT * FROM pins WHERE isPinned = true ${ tags.map( _ => `AND text LIKE '%<tag>${ _ }</tag>%'` ).join( " " ) };` ] ) ).map( asPin )
        return ( ( await Promise.all( results.map( async pin => {
            const sentences = ( await dbWorker.sql`SELECT * FROM pages WHERE timestamp = ${ pin.timestamp } AND url = ${ pin.url };` )
                .map( _ => ( { ..._, score: cosineSimilarity( embedding, new Float32Array( ( _.embedding as Uint8Array ).buffer ) ) } ) )
            sentences.sort( ( a, b ) => b.score - a.score )
            const commentScore = cosineSimilarity( pin.embedding, embedding )
            console.log( commentScore, sentences[ 0 ].score, commentScore > sentences[ 0 ].score, sentences )
            return { ...pin, score: Math.max( commentScore, sentences[ 0 ].score ), snippet: commentScore > sentences[ 0 ].score ? null : sentences[ 0 ].text }
        } ) ) ) ).sort( ( a, b ) => b.score - a.score )
    },
    sql: dbWorker.sql,
    togglePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => asPin( ( await dbWorker.sql`UPDATE pins SET isPinned = NOT isPinned WHERE timestamp = ${ timestamp } AND url = ${ url } RETURNING *;` )[ 0 ] ),
    updatePin: async ( { text, timestamp, url }: { text: string, timestamp: string, url: string } ) => {
        const embedding = await transformersWorker.embed( text )
        return asPin( ( await dbWorker.sql( [ "UPDATE pins SET embedding = ", ", text = ", " WHERE timestamp = ", " AND url = ", " RETURNING *;" ], embedding.buffer, text, timestamp, url ) )[ 0 ] )
    }
}

export type Api = typeof api
