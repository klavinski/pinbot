import { z } from "zod"

export const pinParser = z.object( {
    isPinned: z.coerce.boolean(),
    screenshot: z.string(),
    text: z.string(),
    timestamp: z.string(),
    url: z.string()
} )

export type Pin = z.infer<typeof pinParser>
