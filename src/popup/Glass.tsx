import { ComponentPropsWithRef, CSSProperties, forwardRef, ReactNode, Ref } from "react"
import styles from "./Glass.module.css"

export const Glass = forwardRef( ( { bottomBorder = true, children, className, leftBorder = true, rightBorder = true, style: { borderRadius, ...style } = { borderRadius: "0px" }, topBorder = true, ...props }: { bottomBorder?: boolean, children: ReactNode, leftBorder?: boolean, rightBorder?: boolean, topBorder?: boolean } & ComponentPropsWithRef<"div">, ref: Ref<HTMLDivElement> ) => <div className={ [ styles.container, className ].filter( _ => _ ).join( " " ) } style={ { "--radius": borderRadius, ...style } as CSSProperties } { ...props } ref={ ref }>
    { topBorder && <div className={ [ styles.border, styles.top ].join( " " ) }/> }
    { bottomBorder && <div className={ [ styles.border, styles.bottom ].join( " " ) }/> }
    { leftBorder && <div className={ [ styles.border, styles.left ].join( " " ) }/> }
    { rightBorder && <div className={ [ styles.border, styles.right ].join( " " ) }/> }
    <div className={ styles.background }/>
    <div className={ styles.blur }/>
    <div className={ styles.content }>
        { children }
    </div>
</div> )
