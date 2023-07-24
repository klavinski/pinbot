import IconX from "~icons/tabler/x"
import styles from "./Pill.module.css"
import { Icon } from "./Icon.tsx"
import { useState } from "react"

export const Pill = () => {
    const [ name, setName ] = useState( "Moonface" )
    return <div className={ styles.container }>
        <Icon of={ name }/>
        <input value={ name } onChange={ e => setName( e.target.value ) }/>
        <Icon of={ <IconX/> }/>
    </div>
}
