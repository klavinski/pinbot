import { useState } from "react"
import browser from "webextension-polyfill"
import { Query, responseParser } from "./types.ts"

const logAndReturn = <T>( x: T ) => { console.log( x ); return x }

export const usePopup = () => {
    const [ isLoading, setIsLoading ] = useState( false )
    const search = async ( query: Query ) => {
        setIsLoading( true )
        try {
            const response = responseParser.parse( logAndReturn( await browser.runtime.sendMessage( query ) ) )
            setIsLoading( false )
            return response
        }
        catch ( e ) { throw e }
    }
    return { search, isLoading }
}