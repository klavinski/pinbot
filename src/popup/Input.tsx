import { ComponentPropsWithoutRef } from "react"
import styles from "./Input.module.css"

export const Input = ( props: Omit<ComponentPropsWithoutRef<"input">, "rows"> | { rows: number } & ComponentPropsWithoutRef<"textarea"> ) => {
    return "rows" in props ?
        <textarea className={ styles.container } { ...props }/> :
        <input className={ styles.container } { ...props }/>
}
