import Worker from "./worker.ts?worker"

function init() {
    const worker = new Worker()
    console.log( worker )

}

init()
