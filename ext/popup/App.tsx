
import { useState } from "react"
import { PinComponent } from "./PinComponent.js"
import { Footer } from "./Footer.tsx"
import { Wordmark } from "./Wordmark.tsx"
import { DarkMode } from "./header/DarkMode.tsx"
import { useTooltip } from "./useTooltip.tsx"
import styles from "./App.module.css"
import { useApi } from "./api.tsx"
import { useEffect } from "react"
import { Icon } from "./Icon.tsx"
import { Clock } from "./Clock.tsx"
import { Pin } from "../types.ts"
import { AnimatePresence } from "framer-motion"
import { Transition } from "./Transition.tsx"
import { Animation } from "./Animation.tsx"
import { Info } from "./header/Info.tsx"
import { Subscriptions } from "./header/Subscriptions.tsx"

const getBody = () => {

    const selection = document.getSelection()
    if ( selection ) {
        const userSelects = new Map<HTMLElement, string>()
        document.querySelectorAll( "*" ).forEach( _ => {
            if ( _ instanceof HTMLElement ) {
                userSelects.set( _, _.style.userSelect )
                _.style.userSelect = "auto"
            }
        } )
        const savedRange = selection.rangeCount === 0 ? null : selection.getRangeAt( 0 )
        selection.removeAllRanges()
        const range = document.createRange()
        range.selectNode( document.body )
        selection.addRange( range )
        const body = selection.toString().trim()

        userSelects.forEach( ( value, key ) => key.style.userSelect = value )
        selection.removeAllRanges()
        savedRange && selection.addRange( savedRange )

        return body
    }
    throw new Error( "No selection" )
}

export const App = () => {
    const [ visiblePictures, setVisiblePictures ] = useState( true )
    const [ query, setQuery ] = useState( null as { tags: string[], text: string } | null )
    const api = useApi()
    const [ pins, setPins ] = useState( [] as Pin[] )
    useEffect( () => { ( async () => {
        setPins( query ? await api.search( query ) : await api.getDrafts() )
    } )() }, [ query ] )
    const [ state, setState ] = useState( "loading" as "loading" | Parameters<typeof api.addPin>[ 0 ] | "done" | "error" )
    useEffect( () => { ( async () => {
        const newPins = await api.awaitPinning()
        if ( newPins.length > 0 ) {
            setPins( _ => [ ...newPins, ..._ ] )
            setState( "done" )
        } else {
            const [ tab ] = await chrome.tabs.query( { active: true, currentWindow: true } )
            setState( tab?.url && tab.id && tab.title !== undefined && ! tab.url.startsWith( "chrome://" ) ?
                {
                    body: ( await chrome.scripting.executeScript( {
                        target: { tabId: tab.id },
                        func: getBody,
                    } ) )[ 0 ].result as ReturnType<typeof getBody>,
                    screenshot: await chrome.tabs.captureVisibleTab( { format: "png", quality: 100 } ),
                    title: tab.title,
                    url: tab.url
                } : "error" )
        }
    } )() }, [] )
    const { referenceProps: darkModeRef, tooltip: darkModeTooltip } = useTooltip( { content: "Light/dark mode", pointerEvents: "none" } )
    return <div className={ styles.container }>
        <AnimatePresence initial={ false }>
            <div className={ styles.buttons }>
                <Subscriptions/>
                <Info/>
                <div { ...darkModeRef }><DarkMode/>{ darkModeTooltip }</div>
            </div>
            <Wordmark/>
            <div className={ styles.addPin }>
                <div className={ [ styles.button, typeof state === "object" ? "" : styles.disabled ].join( " " ) }
                    onClick={ typeof state === "object" ? async () => {
                        const pageToPin = state
                        setState( "loading" )
                        api.addPin( pageToPin )
                        setPins( [ ...await api.awaitPinning(), ...pins ] )
                        setState( "done" )
                    } : undefined }>
                    { state === "loading" ? <Clock/> : <Icon of={ state === "done" ? <Animation of="check" direction={ 1 }/> : state === "error" ? <IconEvaSlashOutline/> : <IconTablerPin/> }/> }Pin the current page
                </div>
            </div>
            { pins.length > 0 ? pins.map( _ => <Transition key={ `${ _.timestamp }${ _.url }` } style={ { boxShadow: "0 -4px 4px -4px #0001, 0 -8px 8px -8px #0001" } }>
                <PinComponent
                    onDelete={ async () => setPins( pins => pins.filter( pin => pin !== _ ) ) }
                    pin={ _ }
                    setVisiblePictures={ setVisiblePictures }
                    visiblePictures={ visiblePictures }
                />
            </Transition> ) : <Transition key={ `empty-${ query ? "pins" : "drafts" }` } style={ { margin: "16px" } }>
                <div className={ styles.empty }>No { query ? "pins" : "drafts" }</div>
            </Transition> }
            <Footer query={ query } setQuery={ setQuery }/>
        </AnimatePresence>
    </div>
}
