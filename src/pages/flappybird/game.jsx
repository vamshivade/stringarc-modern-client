import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  Modal,
} from "@mui/material";
import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
import { useRouter } from "next/router";
import ReactGA from "react-ga";
import toast from "react-hot-toast";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0", // Purple color for buttons
    },
    background: {
      default: "#231b2e", // Dark purple/black background
      paper: "#231b2e",
    },
    text: {
      primary: "#ffffff", // White color for "You've Won" text
      secondary: "#f2c94c", // Gold/yellow color for the amount
    },
  },
  typography: {
    fontFamily: '"Fredoka", sans-serif',
    h4: {
      fontWeight: 500,
      color: "#ffffff", // Explicitly set white color for h4 (You've Won)
      fontSize: "1.5rem",
      letterSpacing: "2px",
    },
    h3: {
      fontWeight: 700,
      color: "#f2c94c", // Gold/yellow color for the amount
      fontSize: "2rem",
      letterSpacing: "2px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
          padding: "8px 24px",
          minWidth: 100,
        },
        contained: {
          backgroundColor: "#9c27b0",
          "&:hover": {
            backgroundColor: "#7b1fa2",
          },
        },
      },
    },
  },
});

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [levelChanged, setLevelChanged] = useState(false);
  const pausedRef = useRef(false);
  // Ref to ensure we log the game result only once.
  const resultLoggedRef = useRef(false);
  // Ref to store game result ("WON" or "LOSE")
  const gameResultRef = useRef("");
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter();
  const betAmount = router.query.inputAmount;
  const gameId = router.query.id;
  const userId = router.query.userId;
  const gameCode = router.query.gameCode;

  const firstPageURL = `${window.location.origin}/flappybirdgame?${gameId}`;

  const didAutoExit = useRef(false); // guards auto-exit API call
  const gameDoneRef = useRef(false); // marks “game completed normally”

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");
    ReactGA.pageview(window.location.pathname + window.location.search);

    const handleAutoExit = async () => {
      // If already auto-exited OR game completed normally, skip
      if (didAutoExit.current || gameDoneRef.current) return;
      didAutoExit.current = true;

      // Premature exit ⇒ zero-prize LOSS
      await gameOver();
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
      tg.BackButton.onClick(async () => {
        tg.BackButton.hide(); // Hide the back button
        await gameOver();
      });
    }

    return () => {
      window.removeEventListener("beforeunload", handleAutoExit);
      document.removeEventListener("visibilitychange", handleAutoExit);
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.BackButton.hide(); // Hide the back button on component unmount
      }
    };
  }, [router.asPath]);

  useEffect(() => {
    if (betAmount) {
      //console.log("Received betAmount:");
    }
  }, [betAmount, gameId, userId, gameCode]);

  const flappyBirdGameData = JSON.parse(
    localStorage.getItem("flappyBirdLevelData")
  );

  // Replace levelData with flappyBirdGameData (converted to match the original structure)
  const levelData = Object.values(flappyBirdGameData).map((item) => ({
    level: parseInt(item.level, 10),
    pipespeed: Number(item.additionalParams.pipespeed),
    pipes_per_level: Number(item.additionalParams.pipes_per_level),
    withdraw_popup: Number(item.additionalParams.withdraw_popup),
    gravity: Number(item.additionalParams.gravity),
    multiplier: Number(item.multiplier),
  }));

  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    let cumulative = 0;
    let newLevel = 0;
    for (let i = 0; i < levelData.length; i++) {
      cumulative += parseInt(levelData[i].pipes_per_level, 10);
      if (score >= cumulative) {
        newLevel = parseInt(levelData[i].level, 10);
      } else {
        break;
      }
    }

    if (newLevel !== currentLevel) {
      setTimeout(() => {
        setCurrentLevel(newLevel);
        setLevelChanged(true);
      }, 100);
    }
  }, [score, currentLevel]);

  const currentLevelData =
    levelData[Math.min(currentLevel, levelData.length - 1)] || {};
  const { pipespeed, gravity } = currentLevelData;

  useEffect(() => {
    if (!gameId) {
      console.error("Game ID is missing");
      return;
    }

    const firstPageURLLocal = `${window.location.origin}/flappybirdgame?${gameId}`;

    let refreshCount = sessionStorage.getItem("refreshCount") || 0;
    refreshCount = parseInt(refreshCount, 10) + 1;

    sessionStorage.setItem("refreshCount", refreshCount);

    if (refreshCount >= 2) {
      sessionStorage.removeItem("refreshCount");
      gameOver().finally(() => {
        window.location.href = firstPageURLLocal;
      });
    }

    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.location.href = firstPageURLLocal;
    };
  }, [gameId]);

  const scoreRef = useRef(0);
  const GAME_WIDTH = 350;
  const GAME_HEIGHT = 600;
  const pipeSpeed = pipespeed;

  // Limit FPS to 60 for smooth gameplay
  const FPS = 90;
  const frameInterval = 1000 / FPS;
  let lastFrameTime = 0;
  let frames = 0;

  // Determine the previous level's data (the one just completed)
  const prevLevelData = currentLevel > 0 ? levelData[currentLevel - 1] : {};
  const [riskChosen, setRiskChosen] = useState(false);

  useEffect(() => {
    if (levelChanged && prevLevelData.withdraw_popup === 1 && !riskChosen) {
      setTimeout(() => {
        setIsPaused(true);
        pausedRef.current = true;
      }, 100);
    }
  }, [levelChanged, prevLevelData, riskChosen]);

  let currentPrize = 0;
  const calculateCurrentPrize = () => {
    for (let i = 0; i < currentLevel; i++) {
      currentPrize += betAmount * levelData[i].multiplier;
    }

    const boosterMultiplier = localStorage.getItem("Booster_Multiplier");
    // If Booster_Multiplier is found, multiply the prize by the multiplier
    if (boosterMultiplier) {
      currentPrize *= parseFloat(boosterMultiplier); // Apply the dynamic multiplier
    } else {
      //console.log("No booster multiplier found, prize remains 1x");
    }

    return currentPrize;
  };

  const fetchGameStatus = async () => {
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
  };

  const handleGameResult = async () => {
    let finalScore = 0;
    let prize = 0;
    let level = 0;
    if (gameResultRef.current === "WON") {
      finalScore = scoreRef.current;
      prize = currentPrize;
      level = currentLevel;
    } else {
      prize = 0;
      level = 0;
      finalScore = 0;
    }

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

    const data = {
      prize: prize,
      playedStatus: gameResultRef.current,
      gameId: gameId,
      level: level,
      highestScore: finalScore,
      gameCode: String(gameCode),
      levelData: flappyBirdGameData,
    };

    // Show toast if game already completed
    if (prevGameData.createdAt !== prevGameData.updatedAt) {
      toast.error("Game already completed in another Device/Tab");
    }

    // Choose which data to send
    const dataToSend =
      prevGameData.createdAt !== prevGameData.updatedAt ? data2 : data;

    // console.log("Posting game history with data:", dataToSend);

    try {
      const response = await postAPIHandler({
        endPoint: "createGameHistory",
        dataToSend: dataToSend,
      });

      // console.log("Game history posted successfully:", response.data.result);

      setTimeout(() => {
        window.location.href = firstPageURL;
      }, 1000);
      // }, 1 * 20 * 1000);

      return response;
    } catch (error) {
      console.error("Error posting score:", error);
    }
  };

  const handleRisk = () => {
    setRiskChosen(true);
    setIsPaused(false);
    setLevelChanged(false);
    setTimeout(() => {
      pausedRef.current = false;
      setRiskChosen(false);
    }, 800);
  };

  const handleQuit = async () => {
    setIsDisabled(true);
    gameResultRef.current = "WON";
    gameDoneRef.current = true;
    await handleGameResult();
  };

  const handleExit = async () => {
    setIsDisabled(true);
    // Set result to WON and call API before redirecting
    gameResultRef.current = "WON";
    gameDoneRef.current = true;
    await handleGameResult();
  };

  // Function to handle game over
  const gameOver = async () => {
    if (resultLoggedRef.current) return;

    gameResultRef.current = "LOSE";
    resultLoggedRef.current = true;
    gameDoneRef.current = true;
    await handleGameResult();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const state = {
      current: 0,
      getReady: 0,
      play: 1,
      gameOver: 2,
    };

    const bg = new Image();
    bg.src = "/images/flappybird/background-day.png";

    const fg = new Image();
    fg.src = "/images/flappybird/base.png";

    const pipeNorth = new Image();
    pipeNorth.src = "/images/flappybird/img/toppipe.png";

    const pipeSouth = new Image();
    pipeSouth.src = "/images/flappybird/img/botpipe.png";

    const tapFrames = [
      "/images/flappybird/img/tap/t0.png",
      "/images/flappybird/img/tap/t1.png",
    ].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const getReadyImg = new Image();
    getReadyImg.src = "/images/flappybird/img/getready.png";

    const gameOverImg = new Image();
    gameOverImg.src = "/images/flappybird/img/gameover.png";

    const birdFrames = [
      "/images/flappybird/img/bird/b0.png",
      "/images/flappybird/img/bird/b1.png",
      "/images/flappybird/img/bird/b2.png",
    ].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const SFX = {
      flap: new Audio("/images/flappybird/sfx/flap.wav"),
      score: new Audio("/images/flappybird/sfx/score.wav"),
      hit: new Audio("/images/flappybird/sfx/hit.wav"),
      die: new Audio("/images/flappybird/sfx/die.wav"),
      swoosh: new Audio("/images/flappybird/sfx/start.wav"),
    };

    const bird = {
      x: 50,
      y: 150,
      w: 34,
      h: 26,
      frame: 0,
      gravity: gravity,
      jump: 4.5,
      speed: 0,
      rotation: 0,

      draw() {
        const currentFrame = birdFrames[this.frame];
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(currentFrame, -this.w / 2, -this.h / 2);
        ctx.restore();
      },
    };

    bird.update = function () {
      const groundY = GAME_HEIGHT - fg.height;

      if (state.current === state.play) {
        this.speed += this.gravity;
        this.y += this.speed;

        if (this.speed < 0) {
          this.rotation = -0.3;
        } else {
          this.rotation = Math.min(Math.PI / 4, this.rotation + 0.03);
        }

        // Check for collision with the ground
        if (this.y + this.h >= groundY) {
          this.y = groundY - this.h;
          state.current = state.gameOver;
          this.rotation = 0;
          SFX.die.play();
          gameOver();
        }
      } else if (state.current === state.getReady) {
        this.y = 150 + Math.sin(frames / 20) * 10; // Sine wave for smooth up/down animation
        // this.y = 150;
        this.speed = 0;
        this.frame = 0;
        this.rotation = 0;
      } else if (state.current === state.gameOver) {
        this.speed += this.gravity;
        this.y += this.speed;
        this.rotation = Math.min(Math.PI, this.rotation + 0.05);
        if (this.y + this.h >= groundY) {
          this.y = groundY - this.h;
          this.speed = 0;
        }
      }
    };

    bird.flap = function () {
      this.speed = -this.jump;
      SFX.flap.play();
    };

    const pipes = {
      position: [],
      gap: 100, // gap between the two pipes in pixels

      draw() {
        this.position.forEach((p) => {
          ctx.drawImage(pipeNorth, p.x, p.y);
          ctx.drawImage(pipeSouth, p.x, p.y + pipeNorth.height + this.gap);
        });
      },
    };

    // Pipes collision detection update
    pipes.update = function () {
      if (state.current !== state.play) return;

      if (frames % 100 === 0) {
        let topYPos = -Math.floor(Math.random() * 220) - 100;
        this.position.push({
          x: GAME_WIDTH,
          y: topYPos,
          scored: false,
        });
      }

      this.position.forEach((p) => {
        p.x -= pipeSpeed;
        let birdW = bird.w - 8;
        let birdH = bird.h - 8;

        // Check collision with top pipe
        if (
          bird.x + birdW >= p.x &&
          bird.x <= p.x + pipeNorth.width &&
          bird.y <= p.y + pipeNorth.height
        ) {
          state.current = state.gameOver;
          bird.rotation = 0;
          SFX.hit.play();
          gameOver();
        }

        // Check collision with bottom pipe
        let bottomPipeY = p.y + pipeNorth.height + this.gap;
        if (
          bird.x + birdW >= p.x &&
          bird.x <= p.x + pipeSouth.width &&
          bird.y + birdH >= bottomPipeY
        ) {
          state.current = state.gameOver;
          bird.rotation = 0;
          SFX.hit.play();
          gameOver();
        }

        if (p.x + pipeNorth.width <= 0) {
          this.position.shift();
        }

        if (!p.scored && p.x + pipeNorth.width < bird.x) {
          p.scored = true;
          setScore((prev) => {
            const newScore = prev + 1;
            scoreRef.current = newScore;
            return newScore;
          });
          SFX.score.play();
        }
      });
    };

    pipes.reset = function () {
      this.position = [];
    };

    let fgX = 0;

    function drawGround() {
      ctx.drawImage(fg, fgX, GAME_HEIGHT - fg.height);
      ctx.drawImage(fg, fgX + fg.width, GAME_HEIGHT - fg.height);
    }

    function updateGround() {
      if (state.current === state.play || state.current === state.getReady) {
        fgX -= pipeSpeed; // Move the ground leftward
        if (fgX <= -fg.width) {
          fgX = 0; // Reset position when the ground moves off-screen
        }
      }
    }

    function drawBackground() {
      ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    const scoreImages = [];
    for (let i = 0; i <= 9; i++) {
      const img = new Image();
      img.src = `/images/flappybird/img/numbers/${i}.png`;
      scoreImages.push(img);
    }

    function drawScore() {
      const scoreString = scoreRef.current.toString();
      let offsetX = (GAME_WIDTH - scoreString.length * 24) / 2;
      const yPos = 40;

      for (let i = 0; i < scoreString.length; i++) {
        const digit = parseInt(scoreString[i], 10);
        const img = scoreImages[digit];
        ctx.drawImage(img, offsetX, yPos);
        offsetX += 24;
      }
    }

    function drawTap() {
      if (state.current === state.getReady) {
        const tapIndex = Math.floor(frames / 10) % tapFrames.length;
        const currentTap = tapFrames[tapIndex];
        if (currentTap.complete && currentTap.naturalWidth !== 0) {
          const tapWidth = currentTap.width;
          const tapHeight = currentTap.height;
          ctx.drawImage(
            currentTap,
            (GAME_WIDTH - tapWidth) / 2,
            (GAME_HEIGHT - tapHeight) / 2
          );
        }
      }
    }

    function drawGetReady() {
      if (
        state.current === state.getReady &&
        getReadyImg.complete &&
        getReadyImg.naturalWidth !== 0
      ) {
        const x = (GAME_WIDTH - getReadyImg.width) / 2;
        const y =
          (GAME_HEIGHT - getReadyImg.height) / 2 -
          50 +
          Math.sin(frames / 20) * 10; // Sine wave for up/down animation
        ctx.drawImage(getReadyImg, x, y);
      }
    }

    function drawGameOver() {
      if (
        state.current === state.gameOver &&
        gameOverImg.complete &&
        gameOverImg.naturalWidth !== 0
      ) {
        const x = (GAME_WIDTH - gameOverImg.width) / 2;
        const y = (GAME_HEIGHT - gameOverImg.height) / 2;
        ctx.drawImage(gameOverImg, x, y);
      }
    }

    function loop(timestamp) {
      if (pausedRef.current) {
        requestAnimationFrame(loop);
        return;
      }

      if (timestamp - lastFrameTime < frameInterval) {
        requestAnimationFrame(loop);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      drawBackground();
      pipes.draw();
      drawGround();
      bird.draw();
      bird.update();
      pipes.update();
      updateGround();
      drawScore();
      drawTap();

      if (state.current === state.getReady) {
        drawGetReady();
      }
      if (state.current === state.gameOver) {
        drawGameOver();
      }

      frames++;
      bird.frame = Math.floor(frames / 8) % birdFrames.length;
      requestAnimationFrame(loop);
    }

    function onClick() {
      if (pausedRef.current) return;
      if (state.current === state.gameOver) return;
      switch (state.current) {
        case state.getReady:
          state.current = state.play;
          SFX.swoosh.play();
          break;
        case state.play:
          bird.flap();
          break;
        case state.gameOver:
          pipes.reset();
          setScore(0);
          scoreRef.current = 0;
          state.current = state.getReady;
          bird.rotation = 0;
          break;
        default:
          break;
      }
    }

    // Mobile optimizations - handle touch events
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Prevent touch scroll
      onClick();
    });

    canvas.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        onClick();
      }
    });

    loop();

    return () => {
      canvas.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onClick);
    };
  }, [pipespeed, gravity]);

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');`}
      </style>
      <ThemeProvider theme={theme}>
        <div
          style={{
            textAlign: "center",
            // border: "2px solid red",
            width: "100%",
            height: "94vh",
            position: "absolute",
            zIndex: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            style={{
              backgroundColor: "#70c5ce",
              border: "2px solid black",
              width: "100%",
              // height: "auto",
              maxWidth: "350px",
              display: "block",
              margin: "25px auto",
            }}
          />
          {prevLevelData.withdraw_popup === 1 && (
            <Modal
              open={isPaused}
              onClose={() => {}}
              disableEscapeKeyDown
              aria-labelledby="winning-modal-title"
              aria-describedby="winning-modal-description"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiBackdrop-root": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent backdrop
                },
                "& .MuiModal-root": {
                  zIndex: 1000, // Ensure modal is above other content
                  position: "fixed", // Fix modal to the screen
                  height: "100vh", // Full-screen height
                  width: "100%", // Full-screen width
                },
              }}
              disableScrollLock={true}
            >
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 4,
                  padding: 4,
                  width: "80%",
                  maxWidth: "320px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  outline: "none",
                  position: "relative", // Keep the modal content positioned within the fixed container
                  zIndex: 1010, // Ensure content is above the backdrop
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  id="winning-modal-title"
                  sx={{ color: "#ffffff" }} // Explicitly set white color here as well
                >
                  You've won
                </Typography>

                <Typography
                  variant="h3"
                  component="p"
                  align="center"
                  color="text.secondary"
                  id="winning-modal-description"
                >
                  {calculateCurrentPrize().toFixed(2)}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    width: "100%",
                    mt: 1,
                  }}
                >
                  {currentLevel === levelData[levelData.length - 1].level ? (
                    <Button
                      onClick={handleExit}
                      disabled={isDisabled}
                      variant="contained"
                      color="primary"
                      sx={{
                        backgroundColor: "rgba(156, 39, 176, 0.7)",
                        "&:hover": {
                          backgroundColor: "rgba(156, 39, 176, 0.9)",
                        },
                      }}
                    >
                      Exit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleRisk}
                        disabled={isDisabled}
                        variant="contained"
                        color="primary"
                        sx={{
                          backgroundColor: "rgba(156, 39, 176, 0.7)",
                          minWidth: 80,
                          "&:hover": {
                            backgroundColor: "rgba(156, 39, 176, 0.9)",
                          },
                        }}
                      >
                        Risk It
                      </Button>
                      <Button
                        onClick={handleQuit}
                        disabled={isDisabled}
                        variant="contained"
                        color="primary"
                        sx={{
                          backgroundColor: "rgba(156, 39, 176, 0.7)",
                          minWidth: 80,
                          "&:hover": {
                            backgroundColor: "rgba(156, 39, 176, 0.9)",
                          },
                        }}
                      >
                        Quit
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Modal>
          )}
        </div>
      </ThemeProvider>
    </>
  );
};

export default FlappyBird;
