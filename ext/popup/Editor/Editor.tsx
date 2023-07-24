
import { EditorContent, useEditor } from "@tiptap/react"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Document from "@tiptap/extension-document"
import Placeholder from "@tiptap/extension-placeholder"
import History from "@tiptap/extension-history"
import styles from "./Editor.module.css"
import { TagExtension } from "./TagExtension.tsx"
import Focus from "@tiptap/extension-focus"

export const Editor = ( { content = "", onEnter, onUpdate, placeholder = "" }: { content?: string, onEnter?: () => void, onUpdate?: ( text: string ) => void, placeholder?: string } ) => {
    const editor = useEditor( {
        content,
        extensions: [
            Document,
            History,
            Focus,
            Paragraph.extend( {
                addKeyboardShortcuts: () => ( {
                    Enter: () => {
                        onEnter?.()
                        return typeof onEnter !== "undefined"
                    }
                } )
            } ).configure( {
                HTMLAttributes: {
                    class: styles.paragraph
                }
            } ),
            Placeholder.configure( { placeholder, emptyEditorClass: styles.empty } ),
            TagExtension,
            Text
        ],
        onUpdate: ( { editor } ) => onUpdate?.( editor.getHTML() )
    } )
    return <EditorContent editor={ editor } className={ styles.container }/>
}
