import { tags } from "./tags.ts"
import { cosineSimilarity } from "../utils.ts"
import { Pin } from "../types.ts"

const sqlWorker = new ComlinkWorker<typeof import( "./workers/sql.ts" )>( new URL( "./workers/sql.ts", import.meta.url ) )
const transformersWorker = new ComlinkWorker<typeof import( "./workers/transformers.ts" )>( new URL( "./workers/transformers.ts", import.meta.url ) )

const tagsMap = new Map<string, Promise<Float32Array>>()

const classify = async ( text: string ) => {
    const textEmbedding = await transformersWorker.embed( text )
    return await Promise.all( tags.map( async tag => {
        if ( ! tagsMap.has( tag.name ) )
            tagsMap.set( tag.name, transformersWorker.embed( tag.name ) )
        const tagEmbedding = await tagsMap.get( tag.name )!
        console.log( tag.name, cosineSimilarity( textEmbedding, tagEmbedding ), tagEmbedding )
        return { name: tag.name, score: cosineSimilarity( textEmbedding, tagEmbedding ) }
    } ) )
}

export const api = {
    addPin: async ( { body, screenshot, title, url }: { body: string, screenshot: string, title: string, url: string } ) => {
        const summary = await transformersWorker.summarize( body )
        const tags = await classify( summary )
        return ( await api.sql`INSERT OR REPLACE INTO pins ( isPinned, screenshot, text, timestamp, url ) VALUES ( 0, ${ screenshot }, ${ `<p>${ title }</p><p>${ summary }</p><p>${ tags.filter( _ => _.score > 0.23 ).sort( ( a, b ) => b.score - a.score ).slice( 0, 3 ).map( _ => `<tag>${ _.name }</tag>` ).join( " " ) }</p>` }, datetime( 'now' ), ${ url } ) RETURNING *;` )[ 0 ] as Pin
    },
    embed: transformersWorker.embed,
    getPin: async ( { timestamp, url }: { timestamp: string, url: string } ) => ( await sqlWorker.sql`SELECT * FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url }` )[ 0 ] as Pin,
    removePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => {
        await sqlWorker.sql`DELETE FROM pins WHERE timestamp = ${ timestamp } AND url = ${ url }`
        return null
    },
    sql: sqlWorker.sql,
    togglePin: async ( { timestamp, url }: { timestamp: string, url: string } ) => ( await sqlWorker.sql`UPDATE pins SET isPinned = NOT isPinned WHERE timestamp = ${ timestamp } AND url = ${ url } RETURNING *;` )[ 0 ] as Pin,
}

export type Api = typeof api
