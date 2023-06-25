
// import { loadHnswlib, syncFileSystem } from "hnswlib-wasm"
import { useState } from "react"
import { PinComponent } from "./PinComponent.js"
import { Footer } from "./Footer.tsx"
import { Wordmark } from "./Wordmark.tsx"
import { Toggle } from "./Toggle/index.tsx"
import { Tooltip } from "./Tooltip.tsx"
import styles from "./App.module.css"
import { useApi } from "./api.tsx"
import { useEffect } from "react"
import { Icon } from "./Icon.tsx"
import IconPin from "~icons/tabler/pin"
import { Clock } from "./Clock.tsx"
import IconForbidden from "~icons/eva/slash-outline"
import { Lottie } from "@crello/react-lottie"
import check from "react-useanimations/lib/checkmark"
import { Pin } from "../types.ts"


// const FILENAME = "ghost.dat"
// const NUM_DIMENSIONS = 384
// const MAX_ELEMENTS = 100000
// const lib = await loadHnswlib()
// lib.EmscriptenFileSystemManager.setDebugLogs( true )
// const index = new lib.HierarchicalNSW( "cosine", NUM_DIMENSIONS )
// await syncFileSystem( "read" )

// const exists = lib.EmscriptenFileSystemManager.checkFileExists( FILENAME )
// if ( ! exists ) {
//     index.initIndex( MAX_ELEMENTS, 48, 128, 100, true )
//     index.setEfSearch( 32 )
//     index.writeIndex( FILENAME )
// } else {
//     index.readIndex( FILENAME, MAX_ELEMENTS, true )
//     index.setEfSearch( 32 )
// }

// const ids = index.addItems( await Promise.all( [ "ok", "test" ].map( async text => ( await pipe( text ) ).data ) ), true )
// console.log( ids )
// const result = index.searchKnn( ( await pipe( "test" ) ).data, 2, undefined )
// console.log( result )

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

        return { body }
    }
    throw new Error( "No selection" )
}

export const App = () => {
    const [ pins, setPins ] = useState( [] as Pin[] )
    const [ icon, setIcon ] = useState( <Icon of={ <IconPin/> }/> )
    const [ isDisabled, setIsDisabled ] = useState( false )
    const [ visiblePictures, setVisiblePictures ] = useState( true )
    const [ query, setQuery ] = useState( null as { tags: string[], text: string } | null )
    const [ page, setPage ] = useState( null as null | { title: string, url: string, body: string } )
    const api = useApi()
    useEffect( () => {
        api.sql`SELECT * FROM pins WHERE isPinned = ${ query ? 1 : 0 } ORDER BY timestamp DESC;`.then( setPins )
    }, [ query ] )
    console.log( pins )
    useEffect( () => { ( async () => {
        const [ tab ] = await chrome.tabs.query( { active: true, currentWindow: true } )
        if ( tab?.url && tab.id && tab.title !== undefined && ! tab.url.startsWith( "chrome://" ) ) {
            const result = ( await chrome.scripting.executeScript( {
                target: { tabId: tab.id },
                function: getBody,
            } ) )[ 0 ].result as ReturnType<typeof getBody>
            setPage( { title: tab.title, url: tab.url, body: result.body } )
        } else {
            setIcon( <Icon of={ <IconForbidden/> }/> )
            setIsDisabled( true )
        }
    } )() }, [] )
    return <div className={ styles.container }>
        <div className={ styles.buttons }>
            <Tooltip content="Light/dark mode"><Toggle/></Tooltip>
        </div>
        <Wordmark/>
        <div className={ styles.addPin }>
            <div className={ [ styles.button, isDisabled ? styles.disabled : "" ].join( " " ) }
                onClick={ async () => {
                    setIcon( <Clock/> )
                    setIsDisabled( true )
                    if ( page ) {
                        const screenshot = await chrome.tabs.captureVisibleTab( { format: "png", quality: 100 } )
                        setPins( [ await api.addPin( { screenshot, title: page.title, url: page.url, body: page.body } ), ...pins ] )
                    }
                    setIcon( <Icon of={ <Lottie config={ { animationData: check.animationData } }/> }/> )
                } }>
                { icon }Pin the current page
            </div>
        </div>
        { pins.map( _ =>
            <PinComponent key={ `${ _.timestamp }${ _.url }` } pin={ _ } visiblePictures={ visiblePictures } setVisiblePictures={ setVisiblePictures }/> ) }
        <Footer query={ query } setQuery={ setQuery }/>
    </div>
}
