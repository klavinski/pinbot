import { useState } from "react"
import { IconArrowRight, IconBackspace, IconCalendar, IconCircleMinus, IconCirclePlus, IconMessageDots, IconMessages, IconMoodAnnoyed, IconMoodCry, IconMoodEmpty, IconMoodSad, IconMoodSmile, IconQuote, IconQuoteOff, IconSearch, IconWorld, IconWorldOff } from "@tabler/icons-react"
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
import { Clock } from "./Clock.tsx"

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
    const { isLoading, search } = usePopup()
    const [ fields, setFields ] = useState( initialFields )
    const [ lastQuery, setLastQuery ] = useState( fields )
    const [ output, setOutput ] = useState( [] as Awaited<ReturnType<typeof search>> )
    const [ shown, setShown ] = useState( {
        exactInfo: false,
        fields: false,
        fromCalendar: false,
        toCalendar: false,
        urlInfo: false
    } )
    const FieldsButton = shown.fields ? IconCircleMinus : IconCirclePlus
    const SearchButton = isLoading ? Clock : IconSearch
    const ExactInfoButton = shown.exactInfo ? IconQuoteOff : IconQuote
    const UrlInfoButton = shown.urlInfo ? IconWorldOff : IconWorld
    const [ parent ] = useAutoAnimate()
    return <div className={ styles.container } ref={ parent } onKeyUp={ e => {
        if ( e.key === "Enter" ) {
            setLastQuery( fields )
            search( fields ).then( setOutput )
        }
    } }>
        <div className={ styles.header }>
            <div/>
            <div className={ styles.wordmark }>
                Pin<Icon className={ styles.logo }/>bot
            </div>
            <Toggle/>
            { /* <UI prefix={ <IconSliders04/> }>My account</UI> */ }
        </div>
        <Focus disabled={ isLoading }><UI prefix={
            <FieldsButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, fields: ! shown.fields } ) }/>
        } suffix={
            Object.values( fields ).every( field => ! field ) ? <div/> : output.length === 0 ? <SearchButton className={ "clickableIcon" } onClick={ () => { setLastQuery( fields ); search( fields ).then( setOutput ) } }/> :
                <IconBackspace className={ "clickableIcon" } onClick={ () => { setFields( initialFields ); setOutput( [] ) } }/>
        }>
            <Input
                autoFocus
                placeholder="Natural language search"
                value={ fields.query }
                onChange={ query => setFields( { ...fields, query } ) }
            />
        </UI>
        </Focus>
        { shown.fields && <>
            <Focus disabled={ isLoading }><UI prefix={
                <ExactInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, exactInfo: ! shown.exactInfo } ) }/>
            }>
                <Input placeholder="Exact search" onChange={ exact => setFields( { ...fields, exact } ) }/>
            </UI>
            </Focus>
            { shown.exactInfo && <div>Example: <div className={ styles.quote }>query "exact query" NOT this NOT "exact query"</div></div> }
            <Focus disabled={ isLoading }><UI prefix={
                <UrlInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, urlInfo: ! shown.urlInfo } ) }/>
            }>
                <Input
                    onChange={ urls => setFields( { ...fields, urls } ) }
                    placeholder="Newline-separated URL prefixes"
                    rows={ fields.urls.split( "\n" ).length }
                    value={ fields.urls }
                />
            </UI></Focus>
            { shown.urlInfo && <div>Example: <div className={ styles.quote }>https://wikipedia.org<br/>app.slack.com/client/team-id/channel-id</div></div> }
            <Focus disabled={ isLoading }><UI prefix={
                <IconCalendar className={ "clickableIcon" }/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, fromCalendar: true } ) }
                    placeholder="From"
                    value={ fields.from ? new Date( fields.from ).toLocaleDateString() : "" }
                /></UI><UI prefix={
                <IconArrowRight className={ "clickableIcon" }/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, toCalendar: true } ) }
                    placeholder="To"
                    value={ fields.to ? new Date( fields.to ).toLocaleDateString() : "" }
                />
            </UI></Focus>
            { ( [ "from", "to" ] as const ).map( _ => <Calendar
                date={ fields[ _ ] }
                setDate={ newDate => setFields( { ...fields, [ _ ]: newDate, ...( {
                    from: { to: newDate && fields.to && newDate > fields.to ? null : fields.to },
                    to: { from: newDate && fields.from && newDate < fields.from ? null : fields.from }
                }[ _ ] ) } ) }
                setShown={ newShown => setShown( { ...shown, [ `${ _ }Calendar` ]: newShown } ) }
                shown={ shown[ `${ _ }Calendar` ] }
            /> ) }
        </> }
        { output.map( page => {
            const url = new URL( chrome.runtime.getURL( "/_favicon/" ) )
            url.searchParams.set( "pageUrl", page.url )
            url.searchParams.set( "size", "32" )
            return <div>
                <div className={ styles.info }>
                    <UI prefix={ <img className={ styles.favicon } src={ url.toString() }/> } href={ page.url }>
                        <div className={ styles.shrinkable }>{ page.url }</div>
                    </UI>
                ⦁
                    <UI prefix={ <IconCalendar/> }>{ new Date( page.date ).toLocaleDateString() }</UI>
                ⦁
                    <Confidence score={ Math.max( ...page.sentences.map( _ => _.score ) ) }/>
                </div>
                <div className={ styles.title }>{ page.title }</div>
                <div className={ styles.body }>{ page.sentences.map( _ => _.sentence ).join( "... " ) }</div>
            </div> } ) }
        <div className={ styles.footer }>
            Made by Kamil Szczerba —&nbsp;
            <UI href="https://tally.so/create" prefix={ <IconMessageDots/> }>Leave feedback</UI>
            &nbsp;—&nbsp;
            <UI href="https://discord.com/create" prefix={ <IconMessages/> }>Meet the community</UI>
        </div>
    </div>
}
