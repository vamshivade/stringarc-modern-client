import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import DashboardLayout from "@/layout/DashboardLayout";
import { styled } from "@mui/system";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
import ReactGA from "react-ga";
import toast from "react-hot-toast";

// Styled components for the UI elements
const BlurredBackground = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  backgroundImage:
    "linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.29) ),",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  filter: "blur(8px)",
});

const DoodleJumpGameBox = styled(Box)(({ theme }) => ({
  // border: "2px solid red",
  width: "100%",
  height: "94vh",
  position: "absolute",
  zIndex: 2,
  "& iframe": {
    minHeight: "calc(100vh - 250px)",
    overflow: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
    alignItems: "center",
    border: "3px solid blue",
    [theme.breakpoints.down("sm")]: {
      minHeight: "calc(100vh - 383px)",
      margin: "0",
    },
  },
}));

// Styled components for game UI elements
const Container = styled("div")({
  width: "98%",
  height: "60vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  backgroundImage: "url(background.png)",
  border: `2px solid black`,
});

const ScoreBoard = styled("div")({
  background: "rgba(182, 200, 220, 0.7)",
  position: "absolute",
  top: "-3px",
  left: "0",
  zIndex: -1,
  borderImage: "url(floor.png) 100 5 round",
  fontSize: "14px",
});

// Modal styles updated for 100vh background, position fixed, and z-index 1000
const Modal = styled("div")({
  height: "100vh",
  width: "100%",
  textAlign: "center",
  position: "fixed", // Changed from absolute to fixed
  top: 0,
  left: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)", // Overlay background color
  zIndex: 1000, // Ensures the modal appears on top
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  visibility: "hidden",
});

const ModalContent = styled("div")({
  backgroundColor: "#28192b",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  fontSize: "14px",
  color: "white",
  boxShadow: "0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)",
});

const StyledButton = styled("button")({
  background: "#44134b",
  border: "1px solid #9c27b0",
  padding: "8px 10px",
  borderRadius: "130px",
  color: "#ffffffc2",
  fontWeight: 300,
  fontSize: "14px",
  cursor: "pointer",
  margin: "10px",
  transition: "background 0.3s",
  "&:hover": {
    background: "#550861",
  },
});

