import { IconArrowDown, IconBrandChrome, IconMessageDots, IconMessages } from "@tabler/icons-react"
import styles from "./App.module.css"
import darkMode from "./dark.png"
import bach from "./bach.png"
import local from "./local.png"
import filter from "./filter.png"
import kamil from "./kamil.jpg"
import { UI } from "../popup/UI.tsx"
import { Wordmark } from "../popup/Wordmark.tsx"
import { Toggle } from "../popup/Toggle/index.tsx"
import { ReactNode } from "react"

const Install = ( { suffix }: { suffix?: ReactNode } ) => <div className={ styles.install }>
    Install the{ " " }
    <UI prefix={ <IconBrandChrome size={ 24 / 18 * 24 }/> } href="chrome">extension for Chrome</UI>
    { suffix }
</div>

export const App = () => <>
    <div className={ styles.scroll }>
        <div className={ styles.header }>
            <div>
                <a className="clickableIcon" onClick={ () => document.querySelector( `.${ styles.features }` )?.scrollIntoView( { behavior: "smooth" } ) }>Features</a>
                <a className="clickableIcon" onClick={ () => document.querySelector( `.${ styles.about }` )?.scrollIntoView( { behavior: "smooth" } ) }>About</a>
            </div>
            <Wordmark/><Toggle/>
        </div>
        <div className={ styles.background }/>
        <div className={ styles.container }>
            <div className={ styles.hero }>
                <div className={ styles.headline }>Privately search your browser history using AI.</div>
                <div/>
                <Install suffix={ <>{ " " }or learn more<IconArrowDown size={ 24 * 24 / 18 }/></> }/>
            </div>
            <div id="features" className={ styles.features }>
                { [
                    { title: "Use approximate words.", image: bach, text: "Pinbot will find matches even when you don't use the exact words." },
                    { title: "Filter your results.", image: filter, text: "You can specify a date range, a URL, or both." },
                    { title: "Keep your data private.", image: local, text: "Pinbot works offline: everything runs on your device." },
                    { title: "Enjoy a user-first experience.", image: darkMode, text: <div className={ styles.withIcons }>Dark mode, and more features to come! You can{ " " }<UI href="https://tally.so/r/3NravQ" prefix={ <IconMessageDots/> }>share your feedback</UI>{ " " }or{ " " }<UI href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>join the community</UI>{ " " }and shape the future of Pinbot.</div> },
                ].map( ( { title, image, text }, i ) => <div key={ title } className={ styles.feature }>
                    <div className={ styles.description }>
                        <div className={ styles.subtitle }>
                            <div className={ styles.circle }>{ i + 1 }</div>
                            { title }
                        </div>
                        <div>
                            { text }
                        </div>
                    </div>
                    <img src={ image }/>
                </div> ) }
            </div>
            <Install/>
            <div className={ styles.about }>
                <div className={ styles.kamil }>
                    <img src={ kamil }/>
                    Hi, I'm Kamil.
                </div>
                <p>
                    So far, most of the recent AI developments have been limited to big players with little concern for privacy. My goal is to make these developments available to everyone, without compromising your privacy.
                </p>
                <p>
                    The current extension is only the starting point. I plan to make Pinbot's development self-sustainable in the future, while remaining faithful to these ideals: I want to build Pinbot for and with its users. Your{ " " }<UI href="https://tally.so/r/3NravQ" prefix={ <IconMessageDots/> }> feedback</UI>{ " " }is welcome; if you want to discuss, I'll be happy to see you on Pinbot's{ " " }<UI href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>Discord server</UI>!
                </p>
            </div>
        </div>
    </div>
</>
