// https://github.com/patcg-individual-drafts/topics/blob/main/taxonomy_v2.md
import text from "./taxonomy_v2.md?raw"

export const tags = [ ...text.matchAll( /^\| (\d+) *\|.*\/([^\/\(\)]*[^ ]) (\(By type\))?( *)\|$/gm ) ]
    .map( ( [ , , name ] ) => name )
