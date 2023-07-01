import { useEffect, useState } from "react"
import { IconArrowRight, IconCalendar, IconCircleMinus, IconCirclePlus, IconMessageDots, IconMessages, IconMoodAnnoyed, IconMoodCry, IconMoodEmpty, IconMoodSad, IconMoodSmile, IconPointFilled, IconQuote, IconQuoteOff, IconSearch, IconWorld, IconWorldOff } from "@tabler/icons-react"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "../index.css"
import styles from "./Popup.module.css"
import { usePopup } from "./api.ts"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Calendar } from "./Calendar.tsx"
import { Query } from "../types.ts"
import { UI } from "./UI.tsx"
import { DarkMode } from "./header/DarkMode.tsx"
import { Clock } from "./Clock.tsx"
import { AccountButton } from "./Account.tsx"
import { Tooltip } from "./useTooltip.tsx"
import { AlertsButton } from "./Alerts.tsx"

import manifest from "../../manifest.json"
import { Wordmark } from "./Wordmark.tsx"

const initialFields = {
    query: "",
    exact: "",
    from: null,
    to: null,
    url: ""
} as Query

const useSessionState = <T, >( key: string, initialState: T | ( () => T ) ) => {
    const [ state, setState ] = useState( initialState )
    useEffect( () => { chrome.storage.session.get().then( _ => key in _ && setState( _[ key ] ) ) }, [] )
    useEffect( () => { chrome.storage.session.set( { [ key ]: state } ) }, [ state ] )
    return [ state, setState ] as const
}

const Confidence = ( { score }: { score: number } ) => {
    return <UI prefix={
        score >= 0.8 ? <IconMoodSmile/> :
            score >= 0.6 ? <IconMoodEmpty/> :
                score >= 0.4 ? <IconMoodAnnoyed/> :
                    score >= 0.2 ? <IconMoodSad/> :
                        <IconMoodCry/> }>
        { score > 1 ? 100 : score < 0 ? 0 : Math.round( score * 100 ) } % confidence
    </UI>
}

