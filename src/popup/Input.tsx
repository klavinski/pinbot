import { ComponentPropsWithoutRef } from "react"
import styles from "./Input.module.css"

export const Input = ( props: ComponentPropsWithoutRef<"input"> ) => {
    return <input
        className={ styles.container }
        { ...props }
    />
}
