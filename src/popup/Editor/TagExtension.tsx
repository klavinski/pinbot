
import { NodeViewContent, NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { mergeAttributes, Node } from "@tiptap/core"
import styles from "./TagExtension.module.css"
import { Icon } from "../Icon.tsx"
import GraphemeSplitter from "grapheme-splitter"
import { useTooltip } from "../useTooltip.tsx"
import { useApi } from "../api.tsx"
import { useEffect, useState } from "react"

const splitter = new GraphemeSplitter()

const TagComponent = ( { editor, node }: NodeViewProps ) => {
    const length = splitter.countGraphemes( node.textContent )
    const api = useApi()
    const [ suggestions, setSuggestions ] = useState( [] as string[] )
    useEffect( () => {
        api.classify( node.textContent ).then( _ => setSuggestions( _.slice( 0, 4 ).map( _ => _.name ) ) )
    }, [ node.textContent ] )
    const { referenceProps, tooltip } = useTooltip( {
        content: suggestions.map( _ => <div className={ styles.suggestion } onClick={ () => { editor.chain().selectParentNode().run(); editor.chain().insertContentAt( { from: editor.state.selection.from + 1, to: editor.state.selection.to - 1 }, _ ).run(); editor.chain().setTextSelection( editor.state.selection.to + 1 ).focus().run() } }><Icon of={ _ }/>{ _ }</div> ),
        isOpen: true,
        placement: "bottom"
    } )

    return <NodeViewWrapper className={ styles.tag } { ...referenceProps }>
        { length > 1 && <Icon of={ node.textContent } contentEditable={ false }/> }
        <NodeViewContent className={ [ styles.tagContent, length > 1 ? "" : styles.short ].join( " " ) }/>
        { length > 1 && tooltip }
    </NodeViewWrapper>
}

export const TagExtension = Node.create( {
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
                .run(),
            "Backspace": () => {
                if ( splitter.countGraphemes( this.editor.state.selection.$head.parent.textContent ) === 1 && this.editor.state.selection.$head.parent.type.name === "tag" ) {
                    this.editor.chain().selectParentNode().deleteSelection().run()
                    return true
                }
                return false
            }
        }
    },
    renderHTML: ( { HTMLAttributes } ) => [ "tag", mergeAttributes( HTMLAttributes ), 0 ],
    addNodeView: () => ReactNodeViewRenderer( TagComponent ),
    HTMLAttributes: {
        class: styles.tagWrapper
    }
} )
