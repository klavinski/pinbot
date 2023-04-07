import { useState } from "react"
import browser from "webextension-polyfill"
import { z } from "zod"

const parser = z.array( z.object( {
    body: z.string(),
    date: z.number(),
    score: z.number(),
    title: z.string().nullable(),
    url: z.string().nullable(),
} ) )

export const usePopup = () => {
    const [ isLoading, setIsLoading ] = useState( false )
    const query = async ( query: string ) => {
        setIsLoading( true )
        try {
            const response = parser.parse( await browser.runtime.sendMessage( { query } ) )
            setIsLoading( false )
            return response
        }
        catch ( e ) { throw e }
    }
    return { query, isLoading }
}
