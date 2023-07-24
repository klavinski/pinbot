import { Animation } from "../Animation"
import { Panel } from "./Panel"
import styles from "./Subscriptions.module.css"

export const Subscriptions = () => <Panel
    icon={ isHovered => <Animation of="subscriptions" direction={ isHovered ? 1 : - 1 }/> }
    tooltip="Subscriptions"
>
    In a future version, Pinbot will regularly visit the following newline-separated URLs and save any new links as drafts.<br/>
    <br/>
    <textarea className={ styles.input } placeholder="https://example.com"/>
</Panel>
