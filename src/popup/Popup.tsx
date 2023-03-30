import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import { IconArrowRight, IconFilter, IconMoodSmile, IconSearch, IconWorldWww } from "@tabler/icons-react"
import { IconCalendar } from "untitled-ui-icons"
import icon from "../../icons/black-icon.svg"
import { Input } from "./Input"
import { Focus } from "./Focus"
import "./index.css"
import styles from "./Popup.module.css"

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
            if ( typeof message === "object" && message !== null && "result" in message && typeof message.result ) {
                setOutput( JSON.stringify( message.result ) )
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
        <Focus style={ { gridTemplateColumns: "auto 1fr auto" } }>
            <IconFilter/>
            <Input
                autoFocus
                disabled={ isLoading }
                value={ input }
                onChange={ e => setInput( e.target.value ) }
                onKeyUp={ e => {
                    if ( e.key === "Enter" && input !== "" ) {
                        sendQuery( input )
                        setIsLoading( true )
                    }
                } }
            />
            <IconSearch onClick={ () => sendQuery( input ) }/>
        </Focus>
        <Focus style={ { gridTemplateColumns: "auto 1fr" } }>
            <IconWorldWww/>
            <Input placeholder="Comma-separated URLs"/>
        </Focus>
        <Focus style={ { gridTemplateColumns: "auto 1fr auto 1fr" } }>
            <IconCalendar/>
            <Input placeholder="From"/>
            <IconArrowRight/>
            <Input placeholder="To"/>
        </Focus>
        { output }
    </div>
}