const DoodleJumpGame = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const router = useRouter();
  const gameId = router.query.id;
  const inputAmount = router.query.inputAmount;
  const userId = router.query.userId;
  const gameCode = router.query.gameCode;

  const didAutoExit = useRef(false); // guards auto-exit API call
  const gameDoneRef = useRef(false); // marks “game completed normally”

  const firstPageURL = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/doodlejumpgame?${gameId}`;

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");
    ReactGA.pageview(window.location.pathname + window.location.search);

    const handleAutoExit = async () => {
      // If already auto-exited OR game completed normally, skip
      if (didAutoExit.current || gameDoneRef.current) return;
      didAutoExit.current = true;

      await refreshedGame();
    };

    window.addEventListener("beforeunload", handleAutoExit);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleAutoExit();
      }
    });

    // Initialize Telegram WebApp and add back button logic
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();

      tg.BackButton.onClick(() => {
        tg.BackButton.hide(); // Hide the back button
        // Call refreshedGame and redirect on back button click
        refreshedGame();
      });
    }

    return () => {
      window.removeEventListener("beforeunload", handleAutoExit);
      document.removeEventListener("visibilitychange", handleAutoExit);
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.BackButton.hide(); // Ensure the back button is hidden when leaving the page
      }
    };
  }, [firstPageURL, router.asPath]);

  // Function to handle API call when the game is refreshed
  const refreshedGame = async () => {
    // Prepare data payload for the API request
    const data = {
      gameId: gameId,
      level: 0,
      gameCode: String(gameCode),
      prize: 0,
      highestScore: 0,
      playedStatus: "LOSE",
    };

    // Send the data to the server
    try {
      const response = await postAPIHandler({
        endPoint: "createGameHistory",
        dataToSend: data,
      });

      // console.log("refreshedGame API response:", response);

      // Redirection logic inside the refreshedGame function
      setTimeout(() => {
        const firstPageURL = `${window.location.origin}/doodlejumpgame?${gameId}`;
        window.location.href = firstPageURL;
      }, 1000);

      return response;
    } catch (error) {
      console.error("Error posting score:", error);
    }
  };

  useEffect(() => {
    if (!gameId) {
      console.error("Game ID is missing");
      return; // Exit early if gameId is not available
    }

    const firstPageURL = `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/doodlejumpgame?${gameId}`;

    let count = parseInt(sessionStorage.getItem("refreshCount") || "0", 10) + 1;
    sessionStorage.setItem("refreshCount", String(count));
    if (count >= 2 && !gameDoneRef.current) {
      sessionStorage.removeItem("refreshCount");
      refreshedGame();
    }
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => (window.location.href = firstPageURL);
  }, [gameId]);

  useEffect(() => {
    // Define global functions so they can be used in inline attributes.
    window.toggleSound = function () {
      const gameAudio = document.getElementById("gameAudio");
      const soundButton = document.getElementById("soundButton");
      if (gameAudio.paused) {
        gameAudio.play();
        soundButton.innerHTML = "&#128266;";
      } else {
        gameAudio.pause();
        soundButton.innerHTML = "&#128263;";
      }
    };

    window.toggleFullScreen = function () {
      const container = document.querySelector("body");
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.mozRequestFullScreen)
          container.mozRequestFullScreen();
        else if (container.webkitRequestFullscreen)
          container.webkitRequestFullscreen();
        else if (container.msRequestFullscreen) container.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    };

    // Define bTouch and Dir as in the original code.
    const ua = navigator.userAgent;
    const bTouch = !(
      ua.indexOf("(iP") === -1 &&
      ua.indexOf("Android") === -1 &&
      ua.indexOf("BlackBerry") === -1 &&
      ua.indexOf("HTC") === -1 &&
      ua.indexOf("PlayBook") === -1 &&
      ua.indexOf("webOS") === -1 &&
      ua.indexOf("IEMobile") === -1 &&
      ua.indexOf("Silk") === -1
    );
    let Dir = "left";
    // Expose Dir globally for inline touch attributes.
    window.Dir = Dir;

    // Mobile controls helper to inject arrow buttons into the element with id="keys"
    function mobile(id) {
      const o = document.getElementById(id);
      if (o && bTouch) {
        o.innerHTML = `
          <div style="border:1px solid black; background:#6cab39; color:white; border-radius:10px; width:60px; height:60px; display:flex; align-items:center; justify-content:center; font-size:20px; -webkit-user-select:none; text-align:center; flex-direction:column; align-items:center"
              ontouchend="window.Dir='left'; window.player.isMovingLeft = false;"
              ontouchstart="window.Dir='left'; window.player.isMovingLeft = true;">
              ←
          </div>
          <div style="border:1px solid black; background:#6cab39; color:white; border-radius:10px; width:60px; height:60px; display:flex; align-items:center; justify-content:center; font-size:20px; -webkit-user-select:none; text-align:center; flex-direction:column; align-items:center"
              ontouchend="window.Dir='right'; window.player.isMovingRight = false;"
              ontouchstart="window.Dir='right'; window.player.isMovingRight = true;">
              →
          </div>
        `;
        const scoreBoard = document.getElementById("scoreBoard");
        if (scoreBoard) {
          scoreBoard.style.height = "fit-content";
          scoreBoard.style.fontSize = "12px";
        }
        document.body.addEventListener("touchmove", (event) =>
          event.preventDefault()
        );
        setTimeout(() => window.scrollTo(0, 1), 1);
      }
    }
    mobile("keys");

    // Game initialization and logic
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 422,
      height = 552;
    canvas.width = width;
    canvas.height = height;

    let platforms = [],
      image = document.getElementById("sprite"),
      player,
      platformCount = 10,
      position = 0,
      gravity = 0.2,
      broken = 0,
      score = 0,
      firstRun = true,
      gameOverTriggered = false;

    let best = localStorage.getItem("bestScore")
      ? parseInt(localStorage.getItem("bestScore"), 10)
      : 0;
    let betAmount = parseFloat(inputAmount);
    if (isNaN(betAmount)) betAmount = 0;
    let ticketsEarned = 0;
    let doodleJumpLevelData =
      JSON.parse(localStorage.getItem("doodleJumpLevelData")) || [];
    let currentLevelIndex = 0;
    let nextLevelScore = doodleJumpLevelData[currentLevelIndex]
      ? parseInt(doodleJumpLevelData[currentLevelIndex].additionalParams.score)
      : 100;

    // Function to fetch game status
    async function fetchGameStatus() {
      // console.log("userId in fetchGameStatus:", userId);

      try {
        const { data } = await getAPIHandler({
          endPoint: "getgamestatus",
          paramsData: { userId: userId, gameCode: gameCode },
        });

        // console.log("Game status response in Doodle:", data);

        if (data.responseCode === 200) {
          const game = data.result.lastPreviousGame;
          return game;
        }
      } catch (err) {
        console.error("Error fetching game status:", err);
      }
    }

    async function updateHistory(won) {
      gameDoneRef.current = true; // ← mark normal completion

      const prevGameData = await fetchGameStatus();
      // console.log("prevGameData in updateHistory:", prevGameData);

      // console.log("createdAt in updateHistory:", prevGameData.createdAt);
      // console.log("updatedAt in updateHistory:", prevGameData.updatedAt);
      // console.log(
      //   "Condition check:",
      //   prevGameData.createdAt &&
      //     prevGameData.updatedAt &&
      //     prevGameData.createdAt !== prevGameData.updatedAt
      // );

      // Prepare data payload for the API request
      const data2 = {
        gameId: prevGameData.gameId,
        level: prevGameData.level,
        gameCode: String(prevGameData.gameCode),
        prize: prevGameData.prize,
        highestScore: prevGameData.highestScore,
        playedStatus: prevGameData.playedStatus,
      };

      // Prepare data payload for the API request
      const data = {
        gameId: gameId,
        level: won ? currentLevelIndex : 0,
        gameCode: String(gameCode),
        prize: won ? ticketsEarned : 0,
        highestScore: won ? score : 0,
        playedStatus: won ? "WON" : "LOSE",
        levelData: doodleJumpLevelData,
      };

      // Show toast if game already completed
      if (prevGameData.createdAt !== prevGameData.updatedAt) {
        toast.error("Game already completed in another tab/device.");
      }

      // Choose which data to send
      const dataToSend =
        prevGameData.createdAt !== prevGameData.updatedAt ? data2 : data;

      // console.log("Posting game history with data:", dataToSend);

      // Send the data to the server
      try {
        const response = await postAPIHandler({
          endPoint: "createGameHistory",
          dataToSend: dataToSend,
        });
        // console.log("Game history response:", response.data.result);

        return response;
      } catch (error) {
        console.error("Error posting score:");
      }
    }

    // Get modal elements by their IDs (they exist in the returned JSX)
    const modal = document.getElementById("levelModal");
    const modalText = document.getElementById("modalText");
    const quitButton = document.getElementById("quitButton");
    const continueButton = document.getElementById("continueButton");
    const winningModal = document.getElementById("winningModal");
    const winningAmount = document.getElementById("winningAmount");
    const exitButton = document.getElementById("exitButton");
    const gameContainer = containerRef.current;
    let isPaused = false;
    let modalTimeout;

    async function redirectAndSaveHistory(won) {
      await updateHistory(won);

      setTimeout(() => {
        window.parent.location.href = window.location.origin.concat(
          `/doodlejumpgame?${gameId}`
        );
      }, 1000);
      // }, 1 * 60 * 1000);
    }

    function updateBestScore() {
      if (score > best) {
        best = score;
        localStorage.setItem("bestScore", best);
      }
    }

    if (quitButton) {
      quitButton.onclick = async function () {
        quitButton.disabled = true;
        try {
          clearTimeout(modalTimeout);
          modal.style.visibility = "hidden";
          gameContainer.classList.remove("blur");
          isPaused = true;
          await redirectAndSaveHistory(true);
        } catch (error) {
          console.error("An error occurred:");
        }
      };
    }

    if (continueButton) {
      continueButton.onclick = function () {
        clearTimeout(modalTimeout);
        modal.style.visibility = "hidden";
        gameContainer.classList.remove("blur");
        isPaused = false;
      };
    }

    if (exitButton) {
      exitButton.onclick = function () {
        exitButton.disabled = true;
        redirectAndSaveHistory(true);
      };
    }

    function showLevelModal() {
      isPaused = true;
      gameContainer && gameContainer.classList.add("blur");
      modalText && (modalText.innerHTML = `${ticketsEarned.toFixed(2)}`);
      modal && (modal.style.visibility = "visible");
      modalTimeout = setTimeout(() => {
        continueButton && continueButton.onclick();
      }, 1 * 60 * 1000); // 1 minute
    }

    function showWinningModal() {
      isPaused = true;
      gameContainer && gameContainer.classList.add("blur");
      winningAmount &&
        (winningAmount.innerHTML = `${ticketsEarned.toFixed(2)}`);
      winningModal && (winningModal.style.visibility = "visible");
    }

    // Sprite constructor
    function Sprite(img, x, y, width, height) {
      this.img = img;
      this.x = x * 2;
      this.y = y * 2;
      this.width = width * 2;
      this.height = height * 2;
    }
    Sprite.prototype.draw = function (ctx, x, y) {
      ctx.drawImage(
        this.img,
        this.x,
        this.y,
        this.width,
        this.height,
        x,
        y,
        this.width,
        this.height
      );
    };

    // Base platform
    function Base() {
      this.height = 5;
      this.width = width;
      this.cx = 0;
      this.cy = 614;
      this.cwidth = 100;
      this.cheight = 5;
      this.x = 0;
      this.y = height - this.height;
      this.draw = function () {
        try {
          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
    }
    const base = new Base();

    // Player constructor
    function Player() {
      this.vy = 11;
      this.vx = 0;
      this.isMovingLeft = false;
      this.isMovingRight = false;
      this.isDead = false;
      this.width = 55;
      this.height = 40;
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 110;
      this.cheight = 80;
      this.dir = "left";
      this.x = width / 2 - this.width / 2;
      this.y = height;
      this.draw = function () {
        try {
          if (this.dir === "right") this.cy = 121;
          else if (this.dir === "left") this.cy = 201;
          else if (this.dir === "right_land") this.cy = 289;
          else if (this.dir === "left_land") this.cy = 371;
          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
      this.jump = function () {
        this.vy = -8;
      };
      this.jumpHigh = function () {
        this.vy = -16;
      };
    }
    player = new Player();
    // Expose the player globally for the mobile arrow events.
    window.player = player;

    // Platform constructor
    function Platform() {
      this.width = 70;
      this.height = 17;
      this.x = Math.random() * (width - this.width);
      this.y = position;
      position += height / platformCount;
      this.flag = 0;
      this.state = 0;
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 105;
      this.cheight = 31;
      this.draw = function () {
        try {
          if (this.type === 1) this.cy = 0;
          else if (this.type === 2) this.cy = 61;
          else if (this.type === 3 && this.flag === 0) this.cy = 31;
          else if (this.type === 3 && this.flag === 1) this.cy = 1000;
          else if (this.type === 4 && this.state === 0) this.cy = 90;
          else if (this.type === 4 && this.state === 1) this.cy = 1000;
          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
      this.types = [1];
      if (score >= 1000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
      else if (score >= 500 && score < 1000)
        this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
      else if (score >= 350 && score < 500)
        this.types = [2, 2, 2, 3, 3, 3, 3, 3];
      else if (score >= 200 && score < 350)
        this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
      else if (score >= 100 && score < 200) this.types = [1, 1, 1, 1, 2, 2];
      this.type = this.types[Math.floor(Math.random() * this.types.length)];
      if (this.type === 3 && broken < 1) {
        broken++;
      } else if (this.type === 3 && broken >= 1) {
        this.type = 1;
        broken = 0;
      }
      this.vx = 1;
    }
    for (let i = 0; i < platformCount; i++) {
      platforms.push(new Platform());
    }

    // Broken platform substitute
    function PlatformBrokenSubstitute() {
      this.height = 30;
      this.width = 70;
      this.x = 0;
      this.y = 0;
      this.cx = 0;
      this.cy = 554;
      this.cwidth = 105;
      this.cheight = 60;
      this.appearance = false;
      this.draw = function () {
        try {
          if (this.appearance === true)
            ctx.drawImage(
              image,
              this.cx,
              this.cy,
              this.cwidth,
              this.cheight,
              this.x,
              this.y,
              this.width,
              this.height
            );
        } catch (e) {}
      };
    }
    const platformBrokenSubstitute = new PlatformBrokenSubstitute();

    // Spring object
    function Spring() {
      this.x = 0;
      this.y = 0;
      this.width = 26;
      this.height = 30;
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 45;
      this.cheight = 53;
      this.state = 0;
      this.draw = function () {
        try {
          if (this.state === 0) this.cy = 445;
          else if (this.state === 1) this.cy = 501;
          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
    }
    const SpringObj = new Spring();

    // Main game initialization function
    function init() {
      let dir = "left",
        jumpCount = 0;
      window.toggleSound();
      firstRun = false;

      function paintCanvas() {
        ctx.clearRect(0, 0, width, height);
      }

      async function playerCalc() {
        if (bTouch) dir = window.Dir;
        if (dir === "left") {
          player.dir = "left";
          if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
        } else if (dir === "right") {
          player.dir = "right";
          if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
        }
        document.onkeydown = function (e) {
          const key = e.keyCode;
          if (key === 37) {
            dir = "left";
            player.isMovingLeft = true;
          } else if (key === 39) {
            dir = "right";
            player.isMovingRight = true;
          }
        };
        document.onkeyup = function (e) {
          const key = e.keyCode;
          if (key === 37) {
            dir = "left";
            player.isMovingLeft = false;
          } else if (key === 39) {
            dir = "right";
            player.isMovingRight = false;
          }
        };
        if (player.isMovingLeft === true) {
          player.x += player.vx;
          player.vx -= 0.15;
        } else {
          player.x += player.vx;
          if (player.vx < 0) player.vx += 0.1;
        }
        if (player.isMovingRight === true) {
          player.x += player.vx;
          player.vx += 0.15;
        } else {
          player.x += player.vx;
          if (player.vx > 0) player.vx -= 0.1;
        }
        if (player.vx > 8) player.vx = 8;
        else if (player.vx < -8) player.vx = -8;
        if (player.y + player.height > base.y && base.y < height) player.jump();
        if (
          base.y > height &&
          player.y + player.height > height &&
          player.isDead !== "lol"
        )
          player.isDead = true;
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;
        if (player.y >= height / 2 - player.height / 2) {
          player.y += player.vy;
          player.vy += gravity;
        } else {
          platforms.forEach(function (p, i) {
            if (player.vy < 0) {
              p.y -= player.vy;
            }
            if (p.y > height) {
              platforms[i] = new Platform();
              platforms[i].y = p.y - height;
              score++;
              updateGameSpeedAndGravity();
            }
          });
          base.y -= player.vy;
          player.vy += gravity;
          if (player.vy >= 0) {
            player.y += player.vy;
            player.vy += gravity;
          }
        }
        collides();
        if (player.isDead === true) await gameOver();
      }

      function springCalc() {
        const s = SpringObj;
        const p = platforms[0];
        if (p.type === 1 || p.type === 2) {
          s.x = p.x + p.width / 2 - s.width / 2;
          s.y = p.y - p.height - 10;
          if (s.y > height / 1.1) s.state = 0;
          s.draw();
        } else {
          s.x = 0 - s.width;
          s.y = 0 - s.height;
        }
      }

      function platformCalc() {
        const subs = platformBrokenSubstitute;
        platforms.forEach(function (p, i) {
          if (p.type === 2) {
            if (p.x < 0 || p.x + p.width > width) p.vx *= -1;
            p.x += p.vx;
          }
          if (p.flag === 1 && subs.appearance === false && jumpCount === 0) {
            subs.x = p.x;
            subs.y = p.y;
            subs.appearance = true;
            jumpCount++;
          }
          p.draw();
        });
        if (subs.appearance === true) {
          subs.draw();
          subs.y += 8;
        }
        if (subs.y > height) subs.appearance = false;
      }

      function collides() {
        platforms.forEach(function (p) {
          if (
            player.vy > 0 &&
            p.state === 0 &&
            player.x + 15 < p.x + p.width &&
            player.x + player.width - 15 > p.x &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + p.height
          ) {
            if (p.type === 3 && p.flag === 0) {
              p.flag = 1;
              jumpCount = 0;
              return;
            } else if (p.type === 4 && p.state === 0) {
              player.jump();
              p.state = 1;
            } else if (p.flag === 1) return;
            else {
              player.jump();
            }
          }
        });
        const s = SpringObj;
        if (
          player.vy > 0 &&
          s.state === 0 &&
          player.x + 15 < s.x + s.width &&
          player.x + player.width - 15 > s.x &&
          player.y + player.height > s.y &&
          player.y + player.height < s.y + s.height
        ) {
          s.state = 1;
          player.jumpHigh();
        }
      }

      function updateScore() {
        const scoreEl = document.getElementById("score");
        const currentLevelEl = document.getElementById("currentLevel");
        const highScoreEl = document.getElementById("highScore");
        const accumulatedTicketsEl =
          document.getElementById("accumulatedTickets");
        if (scoreEl) scoreEl.innerHTML = score;
        if (currentLevelEl) currentLevelEl.innerHTML = currentLevelIndex + 1;
        if (highScoreEl) highScoreEl.innerHTML = best;
        if (accumulatedTicketsEl)
          accumulatedTicketsEl.innerHTML = ticketsEarned.toFixed(2);
      }

      async function gameOver() {
        if (!gameOverTriggered) {
          gameOverTriggered = true;
          await updateHistory(false);
          const lostModal = document.getElementById("lostModal");

          lostModal.style.visibility = "visible";
          gameContainer.classList.add("blur");

          setTimeout(() => {
            window.parent.location.href = window.location.origin.concat(
              `/doodlejumpgame?${gameId}`
            );
          }, 1000);
        }
      }

      async function update() {
        if (!isPaused) {
          paintCanvas();
          platformCalc();
          springCalc();
          await playerCalc();
          player.draw();
          base.draw();
          updateScore();
        }
      }

      function updateGameSpeedAndGravity() {
        const boosterMultiplier = parseFloat(
          window.localStorage.getItem("Booster_Multiplier")
        );
        if (
          score >= nextLevelScore &&
          currentLevelIndex === doodleJumpLevelData.length - 1
        ) {
          let newReward =
            betAmount *
            parseFloat(doodleJumpLevelData[currentLevelIndex].multiplier);

          if (!isNaN(boosterMultiplier)) {
            newReward *= boosterMultiplier;
          }
          ticketsEarned += newReward;
          // console.log(
          //   `Level ${
          //     currentLevelIndex + 1
          //   } prize: ${newReward} | Total tickets: ${ticketsEarned}`
          // );
          // Always show winningModal on last level
          showWinningModal();
          currentLevelIndex++;
        } else if (
          score >= nextLevelScore &&
          currentLevelIndex < doodleJumpLevelData.length - 1
        ) {
          const currentLevel =
            doodleJumpLevelData[
              Math.min(currentLevelIndex, doodleJumpLevelData.length - 1)
            ];
          const nextLevel =
            doodleJumpLevelData[
              Math.min(currentLevelIndex + 1, doodleJumpLevelData.length - 1)
            ];
          let newReward = betAmount * parseFloat(currentLevel.multiplier);
          if (!isNaN(boosterMultiplier)) {
            newReward *= boosterMultiplier;
          }
          ticketsEarned += newReward;
          // console.log(
          //   `Level ${
          //     currentLevelIndex + 1
          //   } prize: ${newReward} | Total tickets: ${ticketsEarned}`
          // );
          const additionalParams = nextLevel.additionalParams;
          nextLevelScore += parseInt(additionalParams.score);

          // Log withdraw_popup value
          // console.log(
          //   `Level ${currentLevelIndex + 2} withdraw_popup: ${
          //     additionalParams.withdraw_popup
          //   }`
          // );

          if (currentLevelIndex > 10) {
            Platform.prototype.types = [2, 3, 3, 4, 4];
          } else if (currentLevelIndex > 5) {
            Platform.prototype.types = [2, 2, 3, 3, 4];
          } else {
            Platform.prototype.types = [1, 2, 3];
          }
          // Show modal only if current level has withdraw_popup
          if (parseInt(currentLevel.additionalParams.withdraw_popup) === 1) {
            showLevelModal();
          }
          currentLevelIndex++;
        }
      }

      function animloopFunc() {
        update();
        requestAnimationFrame(animloopFunc);
      }
      animloopFunc();

      const mainMenu = document.getElementById("mainMenu");
      if (mainMenu) mainMenu.style.zIndex = -1;
      const scoreBoard = document.getElementById("scoreBoard");
      if (scoreBoard) scoreBoard.style.zIndex = 1;
    }

    // Start the game
    init();
  }, [gameId, gameCode, userId]);

  return (
    <DoodleJumpGameBox>
      <BlurredBackground />
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        flexDirection={"column"}
      >
        {/* External scripts loaded via Next.js Script component */}
        <Script
          src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="afterInteractive"
          async
          defer
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q6EKQ53YY4"
          strategy="afterInteractive"
          async
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Q6EKQ53YY4');
      `}
        </Script>
        <Container ref={containerRef}>
          <div
            id="controls"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 6,
            }}
          >
            <StyledButton id="soundButton" onClick={() => window.toggleSound()}>
              &#128266;
            </StyledButton>
            <StyledButton
              id="fullscreenButton"
              onClick={() => window.toggleFullScreen()}
            >
              ⛶
            </StyledButton>
          </div>
          <canvas
            id="canvas"
            ref={canvasRef}
            style={{
              position: "absolute",
              bottom: "0px",
            }}
          >
            Aww, your browser doesn't support HTML5!
          </canvas>

          <Modal id="levelModal" className="modal">
            <ModalContent
              className="modal-content"
              style={{ fontFamily: "Pangolin, sans-serif", width: "90%" }}
            >
              <div className="p-2">
                <p style={{ fontSize: "24px", marginBottom: "10px" }}>
                  You've won
                </p>
                <p
                  id="modalText"
                  style={{
                    color: "gold",
                    fontSize: "20px",
                  }}
                ></p>
              </div>
              <div>
                <StyledButton id="continueButton" className="styled-button">
                  Risk It
                </StyledButton>
                <StyledButton id="quitButton" className="styled-button">
                  Quit
                </StyledButton>
              </div>
            </ModalContent>
          </Modal>

          <Modal
            id="lostModal"
            className="modal"
            style={{
              visibility: "hidden",
              zIndex: 1000, // Ensure it's on top
              position: "fixed", // Use fixed positioning for full-screen
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          >
            <ModalContent
              style={{
                width: "90%",
                padding: "20px",
                borderRadius: "10px",
                color: "white",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              <div>
                <p style={{ fontSize: "30px", marginBottom: "8px" }}>
                  You Lost!
                </p>
                <p
                  style={{
                    fontSize: "24px",
                    marginBottom: "8px",
                    color: "gold",
                    fontWeight: "bold",
                  }}
                >
                  {inputAmount}
                </p>
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                  Try again!
                </p>
              </div>
            </ModalContent>
          </Modal>

          <Modal id="winningModal" className="modal">
            <ModalContent
              className="modal-content"
              style={{ fontFamily: "Pangolin, sans-serif", width: "90%" }}
            >
              <div>
                <p style={{ fontSize: "28px", marginBottom: "10px" }}>
                  Congratulations!
                </p>
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                  You have completed all levels and won
                </p>
                <p
                  id="winningAmount"
                  style={{ fontSize: "25px", color: "gold" }}
                ></p>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <StyledButton
                  id="exitButton"
                  className="styled-button"
                  style={{ padding: "10px 20px" }}
                >
                  Exit
                </StyledButton>
              </div>
            </ModalContent>
          </Modal>
          <img
            id="sprite"
            src="sprites.png"
            alt="sprite"
            style={{ display: "none" }}
          />
          <ScoreBoard
            id="scoreBoard"
            style={{
              // border: "1px solid red",
              // margin: "2px 0",
              color: "Black",
              position: "absolute",
              top: "0",
              width: "100%",
              padding: "0 8px",
            }}
          >
            <p className="score-text m-1">
              Score: <span id="score">0</span>
            </p>
            <p className="score-text m-1">
              Current Level: <span id="currentLevel">0</span>
            </p>
            <p className="score-text m-1">
              Accumulated Tickets: <span id="accumulatedTickets">0</span>
            </p>
          </ScoreBoard>
        </Container>
        <div
          id="keys"
          style={{
            margin: "25px 0px 0px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            position: "relative",
          }}
        ></div>
        <audio id="gameAudio" loop>
          <source src="game-music.mp3" type="audio/mpeg" />
        </audio>
      </Box>
    </DoodleJumpGameBox>
  );
};

export default DoodleJumpGame;

DoodleJumpGame.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
