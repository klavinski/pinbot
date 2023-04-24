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
} )

export const storeParser = z.object( { body: z.string() } )
