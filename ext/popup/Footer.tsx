import { Icon } from "./Icon.tsx"
import styles from "./Footer.module.css"
import { Dispatch, SetStateAction, useState } from "react"
import { Editor } from "./Editor/Editor.tsx"
import { parseHtml } from "../utils.ts"
import { Animation } from "./Animation.tsx"
import { Glass } from "./Glass.tsx"

export const Footer = ( { query, setQuery }: { query: { text: string, tags: string[] } | null, setQuery: Dispatch<SetStateAction<{ text: string, tags: string[] } | null>> } ) => {
    const [ content, setContent ] = useState( { text: "", tags: [] as string[] } )
    return <Glass className={ styles.container } bottomBorder={ false }leftBorder={ false } rightBorder={ false }>
        <div className={ styles.content }>
            <Editor
                placeholder="Search your pins (# for tags)"
                onUpdate={ _ => setContent( parseHtml( _ ) ) }
                onEnter={ () => {
                    let currentContent = null as null | typeof content
                    setContent( _ => { currentContent = _; return _ } )
                    setQuery( query => query && query.text === currentContent!.text ? null : currentContent )
                } }
            />
            <div className={ styles.button } data-noQuery={ query === null }>
                <Icon
                    of={ <Animation of="search" direction={ query && query.text === content.text ? 1 : - 1 }/> }
                    onClick={ () => setQuery( query && query.text === content.text ? null : content ) }
                />
            </div>
        </div>
    </Glass>
}
