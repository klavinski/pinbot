import { env, pipeline } from "@xenova/transformers"

env.useBrowserCache = false
env.localModelPath = "/models/"
env.backends.onnx.wasm.wasmPaths = "/wasm/"
env.backends.onnx.wasm.numThreads = 1

const pipes = {
    classify: null,
    embed: null,
    summarize: null,
} as Record<string, Awaited<ReturnType<typeof pipeline>> | null>

export const embed = async ( text: string ) => {
    if ( ! pipes.embed )
        pipes.embed = await pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
    return ( await ( pipes.embed )( text, { pooling: "mean", normalize: true } ) ).data as Float32Array
}

export const summarize = async ( text: string ) => {
    if ( ! pipes.summarize )
        pipes.summarize = await pipeline( "summarization", "distilbart-cnn-6-6" )
    return ( await ( pipes.summarize )( text ) )[ 0 ].summary_text as string
}
