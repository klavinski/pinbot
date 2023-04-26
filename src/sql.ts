import { z } from "zod"
import { zBind, zSqlValue } from "./types.ts"
import Worker from "./worker.ts?worker"
const worker = new Worker()

const sql = <T extends Record<string, z.infer<typeof zSqlValue>>>( query: string, bind: z.infer<typeof zBind> = [] ) => new Promise<T[]>( async resolve => {
    const controller = new AbortController()
    const uuid = crypto.randomUUID()
    worker.addEventListener( "message", ( { data } ) => {
        const parsing = z.object( { results: z.array( z.any() ), uuid: z.literal( uuid ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data.results )
        }
    }, { signal: controller.signal } )
    worker.postMessage( { bind, query, uuid } )
} )

export const init = ( ...args: Parameters<typeof sql> ) => {
    const initPromise = sql( ...args )
    return async ( ...args: Parameters<typeof sql> ) => initPromise.then( () => sql( ...args ) )
}
