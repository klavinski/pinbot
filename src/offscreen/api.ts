import { tags } from "./tags.ts"
import { cosineSimilarity, parseHtml } from "../utils.ts"
import { asPin } from "../types.ts"
import { icons } from "../icons.tsx"

const sqlWorker = new ComlinkWorker<typeof import( "./workers/sql.ts" )>( new URL( "./workers/sql.ts", import.meta.url ) )
const transformersWorker = new ComlinkWorker<typeof import( "./workers/transformers.ts" )>( new URL( "./workers/transformers.ts", import.meta.url ) )

const tagsMap = new Map<string, Promise<Float32Array>>()

const classify = async ( text: string ) => {
    const allTags = [ ...new Set( [ ...( await sqlWorker.sql`SELECT * FROM pins WHERE isPinned = true;` ).map( asPin ).flatMap( _ => parseHtml( _.text ).tags ), ...tags ] ).values() ]
    const textEmbedding = await transformersWorker.embed( text )
    return ( await Promise.all( allTags.map( async tag => {
        if ( ! tagsMap.has( tag ) )
            tagsMap.set( tag, transformersWorker.embed( tag ) )
        const tagEmbedding = await tagsMap.get( tag )!
        return { name: tag, score: cosineSimilarity( textEmbedding, tagEmbedding ) }
    } ) ) ).sort( ( a, b ) => b.score - a.score )
}

const iconEmbeddings = Promise.all( Object.entries( icons ).map( async ( [ name ] ) => ( { name: name as keyof typeof icons, embedding: await transformersWorker.embed( name ) } ) ) )

export const api = {
    addPin: async ( { body, screenshot, title, url }: { body: string, screenshot: string, title: string, url: string } ) => {
        const summary = await transformersWorker.summarize( body )
        const tags = await classify( [ title, body ].join( "\n" ) )
        const text = `<p>${ title }</p><p>${ summary }</p><p>${ tags.slice( 0, 3 ).filter( _ => _.score > 0.23 ).map( _ => `<tag>${ _.name }</tag>` ).join( " " ) }</p>`
        const embedding = await transformersWorker.embed( parseHtml( text ).text )
        return asPin( ( await sqlWorker.sql`INSERT OR REPLACE INTO pins ( embedding, isPinned, screenshot, text, timestamp, url ) VALUES ( ${ embedding.buffer }, 1, ${ screenshot }, ${ text }, datetime( 'now' ), ${ url } ) RETURNING *;` )[ 0 ] )
    },
    classify,
    getDrafts: async () => ( await sqlWorker.sql`SELECT * FROM pins WHERE isPinned = false ORDER BY timestamp DESC;` ).map( asPin ),
    getIcon: async ( query: string ) => {
        const queryEmbedding = await transformersWorker.embed( query )
        return ( await iconEmbeddings )
            .map( ( { name, embedding } ) => ( { name, similarity: cosineSimilarity( embedding, queryEmbedding ) } ) )
            .reduce( ( best, current ) => best.similarity > current.similarity ? best : current ).name
    },
    getPin: async ( { timestamp, url }: { timestamp: string, url: string } ) => asPin( ( await sqlWorker.sql`SELECT * FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url }` )[ 0 ] ),
    removePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => {
        await sqlWorker.sql`DELETE FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url }`
        return null
    },
    search: async ( { text, tags }: { text: string, tags: string[] } ) => {
        const embedding = await transformersWorker.embed( text )
        const results = ( await sqlWorker.sql( [ `SELECT * FROM pins WHERE isPinned = true ${ tags.map( _ => `AND text LIKE '%<tag>${ _ }</tag>%'` ).join( " " ) };` ] ) ).map( asPin )
        return results.map( pin => ( { ...pin, score: cosineSimilarity( embedding, pin.embedding ) } ) ).sort( ( a, b ) => b.score - a.score )
    },
    sql: sqlWorker.sql,
    togglePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => asPin( ( await sqlWorker.sql`UPDATE pins SET isPinned = NOT isPinned WHERE timestamp = ${ timestamp } AND url = ${ url } RETURNING *;` )[ 0 ] ),
    updatePin: async ( { text, timestamp, url }: { text: string, timestamp: string, url: string } ) => {
        const embedding = await transformersWorker.embed( text )
        return asPin( ( await sqlWorker.sql( [ "UPDATE pins SET embedding = ", ", text = ", " WHERE timestamp = ", " AND url = ", " RETURNING *;" ], embedding.buffer, text, timestamp, url ) )[ 0 ] )
    }
}

export type Api = typeof api
