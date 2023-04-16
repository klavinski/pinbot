import { useState } from "react"
import browser from "webextension-polyfill"
import { Query, responseParser } from "./types.ts"

export const usePopup = () => {
    const [ isLoading, setIsLoading ] = useState( false )
    const query = async ( query: Query ) => {
        setIsLoading( true )
        try {
            const response = responseParser.parse( await browser.runtime.sendMessage( query ) )
            setIsLoading( false )
            return response
        }
        catch ( e ) { throw e }
    }
    return { query, isLoading }
}