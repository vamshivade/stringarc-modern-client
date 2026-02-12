"use client";

import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import styles from "./Banner.module.css";
import toast from "react-hot-toast";
import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
import { useRouter } from "next/router";
import AppContext from "@/context/AppContext";

export default function Banner({ categoryData }) {
  const [open, setOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { userData } = useContext(AppContext);

  // new states
  const [gameId, setGameId] = useState(null);
  const [gameStatus, setGameStatus] = useState("");
  const [gameCode, setGameCode] = useState(null);
  const [betAmount, setBetAmount] = useState(null);
  const [pathname, setPathname] = useState(null);

  const [showPopup, setShowPopup] = useState(false); // new state for the popup

  const fetchGameStatus = async () => {
    if (!userData) return;
    try {
      const { data } = await getAPIHandler({
        endPoint: "getgamestatus",
        paramsData: { userId: userData._id },
      });
      // console.log("Game status response in Doodle:", data);

      if (data.responseCode === 200) {
        const game = data.result.lastPreviousGame;
        // console.log("Game Data:", game);
        setPathname(game.gameTitle);
        setGameId(game.gameId);
        setGameStatus(game.gameStatus);
        setGameCode(game.gameCode);
        setBetAmount(game.betAmount);
      } else {
        // no active game
        setGameStatus("");
        setGameCode(null);
        setBetAmount(null);
      }
    } catch (err) {
      console.error("Error fetching game status:", err);
    }
  };

  useEffect(() => {
    fetchGameStatus();
  }, [userData]);

  // new handler
  const handlePlayNow = () => {
    if (gameStatus === "PLAYING" && gameCode != null) {
      setShowPopup(true);
    } else {
      // old flow
      setInputAmount("");
      setApiResponse(null);
      setError(null);
      setOpen(true);
      fetchGameStatus();
    }
  };

  // New resume handler to immediately route and close popup
  const handleResume = () => {
    setShowPopup(false);
    router.push({
      pathname: `/${pathname.split(" ").join("").toLowerCase()}/game`,
      query: {
        id: gameId,
        userId: userData._id,
        gameCode,
        inputAmount: betAmount,
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    setInputAmount("");
    setApiResponse(null);
    setError(null);
    fetchGameStatus();
  };

  const handleSubmit = async () => {
    setApiResponse(null);
    setError(null);

    if (!inputAmount) {
      setError("Please enter a ticket amount");
      setLoading(false); // Ensure buttons are enabled when error occurs
      return;
    }

    if (
      !inputAmount ||
      Number(inputAmount) <= 0 ||
      Number(inputAmount) > userData?.ticketBalance
    ) {
      toast.error("Insufficient Ticket Balance.");
      setLoading(false); // Ensure buttons are enabled when error occurs
      return;
    }
    if (Number(inputAmount) < categoryData?.min) {
      toast.error(`Please enter a value greater than ${categoryData?.min}.`);
      setLoading(false); // Ensure buttons are enabled when error occurs
      return;
    }
    if (Number(inputAmount) > categoryData?.max) {
      toast.error(`Please enter a value less than ${categoryData?.max}.`);
      setLoading(false); // Ensure buttons are enabled when error occurs
      return;
    }

    try {
      setLoading(true);
      const currentTimeUTC = new Date().toISOString();

      const response = await postAPIHandler({
        endPoint: "playGame",
        paramsData: {
          ticketAmount: inputAmount,
          gameId: categoryData?._id,
          // CurrentTime: currentTimeUTC,
        },
      });

      if (response && response.data?.responseCode === 200) {
        toast.success(response.data.responseMessage);
        // localStorage.setItem("gameCodeId", response?.data?.result?.gameCode);

        router.push({
          pathname: `/${categoryData.gameTitle
            .split(" ")
            .join("")
            .toLowerCase()}/game`,
          query: {
            id: categoryData?._id,
            userId: userData._id,
            inputAmount,
            gameCode: response?.data?.result?.gameCode,
          },
        });
      } else {
        toast.error(response.data.responseMessage);
        setOpen(false);
      }
    } catch (error) {
      //console.log("error");
      setOpen(false);
    } finally {
      setLoading(false); // Ensure buttons are enabled after processing is finished
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("refreshCount")) {
      sessionStorage.removeItem("refreshCount");
    }
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.gameContainer}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/doodle.jpg"
              alt="Doodle Jump Game"
              fill
              priority
              className={styles.gameImage}
            />
          </div>
          <div className={styles.playButtonContainer}>
            {/* <button className={styles.playNowButton} onClick={handleOpen}> */}
            <button
              className={styles.playNowButton}
              onClick={handlePlayNow}
              disabled={loading}
            >
              Play Now
            </button>
          </div>
        </div>

        {/* RESUME POPUP */}
        {showPopup && (
          <Dialog
            open={true}
            onClose={() => setShowPopup(false)}
            aria-labelledby="resume-dialog"
            fullScreen
            PaperProps={{ className: styles.dialogPaper }}
            BackdropProps={{ className: styles.backdrop }}
          >
            <DialogContent className={styles.dialogContent}>
              <div className={styles.popupCenter}>
                <h3
                  style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    fontSize: "1.3rem",
                  }}
                >
                  Your last game in <strong>{pathname}</strong> wasn’t
                  completed.
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#ff6b6b",
                      color: "#ffffff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={handleResume}
                  >
                    Resume {pathname}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog
          open={open}
          onClose={(event, reason) => {
            if (reason !== "backdropClick") {
              handleClose();
            }
          }}
          aria-labelledby="ticket-dialog"
          fullScreen
          PaperProps={{
            className: styles.dialogPaper,
          }}
          BackdropProps={{
            className: styles.backdrop,
          }}
        >
          <DialogContent className={styles.dialogContent}>
            <div className={styles.contentBox}>
              <div className={styles.ticketHeader}>
                <div className={styles.ticketIcon}>🎮</div>
                <div className={styles.ticketDisplay}>
                  Your Ticket: {userData?.ticketBalance?.toFixed(2) || "0"}
                </div>
              </div>

              <TextField
                fullWidth
                placeholder="Enter Ticket Amount"
                variant="outlined"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                onWheel={(e) => e.target.blur()}
                inputProps={{
                  min: 0,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                className={styles.textField}
                InputProps={{
                  className: styles.input,
                }}
                disabled={loading}
                error={!!error}
                helperText={
                  error && <span className={styles.errorText}>{error}</span>
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />

              {apiResponse && (
                <div className={styles.successMessage}>
                  Ticket submitted successfully!
                </div>
              )}

              <div className={styles.buttonContainer}>
                <button
                  className={styles.playButton}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.loadingContainer}>
                      <CircularProgress size={20} color="inherit" />
                      <span className={styles.loadingText}>Loading...</span>
                    </span>
                  ) : (
                    "Play Game"
                  )}
                </button>
                <button
                  className={styles.noButton}
                  onClick={handleClose}
                  disabled={loading}
                >
                  No
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
