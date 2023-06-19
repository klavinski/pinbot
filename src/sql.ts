import { z } from "zod"
import { zSqlValue } from "./types.ts"
import Worker from "./worker.ts?worker"
const worker = new Worker()

const sqlWithoutInit = <T extends Record<string, z.infer<typeof zSqlValue>>>( query: TemplateStringsArray, ...bind: z.infer<typeof zSqlValue>[] ) => new Promise<T[]>( async resolve => {
    const controller = new AbortController()
    const uuid = crypto.randomUUID()
    worker.addEventListener( "message", ( { data } ) => {
        const parsing = z.object( { results: z.array( z.any() ), uuid: z.literal( uuid ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data.results )
        }
    }, { signal: controller.signal } )
    worker.postMessage( { bind, query: query.map( ( string, i ) => i === 0 ? string : `$${ i }${ string }` ).join( "" ), uuid } )
} )

const init = ( async () => {
    await sqlWithoutInit`
    CREATE TABLE IF NOT EXISTS pins ( uuid TEXT PRIMARY KEY, text TEXT NOT NULL, screenshot TEXT NOT NULL, url TEXT NOT NULL );
    INSERT INTO pins ( uuid, text, screenshot, url ) VALUES ( 'uuid', '<p>Automatically generated title</p><p>and summary with <tag>tags</tag>.</p><p>And a screenshot below</p>', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADs', 'https://example.com' );
    `
} )()

export const sql = async ( ...args: Parameters<typeof sqlWithoutInit> ) => {
    await init
    return sqlWithoutInit( ...args )
}
