// import browser from "webextension-polyfill"

// const delay = 3 * 1000

// const sendBody = () => {

//     const selection = document.getSelection()
//     if ( selection ) {
//         const userSelects = new Map<HTMLElement, string>()
//         document.querySelectorAll( "*" ).forEach( _ => {
//             if ( _ instanceof HTMLElement ) {
//                 userSelects.set( _, _.style.userSelect )
//                 _.style.userSelect = "auto"
//             }
//         } )
//         const savedRange = selection.rangeCount === 0 ? null : selection.getRangeAt( 0 )
//         selection.removeAllRanges()
//         const range = document.createRange()
//         range.selectNode( document.body )
//         selection.addRange( range )
//         const body = selection.toString().trim()

//         userSelects.forEach( ( value, key ) => key.style.userSelect = value )
//         selection.removeAllRanges()
//         savedRange && selection.addRange( savedRange )

//         body && browser.runtime.sendMessage( { body } )
//     }
// }

// let observer = null as MutationObserver | null

// const setUpObserver = () => {

//     observer?.disconnect()
//     let noUpdateScheduled = true
//     const debounceSendBody = () => {
//         if ( noUpdateScheduled ) {
//             noUpdateScheduled = true
//             setTimeout( () => {
//                 noUpdateScheduled = false
//                 sendBody()
//             }, delay )
//         }
//     }
//     observer = new MutationObserver( () => debounceSendBody() )
//     observer.observe( document.body, { attributes: false, childList: true, subtree: true } )
//     debounceSendBody()
// }

// setUpObserver()

// browser.runtime.onMessage.addListener( setUpObserver )
