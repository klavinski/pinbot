
// import { loadHnswlib, syncFileSystem } from "hnswlib-wasm"
import { useState } from "react"
import { Pin } from "./Pin.js"
import { Footer } from "./Footer.tsx"
import { Wordmark } from "./Wordmark.tsx"
import { Toggle } from "./Toggle/index.tsx"
import { Tooltip } from "./Tooltip.tsx"
import styles from "./App.module.css"
import { useApi } from "./context.tsx"
import { useEffect } from "react"
import { Icon } from "./Icon.tsx"
import IconPin from "~icons/tabler/pin"
import { Clock } from "./Clock.tsx"
import IconForbidden from "~icons/eva/slash-outline"
import { Lottie } from "@crello/react-lottie"
import check from "react-useanimations/lib/checkmark"
import IconPointRight from "~icons/icon-park-outline/hand-right"

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
        const selectedText = selection.toString()
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

        return { body, selectedText }
    }
    throw new Error( "No selection" )
}

export const App = () => {
    const [ pins, setPins ] = useState( [] as { url: string }[] )
    const [ icon, setIcon ] = useState( <Icon of={ <IconPin/> }/> )
    const [ successfulPin, setSuccessfulPin ] = useState( null as null | string )
    const [ isDisabled, setIsDisabled ] = useState( false )
    const [ visiblePictures, setVisiblePictures ] = useState( true )
    const api = useApi()
    const [ page, setPage ] = useState( null as { title: string, body: string, url: string } | null )
    useEffect( () => { ( async () => {
        const [ tab ] = await chrome.tabs.query( { active: true, currentWindow: true } )
        if ( tab?.url && tab.id && tab.title !== undefined && ! tab.url.startsWith( "chrome://" ) ) {
            const result = ( await chrome.scripting.executeScript( {
                target: { tabId: tab.id },
                function: getBody,
            } ) )[ 0 ].result as ReturnType<typeof getBody>
            setPage( {
                title: tab.title, body: result.body, url: tab.url,
            } )
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
        { pins.length === 0 ? <div className={ styles.pin }>
            <div className={ [ styles.button, isDisabled ? styles.disabled : "" ].join( " " ) }
                onClick={ async () => {
                    setIcon( <Clock/> )
                    setIsDisabled( true )
                    if ( page ) {
                        const summary = await api.summarize( page.body )
                        const screenshot = await chrome.tabs.captureVisibleTab( { format: "png", quality: 100 } )
                        const tags = await api.classify( summary )
                        await api.sql`INSERT OR REPLACE INTO pins ( screenshot, text, url ) VALUES ( ${ screenshot }, ${ `<p>${ page.title }</p><p>${ summary }</p><p>${ tags.filter( _ => _.score > 0.23 ).sort( ( a, b ) => b.score - a.score ).slice( 0, 3 ).map( _ => `<tag>${ _.name }</tag>` ).join( " " ) }</p>` }, ${ page.url } );`
                        setSuccessfulPin( page.url )
                    }
                    setIcon( <Icon of={ <Lottie config={ { animationData: check.animationData } }/> }/> )
                } }>
                { icon }Pin the current page
            </div>
            { successfulPin ? <Pin url={ successfulPin } visiblePictures={ visiblePictures } setVisiblePictures={ setVisiblePictures }/> : null }
        </div> : pins.map( ( { url } ) =>
            <Pin key={ url } url={ url }visiblePictures={ visiblePictures } setVisiblePictures={ setVisiblePictures }/> ) }
        <Footer pins={ pins } onSubmit={ () => pins.length === 0 ? api.sql`SELECT url FROM pins;`.then( setPins ) : setPins( [] ) }/>
    </div>
}
