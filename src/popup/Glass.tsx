import { ComponentPropsWithRef, forwardRef, ReactNode, Ref } from "react"
import styles from "./Glass.module.css"

export const Glass = forwardRef( ( { children, ...props }: { children: ReactNode } & ComponentPropsWithRef<"div"> & { style: { "--radius": `${ number }px` } }, ref: Ref<HTMLDivElement> ) => <div className={ styles.container } { ...props } ref={ ref }>
    <div className={ [ styles.border, styles.top ].join( " " ) }/>
    <div className={ [ styles.border, styles.bottom ].join( " " ) }/>
    <div className={ [ styles.border, styles.left ].join( " " ) }/>
    <div className={ [ styles.border, styles.right ].join( " " ) }/>
    <div className={ styles.background }/>
    <div className={ styles.blur }/>
    <div className={ styles.content }>
        { children }
    </div>
</div> )