export const Popup = () => {
    const { isLoading, search } = usePopup()
    const [ fields, setFields ] = useSessionState( "fields", initialFields )
    const [ output, setOutput ] = useSessionState( "output", [] as Awaited<ReturnType<typeof search>> )
    const [ shown, setShown ] = useSessionState( "shown", {
        exactInfo: false,
        fields: false,
        fromCalendar: false,
        toCalendar: false,
        urlInfo: false
    } )
    const FieldsButton = shown.fields ? IconCircleMinus : IconCirclePlus
    const ExactInfoButton = shown.exactInfo ? IconQuoteOff : IconQuote
    const UrlInfoButton = shown.urlInfo ? IconWorldOff : IconWorld
    const [ parent ] = useAutoAnimate()
    return <div ref={ parent } className={ styles.container } onKeyUp={ e => {
        if ( e.key === "Enter" && fields.query && ! isLoading )
            search( fields ).then( setOutput )
    } }>
        <div className={ styles.header }>
            <div/>
            <Wordmark/>
            <div className={ styles.buttons }>
                <Tooltip content="Light/dark mode"><DarkMode/></Tooltip>
                <Tooltip content="Alerts"><AlertsButton/></Tooltip>
                <Tooltip content="Account settings"><AccountButton/></Tooltip>
            </div>
        </div>
        <Focus disabled={ isLoading }><UI prefix={
            <FieldsButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, fields: ! shown.fields } ) }/>
        } suffix={
            isLoading ? <Clock/> : fields.query ? <IconSearch className={ "clickableIcon" } onClick={ () => search( fields ).then( setOutput ) }/> : <div/>
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
            { /* <Focus disabled={ isLoading }><UI prefix={
                <ExactInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, exactInfo: ! shown.exactInfo } ) }/>
            }>
                <Input placeholder="Exact search" value={ fields.exact } onChange={ exact => setFields( { ...fields, exact } ) }/>
            </UI>
            </Focus>
            { shown.exactInfo && <div>Words can appear in any order. Use <div className={ styles.quote }>-</div> to separate words to include from those to exclude. Examples:<br/>
                <UI prefix={ <IconPointFilled/> }><div>
                    Mentions of Captain Haddock: <div className={ styles.quote }>Captain Haddock</div>
                </div></UI>
                <UI prefix={ <IconPointFilled/> }><div>
                    Mentions without the fish: <div className={ styles.quote }>Captain Haddock - fish</div>
                </div></UI><br/>
                Only the stem of the word is considered: <div className={ styles.quote }>fish</div> matches <div className={ styles.quote }>Fish</div>, <div className={ styles.quote }>fishes</div>, <div className={ styles.quote }>fishing</div>, etc.
            </div> } */ }
            <Focus disabled={ isLoading }><UI prefix={
                <UrlInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, urlInfo: ! shown.urlInfo } ) }/>
            }>
                <Input
                    onChange={ url => setFields( { ...fields, url } ) }
                    placeholder="URL"
                    value={ fields.url }
                />
            </UI></Focus>
            { shown.urlInfo && <div>
                Use <div className={ styles.quote }>*</div> as a wildcard. Examples:
                <UI prefix={ <IconPointFilled/> }><div>
                    Videos from any YouTube channel: <div className={ styles.quote }>youtube.com/@*/videos</div>
                </div></UI>
                <UI prefix={ <IconPointFilled/> }><div>
                    A slack channel: <div className={ styles.quote }>app.slack.com/client/team-id/channel-id</div>
                </div></UI>
            </div> }
            <Focus disabled={ isLoading }><UI prefix={
                <IconCalendar className={ "clickableIcon" } onClick={ e => { e.stopPropagation(); setShown( { ...shown, fromCalendar: true } ) } }/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, fromCalendar: true } ) }
                    placeholder="From"
                    value={ fields.from ? new Date( fields.from ).toLocaleDateString() : "" }
                /></UI><UI prefix={
                <IconArrowRight className={ "clickableIcon" } onClick={ e => { e.stopPropagation(); setShown( { ...shown, toCalendar: true } ) } }/>
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
        <div className={ styles.results }>{ output.map( ( page, i ) => {
            const url = new URL( chrome.runtime.getURL( "/_favicon/" ) )
            url.searchParams.set( "pageUrl", page.url )
            url.searchParams.set( "size", "32" )
            const [ sentence1, sentence2, sentence3 ] = page.text.split( "\n" )
            return <div key={ `${ i } ${ page.url } ${ page.seen } ${ page.title } ${ page.text }` }>
                <div className={ styles.info }>
                    <Tooltip content={ page.url }>
                        <UI prefix={ <img className={ styles.favicon } src={ url.toString() }/> } href={ page.url }>
                            <div className={ styles.shrinkable }>{ page.url }</div>
                        </UI>
                    </Tooltip>
                ⦁
                    <UI prefix={ <IconCalendar/> }>{ new Date( page.added ).toLocaleDateString() !== new Date( page.seen ).toLocaleDateString() && `${ new Date( page.added ).toLocaleDateString() } — ` }{ new Date( page.seen ).toLocaleDateString() }</UI>
                ⦁
                    <Confidence score={ page.score }/>
                </div>
                <div className={ styles.bold }>{ page.title }</div>
                <div className={ styles.body }>
                    { sentence1 && `${ sentence1 } ` }
                    <span className={ styles.bold }>{ sentence2 }</span>
                    { sentence3 && ` ${ sentence3 }` }
                </div>
            </div> } ) }</div>
        <div className={ styles.footer }>
            <Tooltip content={ `v${ manifest.version }` }>
                Made by Kamil Szczerba —&nbsp;
            </Tooltip>
            <UI href="https://tally.so/r/3NravQ" prefix={ <IconMessageDots/> }>Leave feedback</UI>
            &nbsp;—&nbsp;
            <UI href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>Meet the community</UI>
        </div>
    </div>
}
