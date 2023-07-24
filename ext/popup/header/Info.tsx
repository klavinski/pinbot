import { Animation } from "../Animation"
import { version } from "../../../package.json"
import { Link } from "../Link"
import IconTablerMessages from "~icons/tabler/messages"
import IconTablerMessageDots from "~icons/tabler/message-dots"
import IconLucideBot from "~icons/lucide/bot"
import { Panel } from "./Panel"

export const Info = () => <Panel
    icon={ isHovered => <Animation of="info" direction={ isHovered ? 1 : - 1 }/> }
    tooltip="About Pinbot"
>
    <div>Pinbot v{ version }</div>
    <div>By Kamil Szczerba</div>
                    &nbsp;
    <Link href="https://getpinbot.com" prefix={ <IconLucideBot/> }>Visit the website</Link>
    <Link href="https://tally.so/r/3NravQ" prefix={ <IconTablerMessageDots/> }>Leave feedback</Link>
    <Link href="https://discord.gg/NetMteXfjf" prefix={ <IconTablerMessages/> }>Meet the community</Link>
</Panel>
