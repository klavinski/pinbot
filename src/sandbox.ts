import { pipeline } from "@xenova/transformers"

const phrases = [
    "Canine nutrition",
    "Dog mood",
    "Hot dog",
]
const query = "Dog food"

const run = async () => {
    const qa = await pipeline( "question-answering", "distilbert-base-cased-distilled-squad" )
    console.log( await qa( "Is X a man or a woman?", "X is Alice's father." ) )
    // const textGeneration = await pipeline('text-generation', 'distilgpt2')
    // console.log(await textGeneration('Who is sitting next to Bob?'))
    // const embeddings = await pipeline('embeddings', 'sentence-transformers/all-distilroberta-v1')
    // console.log(await embeddings('Who is sitting next to Bob?'))
    // const summarization = await pipeline( "summarization", "facebook/bart-large-cnn" )
    // console.log( await summarization( "In order to do something interesting with the sandboxed file, we need to load it in a context where it can be addressed by the extension's code. Here, sandbox.html has been loaded into the extension's Event Page (eventpage.html) via an iframe. eventpage.js contains code that sends a message into the sandbox whenever the browser action is clicked by finding the iframe on the page, and executing the postMessage method on its contentWindow. The message is an object containing two properties: context and command. We'll dive into both in a moment." ) )
}
window.addEventListener( "message", message => {
    console.log( message, message.source === window, message.target === window, message.currentTarget === window )
    // message.source?.postMessage({ from: "sandbox" })
} )
run()
if ( document ) {
    let a: number
    a = 6
    console.log( "ok", a )
    document.body.textContent = "Hello World"
}

setInterval( function() {
    // Send the message "Hello" to the parent window
    // ...if the domain is still "davidwalsh.name"
    parent.postMessage( "Hello", "http://davidwalsh.name" )
}, 3000 )
