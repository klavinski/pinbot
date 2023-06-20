import { z } from "zod"

export const popupApi = () => ( {
    classify: ( text: string ): Promise<{ name: string, score: number }[]> => chrome.runtime.sendMessage( { classify: text } ),
    embed: ( text: string ): Promise<Float32Array> => chrome.runtime.sendMessage( { embed: text } ),
    sql: ( ...sql: z.infer<typeof sqlParser> ): Promise<Record<string, unknown>[]> => chrome.runtime.sendMessage( { sql } ),
    summarize: ( text: string ): Promise<string> => chrome.runtime.sendMessage( { summarize: text } )
} )

const sqlParser = z.tuple( [ z.custom<TemplateStringsArray>( z.string().array().parse ) ] ).rest( z.union( [ z.string(), z.number(), z.bigint(), z.boolean(), z.instanceof( Uint8Array ), z.instanceof( Int8Array ), z.instanceof( ArrayBuffer ), z.null(), z.undefined() ] ) )

export const offscreenApi = ( handlers: {
    classify: ( text: string ) => Promise<{ name: string, score: number }[]>,
    embed: ( text: string ) => Promise<Float32Array>,
    sql: ( ...args: z.infer<typeof sqlParser> ) => Promise<Record<string, unknown>[]>,
    summarize: ( text: string ) => Promise<string>
} ) => {
    chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
        console.log( message )
        const classifyParsing = z.object( { classify: z.string() } ).safeParse( message )
        if ( classifyParsing.success ) {
            handlers.classify( classifyParsing.data.classify ).then( sendResponse )
            return true
        }
        const embedParsing = z.object( { embed: z.string() } ).safeParse( message )
        if ( embedParsing.success ) {
            handlers.embed( embedParsing.data.embed ).then( sendResponse )
            return true
        }
        const sqlParsing = z.object( { sql: sqlParser } ).safeParse( message )
        if ( sqlParsing.success ) {
            handlers.sql( ...sqlParsing.data.sql ).then( sendResponse )
            return true
        }
        console.log( sqlParsing )
        const summarizeParsing = z.object( { summarize: z.string() } ).safeParse( message )
        if ( summarizeParsing.success ) {
            handlers.summarize( summarizeParsing.data.summarize ).then( sendResponse )
            return true
        }
    } )
}
