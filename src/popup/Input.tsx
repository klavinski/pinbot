import { ComponentPropsWithoutRef } from "react"
import styles from "./Input.module.css"

export const Input = ( {
    onChange,
    ...props
}: Omit<ComponentPropsWithoutRef<"input">, "onChange"> & {
    onChange?: ( newValue: string ) => void
} ) => <input
    className={ styles.container }
    onChange={ e => onChange?.( e.target.value ) }
    { ...props }
/>
