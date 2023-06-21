import { tags } from "./tags.ts"
import { cosineSimilarity } from "../utils.ts"

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
    classify,
    embed: transformersWorker.embed,
    sql: sqlWorker.sql,
    summarize: transformersWorker.summarize
}

export type Api = typeof api
