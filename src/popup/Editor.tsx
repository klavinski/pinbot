
import { EditorContent, NodeViewContent, NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react"
import { mergeAttributes, Node } from "@tiptap/core"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Document from "@tiptap/extension-document"
import { PluginKey } from "@tiptap/pm/state"
import Placeholder from "@tiptap/extension-placeholder"
import styles from "./Editor.module.css"
import { Icon } from "./Icon.tsx"
import { z } from "zod"

import GraphemeSplitter from "grapheme-splitter"
const splitter = new GraphemeSplitter()

export const TagPluginKey = new PluginKey( "mention" )

const TagComponent = ( { node }: NodeViewProps ) => {
    const { text } = z.object( { content: z.object( { text: z.string() } ).array() } ).parse( node.content ).content[ 0 ]
    const length = splitter.countGraphemes( text )
    return <NodeViewWrapper className={ styles.tag }>
        { length > 1 && <Icon of={ text } contentEditable={ false }/> }
        <NodeViewContent className={ [ styles.tagContent, length > 1 ? "" : styles.short ].join( " " ) } contentEditable={ true }/>
    </NodeViewWrapper>
}

const TagExtension = Node.create( {
    name: "tag",
    group: "inline",
    content: "inline*",
    inline: true,
    selectable: true,
    parseHTML: () => [ { tag: "tag" } ],
    addKeyboardShortcuts() {
        return {
            "#": () => this.editor.chain().insertContentAt( this.editor.state.selection.head, { type: this.type.name } ).insertContentAt( this.editor.state.selection.head + 1, { type: "text", text: "_#" } )
                .setTextSelection( { from: this.editor.state.selection.from + 1, to: this.editor.state.selection.to + 2 } )
                .deleteSelection()
                .setTextSelection( { from: this.editor.state.selection.from + 1, to: this.editor.state.selection.to + 2 } )
                .run()
        }
    },
    renderHTML: ( { HTMLAttributes } ) => [ "tag", mergeAttributes( HTMLAttributes ), 0 ],
    addNodeView: () => ReactNodeViewRenderer( TagComponent ),
} )

export const Editor = ( { content = "", onEnter, onUpdate, placeholder = "" }: { content?: string, onEnter?: () => void, onUpdate?: ( text: string ) => void, placeholder?: string } ) => {
    const editor = useEditor( {
        content,
        extensions: [
            Document,
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
            TagExtension.configure( {
                HTMLAttributes: {
                    class: styles.tagWrapper
                },
            } ),
            Text
        ],
        onUpdate: ( { editor } ) => onUpdate?.( editor.getHTML() )
    } )
    return <EditorContent editor={ editor } className={ styles.container }/>
}
