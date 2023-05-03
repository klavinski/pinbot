import { IconArrowDown, IconBrandChrome, IconMessageDots, IconMessages } from "@tabler/icons-react"
import styles from "./App.module.css"
import darkMode from "./dark.png"
import bach from "./bach.png"
import local from "./local.png"
import { UI } from "../popup/UI.tsx"
import { Wordmark } from "../popup/Wordmark.tsx"
import { Toggle } from "../popup/Toggle/index.tsx"
import { ReactNode } from "react"

const Install = ( { suffix }: { suffix?: ReactNode } ) => <div className={ styles.install }>
    Install the{ " " }
    <UI prefix={ <IconBrandChrome/> } href="chrome">extension for Chrome</UI>
    { suffix }
</div>

export const App = () => <>
    <div className={ styles.scroll }>
        <div className={ styles.header }>
            <div>
                <a className="clickableIcon" onClick={ () => document.querySelector( "#features" )?.scrollIntoView( { behavior: "smooth" } ) }>Features</a>
                <a className="clickableIcon" onClick={ () => document.querySelector( "#about" )?.scrollIntoView( { behavior: "smooth" } ) }>About</a>
            </div>
            <Wordmark/><Toggle/>
        </div>
        <div className={ styles.background }/>
        <div className={ styles.container }>
            <div className={ styles.hero }>
                <div className={ styles.headline }>Privately search your browser history using AI.</div>
                <div/>
                <Install suffix={ <>{ " " }or learn more<IconArrowDown/></> }/>
            </div>
            <div id="features" className={ styles.features }>
                { [
                    { title: "Use approximate words.", image: bach, text: "Pinbot will find matches even when you don't use the exact words." },
                    { title: "Filter your results.", text: "You can specify a date range, a URL, or both." },
                    { title: "Keep your data private.", image: local, text: "Pinbot works offline: everything is kept on your device." },
                    { title: "Enjoy a user-first experience.", image: darkMode, text: <div className={ styles.withIcons }>You can{ " " }<UI href="https://tally.so/r/3NravQ" prefix={ <IconMessageDots/> }>share your feedback</UI>{ " " }or{ " " }<UI href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>join the community</UI>{ " " }and shape the future of Pinbot.</div> },
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
                <Install/>
            </div>
            <div id="about">
        Hi, I'm Kamil. I've been building Pinbot for the past months as a personal experiment.
            </div>
        </div>
    </div>
</>
