import React from 'react'
import { cn } from "../../../src/lib/util"
import styles from './NeonButton.module.css'

export function NeonButton({ className, children, icon, variant = "primary", ...props }) {
  return (
    <button
      className={cn(
        styles.neonButton,
        variant === "icon" && styles.iconVariant,
        className
      )}
      {...props}
    >
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  )
}

