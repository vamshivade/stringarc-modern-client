"use client";
import React, { useContext, useEffect, useState } from "react";
import { NeonButton } from "../../components/NeonButton/NeonButton";
import { toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import styles from "./referel.module.css";
import AppContext from "@/context/AppContext";
import PageLoading from "@/components/PageLoader";
import { useRouter } from "next/router";
import ReactGA from "react-ga";

const InviteFriends = () => {
  const { getTickets, userData } = useContext(AppContext);
  const ticketQuantity = Number(getTickets?.ticketQuantity);

  const chatId = userData?.chatId;
  const botname = userData?.Bot_Name;
  const referralNote = userData?.Referral_Note;
  const referralTicketBalance = userData?.referralTicketBalance;

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [router.asPath]);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  const generateInviteLink = () => {
    return `https://t.me/share/url?url=https://t.me/${botname}/Play?startapp=${encodeURIComponent(
      chatId
    )}&text=${encodeURIComponent(referralNote)}%20${encodeURIComponent(
      referralTicketBalance
    )}`;
  };

  const handleCopy = () => {
    const link = `https://t.me/${botname}/Play?startapp=${chatId}\n${referralNote} ${referralTicketBalance}`;

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast.success("Link copied!");
        })
        .catch((err) => {
          // Fallback to execCommand if Clipboard API fails
          fallbackCopyTextToClipboard(link);
        });
    } else {
      // Fallback if Clipboard API is unavailable
      fallbackCopyTextToClipboard(link);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Style the textarea to be invisible
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    // Append the textarea to the body
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Link copied!");
      } else {
        // toast.error("Failed to copy the link.");
      }
    } catch (err) {
      console.error("Fallback: Unable to copy");
    }

    // Remove the textarea from the DOM
    document.body.removeChild(textArea);
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <main className={styles.main}>
      <div className={styles.inviteText}>
        1 Invite ={" "}
        <span className={styles.iconssPrice}>
          <img
            src="/images/thet.png"
            alt=""
            className="iconImage"
            style={{ width: "30px" }}
          />{" "}
          {referralTicketBalance && ticketQuantity
            ? (referralTicketBalance / ticketQuantity).toFixed(3)
            : 0}
        </span>
      </div>
      <div className={styles.avatars}>
        <img
          src={`/images/cyber_people.png`}
          alt="Avatar"
          className={styles.avatarImage}
        />
      </div>

      <div className={styles.walletNote}>
        <div className={styles.note}>Invite Friends!</div>
        <div className={styles.friends}>
          <div className={styles.referralContent}>
            <p>
              {referralNote} {referralTicketBalance}
            </p>
          </div>
        </div>

        <div className={styles.solPriceIcons}>
          <div className={styles.iconss}>
            <img
              src="/images/thet.png"
              alt=""
              className="iconImage"
              style={{ width: "30px" }}
            />
            <span className={styles.iconssPrice}>
              {referralTicketBalance && ticketQuantity
                ? (referralTicketBalance / ticketQuantity).toFixed(3)
                : 0}
            </span>
          </div>
          <div className={styles.iconss}>
            <img src="/images/4dec/Treasure Box2.png" alt="" />
            <span className={styles.iconssPrice}>
              {referralTicketBalance ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.inviteButtons}>
        <div className={styles.inviteLink}>
          <a
            href={generateInviteLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inviteLinkAnchor}
          >
            <NeonButton className={styles.inviteButton}>
              Invite a Friend
              <img
                src={`/images/friends_pixel.png`}
                alt="Invite Icon"
                className={styles.iconImage}
              />
            </NeonButton>
          </a>
        </div>
        <div className={styles.copyIcon}>
          <NeonButton
            variant="icon"
            className={styles.copyButton}
            onClick={handleCopy}
          >
            <img
              src={`/images/Copy.png`}
              alt="Copy Icon"
              className={styles.copyImage}
            />
          </NeonButton>
        </div>
      </div>
    </main>
  );
};

export default InviteFriends;
