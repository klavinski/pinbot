import { ComponentPropsWithoutRef, ReactNode } from "react"
import styles from "./Link.module.css"
import { useTooltip } from "./useTooltip"

export const Link = ( { children, className, href, prefix, ...props }: { children: ReactNode, href: string, prefix?: ReactNode } & ComponentPropsWithoutRef<"a"> ) => {
    const { referenceProps, tooltip } = useTooltip( { content: href } )
    return <>
        <a
            { ...referenceProps }
            href={ href } { ...props }
            onClick={ () => chrome.tabs.create( { url: href } ) }
            className={ [ styles.container, className ].filter( _ => _ ).join( " " ) }
        >
            <div className={ styles.prefix }>
                { prefix }
            </div>
            <div className={ styles.text }>
                { children }
            </div>
        </a>
        { href !== children && tooltip }
    </>
}
