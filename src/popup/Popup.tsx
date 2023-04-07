import { useState } from "react"
import { IconArrowRight, IconCalendar, IconClockHour4, IconFilter, IconFilterOff, IconMoodAnnoyed, IconMoodCry, IconMoodNeutral, IconMoodSad, IconMoodSmile, IconSearch, IconWorldWww } from "@tabler/icons-react"
import icon from "../../icons/black-icon.svg"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "./index.css"
import styles from "./Popup.module.css"
import { usePopup } from "./api.ts"

const Confidence = ( { score }: { score: number } ) => <>
    { score >= 0.8 ? <IconMoodSmile/> :
        score >= 0.6 ? <IconMoodNeutral/> :
            score >= 0.4 ? <IconMoodAnnoyed/> :
                score >= 0.2 ? <IconMoodSad/> :
                    <IconMoodCry/> }
    { Math.round( score * 100 ) }% confidence
</>

export const Popup = () => {
    const { query, isLoading } = usePopup()
    const [ input, setInput ] = useState( "" )
    const [ output, setOutput ] = useState( [] as Awaited<ReturnType<typeof query>> )
    const [ isFiltered, setIsFiltered ] = useState( false )
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
                        query( input ).then( setOutput )
                    }
                } }
            />
            <SearchButton onClick={ () => query( input ).then( setOutput ) }/>
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
        { output.map( page => <div>
            <div className={ styles.info }>
                <div><IconWorldWww/><a className={ styles.url }>{ page.url }</a></div>
                ⦁
                <div><IconCalendar/>{ new Date( page.date ).toLocaleDateString() }</div>
                ⦁
                <Confidence score={ page.score }/>
            </div>
            <div className={ styles.title }>{ page.title }</div>
            <div className={ styles.body }>{ page.body }</div>
        </div> ) }
        <div>
            Made by Kamil Szczerba — Leave feedback
        </div>
    </div>
}
