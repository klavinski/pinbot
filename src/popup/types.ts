import { z } from "zod"

export const queryParser = z.object( {
    query: z.string(),
    exact: z.string(),
    from: z.string().nullable(),
    to: z.string().nullable(),
    url: z.string(),
} )

export type Query = z.infer<typeof queryParser>

export const responseParser = z.object( {
    results: z.array( z.object( {
        sentences: z.array( z.object( {
            sentence: z.string(),
            score: z.number()
        } ) ),
        date: z.string(),
        score: z.number(),
        text: z.string(),
        title: z.string(),
        url: z.string(),
    } ) )
} )

export const storeParser = z.object( { body: z.string() } )
