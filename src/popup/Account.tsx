import { IconMoodSmile } from "@tabler/icons-react"
import styles from "./Account.module.css"

export const AccountButton = () => <div
    className={ [ styles.button, "clickableIcon" ].join( " " ) }
>
    <IconMoodSmile/>
</div>
