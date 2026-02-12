"use client";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import { getAPIHandler } from "@/ApiConfig/service";
import axios from "axios";

function differenceInSeconds(date1) {
  if (!date1) return NaN; // Prevents errors if `date1` is missing
  const diffInMs = new Date() - new Date(date1);
  return Math.round(diffInMs / 1000); // Convert milliseconds to seconds
}

const LatestBetModal = ({ startGame }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [lastGameId, setLastGameId] = useState(null); // Track last processed gameId

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const modalInterval = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getLatestBet = async (source) => {
    try {
      const res = await getAPIHandler({
        endPoint: "getGameHistory",
        source: source,
      });

      if (res && res.data) {
        const latestGame = res.data?.result?.docs[0];

        if (!latestGame) {
          console.warn("No game data received.");
          return;
        }

        setData(latestGame);

        // Normalize playedStatus
        const normalizedPlayedStatus = latestGame.playedStatus
          ?.trim()
          .toUpperCase();

        // Validate createdAt and updatedAt
        if (
          !latestGame.createdAt ||
          isNaN(new Date(latestGame.createdAt).getTime())
        ) {
          console.warn("Invalid createdAt received:");
          return;
        }
        if (
          !latestGame.updatedAt ||
          isNaN(new Date(latestGame.updatedAt).getTime())
        ) {
          console.warn("Invalid updatedAt received:");
          return;
        }

        // Get the smallest time difference to ensure accuracy
        const gameTime = Math.min(
          differenceInSeconds(latestGame.createdAt),
          differenceInSeconds(latestGame.updatedAt)
        );

        // Get the latest gameId
        const latestGameId = latestGame._id;

        // Prevent duplicate modals
        const storedLastGameId = localStorage.getItem("lastGameId");

        // Show modal only for the latest game and if it's recent (up to 60 seconds old)
        if (
          latestGameId !== storedLastGameId &&
          ["LOSE", "WON"].includes(normalizedPlayedStatus) &&
          gameTime >= 0 && // Ensure it's not negative
          gameTime < 80
        ) {
          setOpen(true);
          localStorage.setItem("lastGameId", latestGameId);
          setLastGameId(latestGameId);
        }

        const gamedataItem = Object.entries(window.localStorage).find(([key]) =>
          key.includes("GameData")
        );

        if (gamedataItem) {
          const parsedGameData = JSON.parse(gamedataItem[1]);
          const calculatedLevelData = parsedGameData
            .slice(
              latestGame.level,
              5 * (1 + parseInt(latestGame.level / 5)) - latestGame.level
            )
            .reduce((acc, lev) => {
              return acc + parseFloat(lev.multiplier) * latestGame.betAmount;
            }, 0);

          setLevelData(calculatedLevelData);
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully (don't log it)
        //console.log("Request canceled due to component unmounting");
      } else {
        console.error("Error fetching category game data:", error);
      }
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    getLatestBet(source);
    return () => {
      source.cancel();
    };
  }, []);

  useEffect(() => {
    if (open) {
      clearTimeout(modalInterval.current);
      modalInterval.current = setTimeout(() => {
        setOpen(false);
      }, 1 * 60 * 1000);
    }
  }, [open]);

  if (!window.location.pathname.includes("/game") && data && open) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        disableAutoFocus
        aria-labelledby="latest-bet-modal"
        aria-describedby="latest-bet-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 100px #DE14FF",
          backgroundColor: "rgba(26, 13, 28 ,0.9)",
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              backgroundColor: "#DE14FF",
              padding: "1px",
              borderRadius: "30px",
              minWidth: isMobile ? "85%" : "40%",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#1A0D1C",
                color: "#91459E",
                borderRadius: "30px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                  borderRadius: "50px",
                  boxShadow: "0 0 10px 1px #da00ff",
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "fit-content",
                  padding: "10px",
                }}
                onClick={handleClose}
              >
                <img
                  src="/images/Dashboard/close.svg"
                  style={{ width: "15px", height: "15px" }}
                />
              </Box>

              <Box
                sx={{
                  height: "auto",
                  padding: "10px 0 15px",
                  width: "80%",
                  maxWidth: "400px",
                  display: "flex",
                  gap: "15px",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {data.playedStatus === "WON" && (
                  <img
                    src="/images/Dashboard/ticketsWon.svg"
                    style={{
                      width: isMobile ? "60px" : "120px",
                      height: isMobile ? "60px" : "120px",
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: isMobile ? "30px" : "35px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {data.playedStatus === "WON" ? (
                    "You’ve won"
                  ) : (
                    <>You’ve lost</>
                  )}
                </div>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                    filter: "drop-shadow(0 0 10px rgba(224, 20, 255, 0.3))",
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? "30px" : "50px",
                      color: "white",
                      fontWeight: "bold",
                      filter:
                        data.playedStatus === "WON"
                          ? "drop-shadow(0 0 10px rgba(224, 20, 255, 0.3))"
                          : "drop-shadow(0 0 10px rgba(255, 20, 110, 0.3))",
                    }}
                  >
                    {data.playedStatus === "WON"
                      ? data.prize.toFixed(2)
                      : data.betAmount}
                  </div>
                  <img
                    src="/images/ticket.png"
                    style={{
                      width: isMobile ? "25px" : "40px",
                      height: isMobile ? "25px" : "40px",
                      filter: "drop-shadow(0 0 10px rgba(224, 20, 255, 0.3))",
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  className="buttonBottom"
                  sx={{
                    border: "3px solid #DE14FF",
                    boxShadow: "0 0 10px #DE14FF",
                    background: "white",
                    fontWeight: "600",
                    "&:hover": {
                      margin: "1.5px",
                    },
                  }}
                  onClick={() => {
                    startGame();
                    handleClose();
                  }}
                >
                  Play Again
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return null;
};

export default LatestBetModal;
