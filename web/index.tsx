import IconArrowDown from "~icons/tabler/arrow-down"
import IconBrandChrome from "~icons/tabler/brand-chrome"
import IconMessageDots from "~icons/tabler/message-dots"
import IconMessages from "~icons/tabler/messages"
import IconPlayerPlayFilled from "~icons/tabler/player-play-filled"
import styles from "./index.module.css"
import summary from "./summary.png"
import offline from "./offline.png"
import search from "./search.png"
import kamil from "./kamil.jpg"
import tags from "./tags.png"
import { Wordmark } from "../ext/popup/Wordmark"
import { DarkMode } from "../ext/popup/header/DarkMode"
import { ReactNode } from "react"
import { Glass } from "../ext/popup/Glass"
import { Link } from "../ext/popup/Link"

const Install = ( { suffix }: { suffix?: ReactNode } ) => <div className={ styles.install }>
    Install the{ " " }
    <Link prefix={ <IconBrandChrome/> } href="https://chrome.google.com/webstore/detail/pinbot/jbijbbnkaeclpmednjodmbdeobebiobg">extension for Chrome</Link>
    { suffix }
</div>

export default () => <>
    <div className={ styles.scroll }>
        <div className={ styles.headerContainer }>
            <Glass>
                <div className={ styles.header }>
                    <div>
                        <a className="clickableIcon" onClick={ () => document.querySelector( `.${ styles.features }` )?.scrollIntoView( { behavior: "smooth" } ) }>Features</a>
                        <a className="clickableIcon" onClick={ () => document.querySelector( `.${ styles.about }` )?.scrollIntoView( { behavior: "smooth" } ) }>About</a>
                    </div>
                    <Wordmark/><DarkMode/>
                </div>
            </Glass>
        </div>
        <div className={ styles.background }/>
        <div className={ styles.container }>
            <div className={ styles.hero }>
                <div className={ styles.headline }>Privately manage your bookmarks with AI.</div>
                <a href="https://www.youtube.com/watch?v=PQh1qhvxZzc" className={ styles.play } target="_blank">
                    <IconPlayerPlayFilled className="clickableIcon"/>
                </a>
                <Install suffix={ <>{ " " }or learn more<IconArrowDown/></> }/>
            </div>
            <div id="features" className={ styles.features }>
                { [
                    { title: "One-click bookmarks.", image: summary, text: "Pinbot pre-fills your bookmark with an editable summary and suggests tags. The picture shows an undedited example." },
                    { title: "Search with approximate words.", image: search, text: "Pinbot searches your notes and page content with natural language." },
                    { title: "Adapt Pinbot with tags.", image: tags, text: "You can use Pinbot as a to-do list, knowledge database, etc." },
                    { title: "Keep your data private.", image: offline, text: "Pinbot works offline: everything runs on your device." },
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
                    The current extension is only the starting point: I want to build Pinbot for and with its users. Your{ " " }<Link href="https://tally.so/r/3NravQ" prefix={ <IconMessageDots/> }> feedback</Link>{ " " }is welcome; if you want to discuss, I'll be happy to see you on Pinbot's{ " " }<Link href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>Discord server</Link>!
                </p>
            </div>
        </div>
    </div>
</>
