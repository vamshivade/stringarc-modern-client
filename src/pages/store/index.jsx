import React, { useEffect, useState } from "react";
import styles from "./store.module.css";
import PopupStyles from "./buyboosters.module.css";
import { getAPIHandler } from "@/ApiConfig/service";
import { postAPIHandler } from "@/ApiConfig/service";
import axios from "axios";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Cell } from "@ton/core";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import Loader from "@/components/PaymentAnimation/PaymentAnimation";
import { useRouter } from "next/router";
import ReactGA from "react-ga";

export default function BoosterStore() {
  const router = useRouter();
  const [boosters, setBoosters] = useState([]);
  const [mint, setmint] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boosterMintAddress, setBoosterMintAddress] = useState("");
  const [tonUsdtPrice, setTonUsdtPrice] = useState(0);
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const [tonToSentAddress, setTonToSentAddress] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [isAnimationLoading, setIsAnimationLoading] = useState(false);

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");

    // Track page view
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [router.asPath]);

  // to get all boosters
  const getBoosters = async (source) => {
    try {
      const response = await getAPIHandler({
        endPoint: "boosterdata",
        source: source,
      });

      if (response && response.data?.responseCode === 200) {
        const activeBoosters = response.data.result.data.filter(
          (booster) => booster.Status === "ACTIVE"
        );

        setBoosters(activeBoosters);
        setmint(response.data.result.mint);
        setBoosterMintAddress(response.data.result.mint.BoosterMintAddress);
        setTonToSentAddress(response.data.result.mint.BoosterWalletAddress);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully (don't log it)
        //console.log("Request canceled due to component unmounting");
      } else {
        console.error("Error fetching category game data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTONtoUSDTprice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tonapi.io/v2/rates?tokens=TON&currencies=USDT"
      );

      if (response && response.status === 200) {
        setTonUsdtPrice(response.data.rates.TON.prices.USDT);
      }
    } catch (error) {
      //console.log("Error fetching TON to USDT price:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTONtoUSDTprice();
    const interval = setInterval(() => {
      fetchTONtoUSDTprice();
    }, 60000);

    return () => clearInterval(interval);
  }, [boosterMintAddress]);

  useEffect(() => {
    const source = axios.CancelToken.source();
    getBoosters(source);
    return () => {
      source.cancel("Request canceled due to component unmounting");
    };
  }, []);

  const convertTimeFormat = (timerInMinutes) => {
    const timerInSeconds = timerInMinutes * 60;
    let remainingSeconds = timerInSeconds;
    const hours = Math.floor(remainingSeconds / 3600);
    remainingSeconds %= 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
    }

    if (seconds > 0) {
      parts.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);
    }

    return parts.length > 0 ? parts.join(" ") : "0 sec";
  };

  const extractTransactionHash = (boc) => {
    try {
      const cell = Cell.fromBoc(Buffer.from(boc, "base64"))[0];
      const hash = cell.hash().toString("hex");
      return hash;
    } catch (error) {
      console.error("❌ Error extracting transaction hash:");
      return null;
    }
  };

  const handleSubmit = async (e, id, boosterUsdtPrice) => {
    if (e) {
      e.preventDefault();
    }

    if (!tonConnectUI.wallet) {
      toast.error("Please connect your wallet.");
      return;
    }

    const walletChain = tonConnectUI.wallet?.account?.chain;

    if (walletChain !== "-239") {
      toast.error("Please connect to the Mainnet wallet for transactions.");
      return;
    }

    const tonPrice = (boosterUsdtPrice / tonUsdtPrice).toFixed(3);

    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: tonToSentAddress,
          amount: Math.round(tonPrice * 1e9),
        },
      ],
    };

    try {
      const result = await tonConnectUI.sendTransaction(myTransaction);

      let extractedHash = null;

      if (result && result.boc) {
        extractedHash = extractTransactionHash(result.boc);
      }
      if (extractedHash) {
        //console.log("✅ Extracted Transaction Hash:");
      } else {
        console.error("❌ Transaction sent but no hash found.");
      }

      const data = {
        Amount: boosterUsdtPrice,
        Booster_Id: id,
        // boc: result.boc,
        Hash: extractedHash,
      };

      setIsAnimationLoading(true);

      const response = await postAPIHandler({
        endPoint: "boosterstatus",
        dataToSend: data,
      });

      if (response && response.status === 200) {
        toast.success(
          response.data.responseMessage ||
            "Activate your booster in your profile!"
        );
        setShowModal(true);
      } else {
        toast.error(response?.data?.message || response?.data?.responseMessage);
      }
    } catch (error) {
      console.error("Error sending transaction:");
    } finally {
      setIsAnimationLoading(false);
    }
  };

  const handleGoToProfile = () => {
    setShowModal(false);
    router.push("/profile");
  };

  return (
    <main className={styles.main}>
      <div className={styles.herobooster}>
        <h1 className={`${styles.title} mt-2`}>BOOSTERS</h1>
        <p className={styles.subtitle}>
          Utilize these to amplify your rewards while they remain active.
        </p>

        <div
          style={{
            display: "flex",
            margin: "5px auto 5px",
            justifyContent: "center",
          }}
        >
          <TonConnectButton />
        </div>
      </div>

      <div className={styles.grid}>
        {boosters.length > 0 ? (
          boosters.map((booster) => (
            <div key={booster._id} className={styles.card}>
              <div className={styles.icon}>
                <img
                  src={booster?.Image || "/images/default-booster.png"}
                  alt={booster.Name}
                  width={60}
                  height={60}
                  className={styles.boosterImage}
                />
              </div>
              <h2 className={styles.boosterName}>{booster.Name}</h2>
              <p className={styles.duration}>
                Duration: {convertTimeFormat(booster.Timer_InMinutes)}
              </p>
              <p className={styles.multiplier}>
                Multiplier: {booster.Booster_Multiplier}X
              </p>

              <p className={styles.price}>
                <img
                  src="/images/4dec/toncoin-ton-logo.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="me-1"
                />
                {tonUsdtPrice ? (booster.Price / tonUsdtPrice).toFixed(3) : 0}
                &nbsp;(${booster.Price})
              </p>

              <button
                className={styles.buyButton}
                onClick={(e) => handleSubmit(e, booster._id, booster.Price)}
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <p>{error}</p>
        )}
      </div>

      {showModal && (
        <div className={PopupStyles.customModalOverlay}>
          <div className={PopupStyles.customModal}>
            <div className={PopupStyles.modalContent}>
              <p
                className={PopupStyles.modalTerms}
                style={{ fontSize: "14px", fontWeight: 400 }}
              >
                Purchased boosters are shown in the profile section. Activate
                the purchased booster to double the rewards earned from each
                game or task. Boosters are only active for a specific duration
                as mentioned on the booster card.
              </p>
              <Button
                variant="primary"
                className={PopupStyles.goToProfileBtn}
                onClick={handleGoToProfile}
              >
                Go To Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAnimationLoading && <Loader />}
    </main>
  );
}
