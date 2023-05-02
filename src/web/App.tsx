import { IconArrowDown, IconBrandChrome } from "@tabler/icons-react"
import styles from "./App.module.css"
import darkMode from "./dark.png"
import bach from "./bach.png"
import { UI } from "../popup/UI.tsx"

export const App = () => <div className={ styles.container }>
    <div className={ styles.headline }>Privately search your browser history using AI.</div>
    <div className={ styles.install }><div>Install <UI prefix={ <IconBrandChrome/> } href="chrome">the extension for Chrome</UI> or learn more </div><IconArrowDown/>.</div>
    <div>
        <div>
            { [
                { title: "Use approximate words.", image: bach, text: "Pinbot will find matches even when you don't use the exact words." },
                { title: "Filter your results.", text: "You can specify a date range, a URL, or both." },
                { title: "Keep your history private.", text: "Everything is kept on your device." },
                { title: "Enjoy a user-first experience.", image: darkMode, text: "You can share your feedback or join the community and shape the future of Pinbot." },
            ].map( ( { title, image, text }, i ) => <div>
                <div className={ styles.subtitle }>
                    <div className={ styles.number }>{ i + 1 }</div>
                    { title }
                </div>
                <img src={ image }/>
                <div>
                    { text }
                </div>
            </div> ) }
        </div>
    </div>
</div>
