import styles from "./Alerts.module.css"
import { IconBell03 } from "untitled-ui-icons"

export const AlertsButton = () => <div className={ [ styles.button, "clickableIcon" ].join( " " ) }>
    <IconBell03/>
</div>
