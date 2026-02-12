"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./Footer.module.css";
import Profile from "../../../public/images/4dec/FooterIcons/porfile_modern_31.png";
import Tasks from "../../../public/images/4dec/FooterIcons/tasks_modern.png";
import Home from "../../../public/images/4dec/FooterIcons/Home.svg";
import Referral from "../../../public/images/4dec/FooterIcons/friends_gaming.png";
import Store from "../../../public/images/4dec/FooterIcons/Group.png";

const navigation = [
  { href: "/profile", icon: Profile, label: "Profile" },
  { href: "/tasks", icon: Tasks, label: "Tasks" },
  { href: "/", icon: Home, label: "Home" },
  { href: "/invitefriends", icon: Referral, label: "Referral" },
  { href: "/store", icon: Store, label: "Store" },
];

export function Footer() {
  const pathname = usePathname();

  // Disable click event if the tab is already active
  const handleClick = (e, href) => {
    if (pathname === href) {
      e.preventDefault(); // Prevent navigation if already on the same page
    }
  };

  return (
    <nav className={styles.footerTabs}>
      <ul className={styles.navList}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li
              key={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Link
                href={item.href}
                className={`${styles.navLink} ${
                  isActive ? styles.activeLink : ""
                } ${item.label === "Home" ? styles.homeIcon : ""}`}
                aria-label={item.label}
                onClick={(e) => handleClick(e, item.href)} // Prevent default action if already active
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  className={`${styles.navIcon} ${
                    isActive ? styles.activeIcon : ""
                  }`}
                  width={item.label === "Home" ? 30 : 24}
                  height={item.label === "Home" ? 30 : 24}
                  fetchpriority="high"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
