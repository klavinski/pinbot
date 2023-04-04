import init from "sqlite-wasm-esm"

const run = async () => {
    const sqlite = await init()
    console.log( sqlite )
}
setTimeout( run, 1000 )
