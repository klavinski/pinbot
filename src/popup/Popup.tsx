import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import "./index.css"
import styles from "./Popup.module.css"
import { IconFilter, IconMoodSmile, IconSearch } from "@tabler/icons-react"
import icon from "../../icons/black-icon.svg"

const sendQuery = ( query: string ) => {
    browser.tabs.query( { active: true, lastFocusedWindow: true } ).then( ( [ tab ] ) => {
        if ( ! tab.id ) throw new Error( "No current tab" )
        browser.tabs.sendMessage( tab.id, { query } )
    } )
}

export const Popup = () => {
    const [ input, setInput ] = useState( "" )
    const [ output, setOutput ] = useState( "" )
    const [ isLoading, setIsLoading ] = useState( false )
    useEffect( () => {
        const handler = ( message: unknown ) => {
            if ( typeof message === "object" && message !== null && "result" in message ) {
                setOutput( message.result )
                setIsLoading( false )
            }
        }
        browser.runtime.onMessage.addListener( handler )
        return () => browser.runtime.onMessage.removeListener( handler )
    }, [] )
    return <div className={ styles.container }>
        <div className={ styles.header }>
            <img src={ icon }/><div>Valet</div>
            <div/>
            <IconMoodSmile/><div>My account</div>
        </div>
        <div className={ styles.input }>
            <IconFilter/>
            <input autoFocus disabled={ isLoading } value={ input } onChange={ e => setInput( e.target.value ) } onKeyUp={ e => {
                if ( e.key === "Enter" && input !== "" ) {
                    sendQuery( input )
                    setIsLoading( true )
                }
            } }/>
            <IconSearch onClick={ () => sendQuery( input ) }/>
        </div>
        { JSON.stringify( output ) }
    </div>
}
