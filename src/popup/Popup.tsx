import { useState } from "react"
import { IconArrowRight, IconCalendar, IconClockHour4, IconFilter, IconFilterOff, IconMoodSmile, IconSearch, IconWorldWww } from "@tabler/icons-react"
import icon from "../../icons/black-icon.svg"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "./index.css"
import styles from "./Popup.module.css"
import { usePopup } from "../api.ts"

export const Popup = () => {
    const [ input, setInput ] = useState( "" )
    const [ output, setOutput ] = useState( "" )
    const [ isFiltered, setIsFiltered ] = useState( false )
    const { embed, isLoading } = usePopup()
    const FilterButton = isFiltered ? IconFilterOff : IconFilter
    const SearchButton = isLoading ? IconClockHour4 : IconSearch
    return <div className={ styles.container }>
        <div className={ styles.header }>
            <img src={ icon }/><div>Valet</div>
            <div/>
            <IconMoodSmile/><div>My account</div>
        </div>
        <Focus style={ { gridTemplateColumns: "auto 1fr auto" } }>
            <FilterButton onClick={ () => setIsFiltered( ! isFiltered ) }/>
            <Input
                autoFocus
                disabled={ isLoading }
                value={ input }
                onChange={ e => setInput( e.target.value ) }
                onKeyUp={ e => {
                    if ( e.key === "Enter" && input !== "" ) {
                        embed( input ).then( embeddings => setOutput( JSON.stringify( embeddings ) ) )
                    }
                } }
            />
            <SearchButton onClick={ () => embed( input ).then( embeddings => setOutput( JSON.stringify( embeddings ) ) ) }/>
        </Focus>
        { isFiltered && <>
            <Focus style={ { gridTemplateColumns: "auto 1fr" } }>
                <IconWorldWww/>
                <Input placeholder="Comma-separated URLs"/>
            </Focus>
            <Focus style={ { gridTemplateColumns: "auto 1fr auto 1fr" } }>
                <IconCalendar/>
                <Input placeholder="From"/>
                <IconArrowRight/>
                <Input placeholder="To"/>
            </Focus>
        </> }
        { output }
        <div>
            Made by Kamil Szczerba — Leave feedback
        </div>
    </div>
}
