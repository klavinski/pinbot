import { ComponentPropsWithoutRef } from "react"
import styles from "./Input.module.css"

export const Input = ( { onChange, ...props }: ( Omit<ComponentPropsWithoutRef<"input">, "rows" | "onChange"> | Omit<{ rows: number } & ComponentPropsWithoutRef<"textarea">, "onChange"> ) & { onChange?: ( newValue: string ) => void } ) => {
    return "rows" in props ?
        <textarea className={ styles.container } { ...props } onChange={ e => onChange?.( e.target.value ) }/> :
        <input className={ styles.container } { ...props } onChange={ e => onChange?.( e.target.value ) }/>
}
