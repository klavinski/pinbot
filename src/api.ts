import { useCallback, useState } from "react"
import browser from "webextension-polyfill"
import { onMessageTo, sendMessageFrom } from "./message.ts"

export const onBrowserMessageTo = onMessageTo( browser.runtime.onMessage.addListener, browser.runtime.onMessage.removeListener, browser.runtime.sendMessage )

export const sendBrowserMessageFrom = sendMessageFrom( browser.runtime.onMessage.addListener, browser.runtime.onMessage.removeListener, browser.runtime.sendMessage )

export const usePopup = () => {
    const [ isLoading, setIsLoading ] = useState( false )
    const sendMessage = useCallback( sendBrowserMessageFrom( "popup" ), [] )
    const embed = async ( query: string ) => {
        setIsLoading( true )
        const response = await sendMessage( { query }, "offscreen" )
        setIsLoading( false )
        console.log( response, "in popup" )
    }
    return { embed, isLoading }
}
