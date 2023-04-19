import { z } from "zod"

export const queryParser = z.object( {
    query: z.string(),
    exact: z.string(),
    from: z.number().nullable(),
    to: z.number().nullable(),
    urls: z.string(),
} )

export type Query = z.infer<typeof queryParser>

export const responseParser = z.object( {
    results: z.array( z.object( {
        sentences: z.array( z.object( {
            sentence: z.string(),
            score: z.number()
        } ) ),
        date: z.number(),
        score: z.number(),
        text: z.string(),
        title: z.string(),
        url: z.string(),
    } ) )
} )

export const storeParser = z.object( { body: z.string() } )
