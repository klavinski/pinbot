import { useState } from "react"
import browser from "webextension-polyfill"

export const usePopup = () => {
    const [ isLoading, setIsLoading ] = useState( false )
    const embed = async ( query: string ) => {
        setIsLoading( true )
        const response = await browser.runtime.sendMessage( { query } )
        setIsLoading( false )
        return response
    }
    return { embed, isLoading }
}
