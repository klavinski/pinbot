import { env, pipeline } from "@xenova/transformers"

env.useBrowserCache = false
env.localModelPath = "/models/"
env.backends.onnx.wasm.wasmPaths = "/wasm/"
env.backends.onnx.wasm.numThreads = 1

const embedPipe = pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
const summarizePipe = pipeline( "summarization", "distilbart-cnn-6-6" )

export const embed = async ( text: string ) => {
    return ( await ( await embedPipe )( text, { pooling: "mean", normalize: true } ) ).data as Float32Array
}

export const summarize = async ( text: string ) => {
    return ( await ( await summarizePipe )( text ) )[ 0 ].summary_text as string
}
