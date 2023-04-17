import { useState } from "react"
import { IconArrowRight, IconCalendar, IconCircleMinus, IconCirclePlus, IconClockHour4, IconMessageDots, IconMessages, IconMoodAnnoyed, IconMoodCry, IconMoodEmpty, IconMoodSad, IconMoodSmile, IconQuote, IconQuoteOff, IconSearch, IconWorld, IconWorldOff, IconX } from "@tabler/icons-react"
import { ReactComponent as Icon } from "../../icons/black-icon.svg"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "./index.css"
import styles from "./Popup.module.css"
import { usePopup } from "./api.ts"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Calendar } from "./Calendar.tsx"
import { IconSliders04 } from "untitled-ui-icons"
import { Query } from "./types.ts"

import { UI } from "./UI.tsx"
import { Toggle } from "./Toggle/index.tsx"

const initialFields = {
    query: "",
    exact: "",
    from: null,
    to: null,
    urls: ""
} as Query

const Confidence = ( { score }: { score: number } ) => <UI prefix={
    score >= 0.8 ? <IconMoodSmile/> :
        score >= 0.6 ? <IconMoodEmpty/> :
            score >= 0.4 ? <IconMoodAnnoyed/> :
                score >= 0.2 ? <IconMoodSad/> :
                    <IconMoodCry/> }>
    { Math.round( score * 100 ) }% confidence
</UI>

export const Popup = () => {
    const { query, isLoading } = usePopup()
    const [ fields, setFields ] = useState( initialFields )
    const [ output, setOutput ] = useState( [] as Awaited<ReturnType<typeof query>> )
    const [ shown, setShown ] = useState( {
        exactInfo: false,
        fields: false,
        fromCalendar: false,
        toCalendar: false,
        urlInfo: false
    } )
    const FieldsButton = shown.fields ? IconCircleMinus : IconCirclePlus
    const SearchButton = isLoading ? IconClockHour4 : IconSearch
    const ExactInfoButton = shown.exactInfo ? IconQuoteOff : IconQuote
    const UrlInfoButton = shown.urlInfo ? IconWorldOff : IconWorld
    const [ parent ] = useAutoAnimate()
    return <div className={ styles.container } ref={ parent } onKeyUp={ e => {
        if ( e.key === "Enter" )
            query( fields ).then( setOutput )
    } }>
        <div className={ styles.header }>
            <div/>
            <div className={ styles.title }>
                Pin<Icon/>bot
            </div>
            <Toggle/>
            { /* <UI prefix={ <IconSliders04/> }>My account</UI> */ }
        </div>
        <Focus><UI prefix={
            <FieldsButton onClick={ () => setShown( { ...shown, fields: ! shown.fields } ) }/>
        } suffix={
            fields.query.length === 0 ? <div/> : output.length === 0 ? <SearchButton onClick={ () => query( fields.query ).then( setOutput ) }/> :
                <IconX onClick={ () => setOutput( [] ) }/>
        }>
            <Input
                autoFocus
                disabled={ isLoading }
                placeholder="Natural language search"
                value={ fields.query }
                onChange={ query => setFields( { ...fields, query } ) }
            />
        </UI>
        </Focus>
        { shown.fields && <>
            <Focus><UI prefix={
                <ExactInfoButton onClick={ () => setShown( { ...shown, exactInfo: ! shown.exactInfo } ) }/>
            }>
                <Input placeholder="Exact search" onChange={ exact => setFields( { ...fields, exact } ) }/>
            </UI>
            </Focus>
            { shown.exactInfo && <div>Example: <div className={ styles.quote }>"exact query" -"query to exclude" "prefix*"</div></div> }
            <Focus><UI prefix={
                <UrlInfoButton onClick={ () => setShown( { ...shown, urlInfo: ! shown.urlInfo } ) }/>
            }>
                <Input
                    onChange={ urls => setFields( { ...fields, urls } ) }
                    placeholder="Newline-separated URL prefixes"
                    rows={ fields.urls.split( "\n" ).length }
                    value={ fields.urls }
                />
            </UI></Focus>
            { shown.urlInfo && <div>Example: <div className={ styles.quote }>https://wikipedia.org<br/>app.slack.com/client/team-id/channel-id</div></div> }
            <Focus><UI prefix={
                <IconCalendar/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, fromCalendar: true } ) }
                    placeholder="From"
                    value={ fields.from ? new Date( fields.from ).toLocaleDateString() : "" }
                /></UI><UI prefix={
                <IconArrowRight/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, toCalendar: true } ) }
                    placeholder="To"
                    value={ fields.to ? new Date( fields.to ).toLocaleDateString() : "" }
                />
            </UI></Focus>
            { ( [ "from", "to" ] as const ).map( _ => <Calendar
                date={ fields[ _ ] }
                setDate={ newDate => setFields( { ...fields, [ _ ]: newDate } ) }
                setShown={ newShown => setShown( { ...shown, [ `${ _ }Calendar` ]: newShown } ) }
                shown={ shown[ `${ _ }Calendar` ] }
            /> ) }
        </> }
        { output.map( page => <div>
            <div className={ styles.info }>
                <UI prefix={ <IconWorld/> } href={ page.url }>{ page.url }</UI>
                ⦁
                <UI prefix={ <IconCalendar/> }>{ new Date( page.date ).toLocaleDateString() }</UI>
                ⦁
                <Confidence score={ Math.max( ...page.sentences.map( _ => _.score ) ) }/>
            </div>
            <div className={ styles.title }>{ page.title }</div>
            <div className={ styles.body }>{ page.sentences.map( _ => _.sentence ).join( "... " ) }</div>
        </div> ) }
        <div className={ styles.footer }>
            Made by Kamil Szczerba —&nbsp;
            <UI href="https://tally.so/create" prefix={ <IconMessageDots/> }>Leave feedback</UI>
            &nbsp;—&nbsp;
            <UI href="https://discord.com/create" prefix={ <IconMessages/> }>Meet the community</UI>
        </div>
    </div>
}
