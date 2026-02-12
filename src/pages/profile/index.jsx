"use client";

import { useContext, useState, useEffect } from "react";
import styles from "./profile.module.css";
import { WithdrawModal } from "../../components/withdrawModel";
import { useRouter } from "next/router";
import AppContext from "@/context/AppContext";
import { postAPIHandler, getAPIHandler } from "@/ApiConfig/service";
import UserNameUpdate from "./userNameUpdate";
import PageLoading from "@/components/PageLoader";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";
import ReactGA from "react-ga";

export default function ProfileCard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("edit");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  // const [withdrawNote, setWithdrawNote] = useState("");

  const { getTickets, userData, ticketBalance } = useContext(AppContext);
  const {
    activeBooster,
    boosters,
    getBoosters,
    boosterStartTime,
    boosterEndTime,
  } = useContext(AppContext);

  const ticketQuantity = Number(getTickets?.ticketQuantity);

  const timerInMinutes = activeBooster?.Booster_Id?.Timer_InMinutes || 0;
  const initialTimeMs = timerInMinutes * 60000;

  const [timeLeft, setTimeLeft] = useState(initialTimeMs);

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [router.asPath]);

  function formatTime(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (minutes > 0) {
      return `${pad(minutes)}:${pad(seconds)}`;
    } else {
      return pad(seconds);
    }
  }

  // Format a static number of minutes into H/M/S (used for NON-ACTIVE boosters)
  const formatMinutesAsTime = (minutes) => {
    // Convert total minutes to total seconds
    const totalSeconds = minutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const remainder = totalSeconds % 3600;
    const mins = Math.floor(remainder / 60);
    const secs = remainder % 60;

    const pad = (num) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    } else if (mins > 0) {
      return `${pad(mins)}:${pad(secs)}`;
    } else {
      return pad(secs);
    }
  };

  // If the booster is active, set up an interval to count down
  useEffect(() => {
    let interval;
    if (boosterStartTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(boosterEndTime - now, 0);

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    } else {
      // If countdown hasn't started, display the initial time format
      setTimeLeft(initialTimeMs);
    }

    return () => clearInterval(interval);
  }, [boosterStartTime, boosterEndTime, initialTimeMs]);

  // Activate a booster
  const activateBooster = async (id, boosterId, Amount) => {
    if (activeBooster) {
      toast.error("Already Booster Activated");
      return;
    }

    const startTime = new Date();
    try {
      const data = {
        Amount: Amount,
        Booster_Id: boosterId,
        BoosterStart: startTime,
      };
      const response = await postAPIHandler({
        endPoint: `boosterstatus`,
        dataToSend: data,
        paramsData: {
          id,
        },
      });

      if (response && response.data?.responseCode === 200) {
        toast.success("Booster Activated");
        getBoosters();
      }
    } catch (error) {
      console.error("Error activating booster:");
    }
  };

  const [encryptedHash, setEncryptedHash] = useState("");
  const [chatId, setChatId] = useState(""); // Example chatId
  const [productName, setProductName] = useState(""); // Example productName

  useEffect(() => {
    if (userData) {
      // //console.log("userData in profile", userData?.chatId, userData?.Bot_Name);
      setChatId(userData?.chatId);
      setProductName(userData?.Bot_Name);
    }
  }, [userData]);

  // useEffect(() => {
  //   const fetchWebAppInitData = () => {
  //     if (
  //       window.Telegram &&
  //       window.Telegram.WebApp &&
  //       window.Telegram.WebApp.initData
  //     ) {
  //       return window.Telegram.WebApp.initData;
  //     }
  //     return null;
  //   };

  //   const webAppInitData = fetchWebAppInitData();

  //   if (!webAppInitData) return;

  //   // parse into object�
  //   const params = new URLSearchParams(webAppInitData);
  //   const raw = Object.fromEntries(params.entries());
  //   if (raw.user) raw.user = JSON.parse(decodeURIComponent(raw.user));

  //   const payload = { userdata: raw, productName: productName };
  //   const plainText = JSON.stringify(payload);

  //   // AES-encrypt
  //   const secretKey = process.env.NEXT_PUBLIC_SECRET_SW_KEY;
  //   const cipher = CryptoJS.AES.encrypt(plainText, secretKey)
  //     .toString()
  //     .replace(/\+/g, "-")
  //     .replace(/\//g, "_")
  //     .replace(/=+$/, "");

  //   setEncryptedHash(cipher);
  // }, [productName]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "edit") {
      setIsEditProfileOpen(true);
      setIsWithdrawOpen(false);
    } else if (tab === "withdraw") {
      router.push(
        `https://t.me/stringwithdrawbank_bot/withdraw`
      );
      setIsWithdrawOpen(false);
      setIsEditProfileOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditProfileOpen(false);
    setIsWithdrawOpen(false);
  };

  const handleSave = (newUsername) => {
    //console.log("Saving username:");
  };

  // Filter boosters to display only active or pending ones
  const filteredBoosters = boosters.filter(
    (booster) => booster.Status !== "COMPLETED"
  );

  const navigateToReferralHistory = () => {
    router.push("/profile/referralHistories");
  };
  const navigateToBoosterHistory = () => {
    router.push("/profile/boosterHistories");
  };

  // If no user data, show a spinner
  if (!userData && !localStorage.getItem("modernToken3")) {
    return <PageLoading />;
  }

  return (
    <>
      {userData && (
        <div className={styles.main}>
          {/* User Info Card */}
          <div className={styles.card}>
            <div className={styles.avatar}>
              <img
                src={userData?.profilePic || "/images/prop.png"}
                alt="Profile Avatar"
              />
            </div>
            <h1 className={styles.name}>{userData?.userName}</h1>

            {/* Balance */}
            <div className={styles.walletBalance}>
              <img
                src="/images/thet.png"
                className={styles.balanceImage}
                alt="Balance Icon"
              />
              <span>
                &nbsp;
                {isNaN(parseFloat(userData?.ticketBalance / ticketQuantity))
                  ? 0
                  : parseFloat(
                      userData?.ticketBalance / ticketQuantity
                    ).toFixed(3)}
              </span>
            </div>

            <div className={styles.balanceContainer}>
              <div className={styles.score}>{ticketBalance}</div>
            </div>

            {/* Nav Buttons */}
            <nav className={styles.nav}>
              <button
                className={`${styles.navButton} ${
                  activeTab === "edit" ? styles.active : ""
                }`}
                onClick={() => handleTabClick("edit")}
              >
                Edit
              </button>
              <button
                className={`${styles.navButton} ${
                  activeTab === "withdraw" ? styles.active : ""
                }`}
                onClick={() => handleTabClick("withdraw")}
                // onClick={navigateToWithdrawPage}
              >
                Withdraw
              </button>
            </nav>

            {/* Referral / Booster History */}
            <div className={styles.fieldsContainer}>
              <div className={styles.rest}>
                <div className={styles.field}>
                  <img
                    src="/images/refer.png"
                    alt="Referral Icon"
                    className={styles.fieldImage}
                  />
                  <div
                    className={styles.balanceText}
                    onClick={navigateToReferralHistory}
                  >
                    <div>Referral History</div>
                    <img
                      src="/images/arrow-right.png"
                      className={styles.arrowSymbol}
                      alt="Balance Icon"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.rest}>
                <div className={styles.field}>
                  <img
                    src="/images/history.png"
                    alt="History Icon"
                    className={styles.fieldImage}
                  />
                  <div
                    className={styles.balanceText}
                    onClick={navigateToBoosterHistory}
                  >
                    <div>Booster history</div>
                    <img
                      src="/images/arrow-right.png"
                      className={styles.arrowSymbol}
                      alt="Balance Icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booster Cards */}
          <div style={{ width: "100%", position: "relative" }}>
            <div
              className={styles.grid}
              style={{ width: "100%", paddingBottom: "20px" }}
            >
              {filteredBoosters.map((booster) => {
                const displayTime =
                  booster.Status === "ACTIVE"
                    ? formatTime(timeLeft)
                    : formatMinutesAsTime(
                        booster.Booster_Id?.Timer_InMinutes ?? 0
                      );

                return (
                  <div
                    key={booster._id}
                    className={`${styles.boosterCard} ${
                      booster.Status === "ACTIVE" ? styles.activeBooster : ""
                    }`}
                  >
                    <img
                      src={
                        booster.Booster_Id?.Image ||
                        "/images/default-booster.png"
                      }
                      alt={booster.Name}
                      width={60}
                      height={60}
                      className={`${styles.boosterImage} ${
                        booster.Status === "ACTIVE"
                          ? styles.activeBoosterImage
                          : ""
                      }`}
                    />
                    <h2 className={styles.boosterName}>
                      {booster.Booster_Id?.Name}
                    </h2>

                    {/* Display either the countdown or the static time */}
                    <h5
                      className="m-0"
                      style={{ letterSpacing: "1px", fontWeight: "600" }}
                    >
                      {displayTime}
                    </h5>

                    <button
                      className={`${styles.buyButtonBtn} ${
                        booster.Status === "ACTIVE" ? styles.activeButton : ""
                      }`}
                      onClick={() =>
                        activateBooster(
                          booster._id,
                          booster.Booster_Id._id,
                          booster.Amount
                        )
                      }
                      disabled={booster.Status === "ACTIVE"}
                    >
                      {booster.Status === "ACTIVE" ? "ACTIVATED" : "ACTIVATE"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isEditProfileOpen && (
        <UserNameUpdate
          isOpen={isEditProfileOpen}
          onClose={handleCloseModal}
          userData={userData}
          onSave={handleSave}
        />
      )}
      {isWithdrawOpen && (
        <WithdrawModal isOpen={isWithdrawOpen} onClose={handleCloseModal} />
      )}
    </>
  );
}
