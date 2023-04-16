import { z } from "zod"

export const queryParser = z.object( {
    query: z.string(),
    exact: z.string(),
    from: z.date().nullable(),
    to: z.date().nullable(),
    urls: z.string(),
} )

export type Query = z.infer<typeof queryParser>

export const responseParser = z.array( z.object( {
    sentences: z.array( z.object( {
        sentence: z.string(),
        score: z.number(),
        part: z.number(),
    } ) ),
    date: z.number(),
    score: z.number(),
    title: z.string().nullable(),
    url: z.string().nullable(),
} ) )

export const storeParser = z.object( { body: z.string() } )
