'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave } from "@fortawesome/free-regular-svg-icons"
import { faRobot } from "@fortawesome/free-solid-svg-icons/faRobot"
import { faPaperclip } from "@fortawesome/free-solid-svg-icons"
import { faFaceGrin } from "@fortawesome/free-regular-svg-icons"
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons"
import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { useState } from "react"
import styles from "./sidebar.module.css"

config.autoAddCss = false

interface SidebarItem {
  icon: any
  label: string
  onClick?: () => void
}

export default function SideBar() {
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const items: SidebarItem[] = [
    { icon: faPaperclip, label: "Attachment" },
    { icon: faSave, label: "Save" },
    { icon: faFaceGrin, label: "Detect my mood" },
    { icon: faClockRotateLeft, label: "History" }
  ]

  const handleItemClick = (label: string) => {
    setActiveItem(label)
    // Handle click logic here
    console.log(`Clicked: ${label}`)
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        {items.map((item) => (
          <button
            key={item.label}
            className={`${styles.sidebarItem} ${activeItem === item.label ? styles.active : ''}`}
            onClick={() => handleItemClick(item.label)}
            aria-label={item.label}
            title={item.label}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>Eunoia v1.0</p>
      </div>
    </aside>
  )
}