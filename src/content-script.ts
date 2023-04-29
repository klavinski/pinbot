import browser from "webextension-polyfill"

const delay = 1000
const frequency = 20 * 1000
const sendBody = () => {
    const selection = document.getSelection()
    if ( selection ) {
        const savedRange = selection.rangeCount === 0 ? null : selection.getRangeAt( 0 )
        selection.removeAllRanges()

        const range = document.createRange()
        range.selectNode( document.body )
        selection.addRange( range )

        const body = selection.toString().trim()

        selection.removeAllRanges()
        savedRange && selection.addRange( savedRange )

        body && browser.runtime.sendMessage( { body } )
    }
}

setTimeout( () => {
    sendBody()
    // setInterval( sendBody, frequency )
}, delay )
