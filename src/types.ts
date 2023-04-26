import { z } from "zod"

export const queryParser = z.object( {
    query: z.string(),
    exact: z.string(),
    from: z.string().nullable(),
    to: z.string().nullable(),
    url: z.string(),
} )

export type Query = z.infer<typeof queryParser>

export const responseParser = z.array( z.object( {
    body: z.string(),
    sentences: z.array( z.object( {
        text: z.string(),
        score: z.number()
    } ) ),
    score: z.number(),
    date: z.string(),
    title: z.string(),
    url: z.string(),
} ) )

export const storeParser = z.object( { body: z.string() } )

export const zSqlValue = z.union( [ z.null(), z.number(), z.boolean(), z.bigint(), z.string(), z.instanceof( Uint8Array ), z.undefined(), z.instanceof( Int8Array ), z.instanceof( ArrayBuffer ) ] )
export const zBind = z.union( [ z.array( zSqlValue ), z.record( zSqlValue ) ] )
