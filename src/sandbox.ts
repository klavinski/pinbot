import { pipeline } from "@xenova/transformers"
import '../models/onnx/quantized/distilbert-base-cased-distilled-squad/question-answering/tokenizer.json?url'

const run = async () => {
console.log(await pipeline('question-answering'))
}
run()
if ( document ) {
    let a: number;
    a = 6;
    console.log("ok", a)
document.body.textContent= "Hello World";
}
