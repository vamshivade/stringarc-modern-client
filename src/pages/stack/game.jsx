"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Maximize, Volume2 } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/router";
import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
import ReactGA from "react-ga";
import toast from "react-hot-toast";

export default function Home() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("playing"); // 'playing', 'ended'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const ticketsRef = useRef(0); // Track totalTickets instantly
  const [tickets, setTickets] = useState(0); // Track tickets for React re-render

  const [loadingRiskIt, setLoadingRiskIt] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [loadingPlayAgain, setLoadingPlayAgain] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameInstanceRef = useRef(null); // Reference to store game functions
  const [gameConfig, setGameConfig] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  // Keep track of the current score to calculate level progression
  const currentScoreRef = useRef(0);
  // Keep track of the current level in a ref to avoid async state issues
  const currentLevelRef = useRef(1);
  // Add a new state variable to track if we're at the final level
  const [isLastLevel, setIsLastLevel] = useState(false);
  // Add a ref to track the next level when continuing
  const nextLevelRef = useRef(null);
  const [isGameLost, setIsGameLost] = useState(false);
  // Add a state for the center score display
  const [centerScore, setCenterScore] = useState(0);
  const router = useRouter();
  const gameId = router.query?.id;
  const userId = router.query?.userId;
  const gameCode = router.query?.gameCode;
  const quantity = router.query?.inputAmount;

  const didAutoExit = useRef(false); // guards auto-exit API call
  const gameDoneRef = useRef(false); // marks “game completed normally”

  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const firstPageURLLocal = `${window.location.origin}/stackgame?${gameId}`;

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");
    ReactGA.pageview(window.location.pathname + window.location.search);

    const handleAutoExit = async () => {
      // If already auto-exited OR game completed normally, skip
      if (didAutoExit.current || gameDoneRef.current) return;
      didAutoExit.current = true;

      // Premature exit ⇒ zero-prize LOSS
      await saveGameHistory(false);
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
        tg.BackButton.hide();
        saveGameHistory(false);
      });
    }

    return () => {
      // Cleanup event listeners on component unmount or page change
      window.removeEventListener("beforeunload", handleAutoExit);
      document.removeEventListener("visibilitychange", handleAutoExit);

      // Hide Telegram WebApp back button when component unmounts or page changes
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.BackButton.hide();
      }
    };
  }, [router.asPath, userId, gameId]);

  useEffect(() => {
    if (router.isReady) {
      //console.log("Game ID:");
    }
  }, [router.isReady, gameId, quantity]);

  // Define the isMobile function to check if the device is mobile
  const isMobile = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth < 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };

  useEffect(() => {
    if (!gameId) {
      console.error("Game ID is missing");
      return; // Exit early if gameId is not available
    }
    let refreshCount = sessionStorage.getItem("refreshCount") || 0;
    refreshCount = parseInt(refreshCount, 10) + 1;

    sessionStorage.setItem("refreshCount", refreshCount);

    if (refreshCount >= 2 && router.isReady && userId) {
      sessionStorage.removeItem("refreshCount");
      saveGameHistory(false);
    }

    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.location.href = firstPageURLLocal;
    };
  }, [router.isReady, userId]);

  // Load game configuration from local storage
  useEffect(() => {
    try {
      // Get the data from localStorage
      const storedConfig = localStorage.getItem("stackLevelData");

      // If data exists in localStorage
      if (storedConfig) {
        // Parse the stored data
        const parsedConfig = JSON.parse(storedConfig);

        // Set the gameConfig state with the parsed data
        setGameConfig(parsedConfig);

        // Log the parsed data to the console
      } else {
        //console.log("No data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading game configuration:", error);
    }
  }, []);

  // Update the currentLevelRef whenever level changes
  useEffect(() => {
    currentLevelRef.current = level;
  }, [level]);

  // Update the useEffect that handles game state changes
  useEffect(() => {
    if (gameState === "ended") {
      // When game ends for other reasons, check if we should show popup
      if (!showGameOverPopup && gameConfig) {
        const currentLevelConfig = getCurrentLevelConfig(level);
        const withdrawPopupValue =
          currentLevelConfig?.additionalParams?.withdraw_popup;

        // Check if this is the last level
        const maxConfigLevel = Math.max(
          ...gameConfig.map((config) => Number.parseInt(config.level))
        );
        const isAtLastLevel = level >= maxConfigLevel;
        setIsLastLevel(isAtLastLevel);

        // Only show game over popup if withdraw_popup is "0"
        setShowGameOverPopup(withdrawPopupValue === "1");

        // Store the next level in the ref for when the user clicks "Risk It"
        nextLevelRef.current = level + 1;
      }
    } else {
      // Reset popup state when game is playing
      setShowGameOverPopup(false);
      setIsLastLevel(false);
      setIsGameLost(false);
    }
  }, [gameState, level, gameConfig]);

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

  const saveGameHistory = async (win) => {
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
      gameId: gameId,
      level: win ? level : 0,
      gameCode: String(gameCode),
      prize: win ? tickets.toFixed(2) : 0,
      highestScore: win ? score : 0,
      playedStatus: win ? "WON" : "LOSE",
    };

    // Show toast if game already completed
    if (prevGameData.createdAt !== prevGameData.updatedAt) {
      gameDoneRef.current = true;
      toast.error("Game already completed in another tab/device.");
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

      // console.log("Full response:", response);

      // console.log("Game history saved successfully:", response.data.result);

      // Redirect after saving game history
      setTimeout(() => {
        window.location.href = `/stackgame?${gameId}`;
      }, 1000);
      // }, 1 * 15 * 1000);
    } catch (error) {
      console.error("Error saving game history:", error);
    }
  };

  const getCurrentLevelConfig = (level) => {
    const levelConfig = gameConfig?.find(
      (config) => config.level === level.toString()
    );
    return levelConfig || gameConfig[0]; // Default to the first level config if not found
  };

  const getMovementSpeed = (level) => {
    const config = getCurrentLevelConfig(level);
    const plateSpeed = config?.additionalParams?.plate_speed || "1";
    return Number.parseFloat(plateSpeed) * 0.006;
  };

  const getScoreMultiplier = (level) => {
    const config = getCurrentLevelConfig(level);
    return Number.parseFloat(config?.additionalParams?.multiplier || "1.0");
  };

  const getPlatesPerLevel = (level) => {
    const config = getCurrentLevelConfig(level);
    return Number.parseInt(config?.additionalParams?.plates_per_level || "7");
  };

  // Calculate the level based on score and game configuration
  const calculateLevel = (score) => {
    if (!gameConfig || gameConfig.length === 0) return 1;

    let currentLevel = 1;
    let requiredScore = getPlatesPerLevel(1); // Score needed for level 2

    while (score >= requiredScore && currentLevel < gameConfig.length) {
      currentLevel++;
      // Get plates per level for the next level calculation
      requiredScore += getPlatesPerLevel(currentLevel);
    }

    return currentLevel;
  };

  // Calculate the total plates needed to complete all levels
  const calculateTotalPlatesForAllLevels = () => {
    if (!gameConfig || gameConfig.length === 0) return 0;

    let totalPlates = 0;
    for (let i = 1; i <= gameConfig.length; i++) {
      totalPlates += getPlatesPerLevel(i);
    }

    return totalPlates;
  };

  // Calculate tickets based on the current level
  const calculateTickets = (currentLevel) => {
    if (!gameConfig || !quantity) return 0;

    // Accumulate the tickets based on quantity and multiplier for each level
    let totalTickets = 0;
    for (let i = 1; i <= currentLevel; i++) {
      const levelConfig = getCurrentLevelConfig(i);
      const levelMultiplier = Number.parseFloat(levelConfig?.multiplier || "1");
      totalTickets += quantity * levelMultiplier; // Add tickets for each level
    }

    return totalTickets;
  };

  useEffect(() => {
    audioRef.current = new Audio("/images/stack/bensound-dreams.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    audioRef.current.volume = 0;

    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onpause = () => setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !gameConfig) return;

    let camera;
    let scene;
    let renderer;
    let world;
    let lastTime = 0;
    let stack = [];
    let overhangs = [];
    const boxHeight = 1;
    const originalBoxSize = 3;
    let gameEnded = false;

    let movementDirection = 1; // Movement direction (left or right)
    const movementBoundary = 10; // How far the block can move in either direction

    const blockColors = [
      "#5a6d6e",
      "#c57c4b",
      "#8b9f7a",
      "#f36e6e",
      "#6f4b8e",
      "#db84c5",
      "#57a7b0",
      "#db8f43",
      "#a7c1ab",
      "#9f83c0",
      "#f5b8b0",
      "#c1d1c3",
      "#8c9aba",
      "#b8a79f",
      "#8e92d7",
      "#d2858e",
      "#8c9b8e",
      "#a3b0c7",
      "#c2c0b7",
      "#8b7c8f",
    ];

    function getColorForBlock(index) {
      return blockColors[index % blockColors.length];
    }

    init();

    gameInstanceRef.current = {
      startGame: startGame,
      handleClick: handleClick,
      continueToNextLevel: continueToNextLevel,
    };

    function init() {
      gameEnded = false;
      lastTime = 0;
      stack = [];
      overhangs = [];
      movementDirection = 1;

      world = new CANNON.World();
      world.gravity.set(0, -10, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      world.solver.iterations = 40;

      const aspect = window.innerWidth / window.innerHeight;
      const width = 10;
      const height = width / aspect;

      camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        0,
        100
      );
      camera.position.set(4, 5, 4);
      camera.lookAt(0, 0, 0);

      scene = new THREE.Scene();
      scene.background = new THREE.Color("#e0dcd1");

      addLayer(0, 0, originalBoxSize, originalBoxSize);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(10, 20, 10);
      scene.add(dirLight);

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.setAnimationLoop(animation);

      // Set up input handlers - simplified approach
      function gameClickHandler() {
        handleClick();
      }

      // We'll use a single click handler for the canvas
      if (canvasRef.current) {
        canvasRef.current.onclick = gameClickHandler;
      }

      // Space bar handler
      const keyDownHandler = (event) => {
        if (event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      };

      window.addEventListener("keydown", keyDownHandler);

      window.addEventListener("resize", () => {
        const aspect = window.innerWidth / window.innerHeight;
        const width = 10;
        const height = width / aspect;

        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
      });

      startGame();
    }

    function startGame() {
      //console.log("Starting game...");

      if (!isMuted && audioRef.current) {
        audioRef.current.currentTime = 0;
        if (audioRef.current.paused) {
          audioRef.current
            .play()
            .catch((err) => console.warn("Autoplay failed:", err));
        }
      }

      gameEnded = false;
      lastTime = 0;
      stack = [];
      overhangs = [];
      movementDirection = 1;
      setScore(0);
      setCenterScore(0);
      currentScoreRef.current = 0;
      setLevel(1);
      currentLevelRef.current = 1;
      setTickets(0);
      setIsGameLost(false);

      while (world.bodies.length > 0) {
        world.removeBody(world.bodies[0]);
      }

      while (scene.children.find((c) => c.type === "Mesh")) {
        const mesh = scene.children.find((c) => c.type === "Mesh");
        if (mesh) scene.remove(mesh);
      }

      addLayer(0, 0, originalBoxSize, originalBoxSize, null, blockColors[0]);
      addLayer(-10, 0, originalBoxSize, originalBoxSize, "x", blockColors[1]);

      camera.position.set(4, 5, 4);
      camera.lookAt(0, 0, 0);

      setGameState("playing");
    }

    // Function to continue to the next level
    function continueToNextLevel() {
      //console.log("Continuing to next level...");

      // Use the stored next level from the ref if available
      const nextLevel = nextLevelRef.current || level + 1;

      // Reset the next level ref
      nextLevelRef.current = null;

      const maxConfigLevel = Math.max(
        ...gameConfig.map((config) => Number.parseInt(config.level))
      );

      // Check if we've reached beyond the max level
      if (nextLevel > maxConfigLevel) {
        //console.log("Reached beyond max level, restarting game");
        startGame();
        return;
      }

      // Store the current score and tickets
      const currentRawScore = currentScoreRef.current;
      const currentTickets = tickets;

      // Update level state and ref
      setLevel(nextLevel);
      currentLevelRef.current = nextLevel;

      // Reset the game state to playing
      gameEnded = false;

      // Instead of adding a new moving block automatically, we'll wait for the player's click
      // This prevents the last plate from appearing again in the next level

      // Get the top layer (last successfully placed block)
      if (stack.length >= 2) {
        const topLayer = stack[stack.length - 1];
        const direction = topLayer.direction;

        // Prepare the next block but don't add it yet
        const nextDirection = direction === "x" ? "z" : "x";
        const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
        const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
        const newWidth = topLayer.width;
        const newDepth = topLayer.depth;

        // Add the next moving block with a different direction
        const nextColor = getColorForBlock(stack.length);
        addLayer(nextX, nextZ, newWidth, newDepth, nextDirection, nextColor);
      }

      setGameState("playing");
      setShowGameOverPopup(false);
    }

    function handleClick() {
      if (gameState === "playing") {
        if (stack.length >= 2) {
          splitBlockAndAddNextOneIfOverlaps();
        }
      } else if (gameState === "ended") {
        // This is now handled by the specific buttons
        // startGame()
      }
    }

    function addLayer(x, z, width, depth, direction, color = null) {
      const y = boxHeight * stack.length;
      const layer = generateBox(x, y, z, width, depth, false, color);
      layer.direction = direction;
      stack.push(layer);
    }

    function addOverhang(x, z, width, depth, color) {
      const y = boxHeight * (stack.length - 1);
      const overhang = generateBox(x, y, z, width, depth, true, color);
      overhangs.push(overhang);
    }

    function generateBox(x, y, z, width, depth, falls, color = null) {
      const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
      let boxColor;
      if (color) {
        boxColor = new THREE.Color(color);
      } else {
        const blockColor = getColorForBlock(stack.length);
        boxColor = new THREE.Color(blockColor);
      }

      const material = new THREE.MeshLambertMaterial({
        color: boxColor,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);

      scene.add(mesh);

      const shape = new CANNON.Box(
        new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
      );
      let mass = falls ? 5 : 0;
      mass *= width / originalBoxSize;
      mass *= depth / originalBoxSize;
      const body = new CANNON.Body({ mass, shape });
      body.position.set(x, y, z);
      world.addBody(body);

      return {
        threejs: mesh,
        cannonjs: body,
        width,
        depth,
        color: boxColor.getHexString(),
      };
    }

    function cutBox(topLayer, overlap, size, delta) {
      const direction = topLayer.direction;
      const newWidth = direction === "x" ? overlap : topLayer.width;
      const newDepth = direction === "z" ? overlap : topLayer.depth;

      topLayer.width = newWidth;
      topLayer.depth = newDepth;

      topLayer.threejs.scale[direction] = overlap / size;
      topLayer.threejs.position[direction] -= delta / 2;
      topLayer.cannonjs.position[direction] -= delta / 2;

      const shape = new CANNON.Box(
        new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
      );
      topLayer.cannonjs.shapes = [];
      topLayer.cannonjs.addShape(shape);
    }

    const splitBlockAndAddNextOneIfOverlaps = () => {
      if (gameEnded || gameState !== "playing") return;

      if (stack.length < 2) return;

      const topLayer = stack[stack.length - 1];
      const previousLayer = stack[stack.length - 2];

      if (!topLayer || !previousLayer) return;

      const direction = topLayer.direction;

      const size = direction === "x" ? topLayer.width : topLayer.depth;
      const delta =
        topLayer.threejs.position[direction] -
        previousLayer.threejs.position[direction];
      const overhangSize = Math.abs(delta);
      const overlap = size - overhangSize;

      if (overlap > 0) {
        cutBox(topLayer, overlap, size, delta);

        const overhangShift =
          (overlap / 2 + overhangSize / 2) * Math.sign(delta);
        const overhangX =
          direction === "x"
            ? topLayer.threejs.position.x + overhangShift
            : topLayer.threejs.position.x;
        const overhangZ =
          direction === "z"
            ? topLayer.threejs.position.z + overhangShift
            : topLayer.threejs.position.z;
        const overhangWidth = direction === "x" ? overhangSize : topLayer.width;
        const overhangDepth = direction === "z" ? overhangSize : topLayer.depth;

        addOverhang(
          overhangX,
          overhangZ,
          overhangWidth,
          overhangDepth,
          `#${topLayer.color}`
        );

        const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
        const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
        const newWidth = topLayer.width;
        const newDepth = topLayer.depth;
        const nextDirection = direction === "x" ? "z" : "x";

        movementDirection = 1;

        // Update the raw score (number of blocks successfully placed)
        const rawScore = stack.length - 1;

        // Update the current score reference
        currentScoreRef.current = rawScore;

        // Get the current level from our ref (which is always up-to-date)
        const currentLevel = currentLevelRef.current;

        // Apply the multiplier for the displayed score
        const multiplier = getScoreMultiplier(currentLevel);
        const adjustedScore = Math.floor(rawScore * multiplier);
        setScore(adjustedScore);

        // Update the center score display
        setCenterScore(stack.length - 1);

        // Calculate the new level based on the raw score
        const newLevel = calculateLevel(rawScore);
        const maxConfigLevel = Math.max(
          ...gameConfig.map((config) => Number.parseInt(config.level))
        );

        // Get plates per level for the current level
        const platesPerLevel = getPlatesPerLevel(currentLevel);

        // Check if we need to advance to the next level
        if (newLevel > currentLevel) {
          const newLevelPlatesPerLevel = getPlatesPerLevel(newLevel);

          nextLevelRef.current = newLevel;

          setLevel(newLevel);
          currentLevelRef.current = newLevel;

          // Accumulate the tickets based on quantity and multiplier for each level
          let totalTickets = 0;
          for (let i = 1; i <= newLevel; i++) {
            const levelConfig = getCurrentLevelConfig(i);
            const levelMultiplier = Number.parseFloat(
              levelConfig?.multiplier || "1"
            );
            totalTickets += quantity * levelMultiplier; // Add tickets for each level
          }

          // Check if the Booster_Multiplier exists in localStorage
          const boosterMultiplier = parseFloat(
            localStorage.getItem("Booster_Multiplier")
          );
          if (!isNaN(boosterMultiplier)) {
            totalTickets *= boosterMultiplier; // Apply Booster multiplier
          }

          // Store the totalTickets immediately using ref (for instant reflection)
          ticketsRef.current = totalTickets;

          // Update tickets with the accumulated total immediately and re-render the modal
          setTickets(totalTickets); // React state update for UI

          // Log ticket calculation

          if (newLevel > maxConfigLevel) {
            //console.log("Reached beyond max level, ending game");
            gameEnded = true;
            setGameState("ended");
            return;
          }

          const currentLevelConfig = getCurrentLevelConfig(currentLevel);
          const withdrawPopupValue =
            currentLevelConfig?.additionalParams?.withdraw_popup;

          if (withdrawPopupValue === "1") {
            // Make sure tickets are calculated before showing the popup
            let finalTickets = calculateTickets(currentLevel);

            const boosterMultiplier = parseFloat(
              localStorage.getItem("Booster_Multiplier")
            );
            if (!isNaN(boosterMultiplier)) {
              finalTickets *= boosterMultiplier; // Apply Booster multiplier
            }

            // Directly update tickets using the state function `setTickets`
            setTickets(finalTickets);

            // Set game state after tickets are updated
            gameEnded = true;
            setGameState("ended");
            setShowGameOverPopup(true);
            return;
          }
        }

        // Check if we've completed all plates for all levels
        const totalPlatesForAllLevels = calculateTotalPlatesForAllLevels();

        if (currentLevel === maxConfigLevel) {
          const platesCompletedInCurrentLevel =
            rawScore -
            (totalPlatesForAllLevels - getPlatesPerLevel(maxConfigLevel));

          if (
            platesCompletedInCurrentLevel >= getPlatesPerLevel(maxConfigLevel)
          ) {
            //console.log("Completed all plates for final level, ending game");

            // Make sure tickets are calculated before showing the popup
            let finalTickets = calculateTickets(currentLevel);

            const boosterMultiplier = parseFloat(
              localStorage.getItem("Booster_Multiplier")
            );
            if (!isNaN(boosterMultiplier)) {
              finalTickets *= boosterMultiplier;
            }

            setTickets(finalTickets);

            gameEnded = true;
            setGameState("ended");
            setShowGameOverPopup(true);
            setIsLastLevel(true);

            return;
          }
        }

        const nextColor = getColorForBlock(stack.length);

        addLayer(nextX, nextZ, newWidth, newDepth, nextDirection, nextColor);
      } else {
        missedTheSpot();
      }
    };

    function missedTheSpot() {
      if (stack.length < 1) return;

      const topLayer = stack[stack.length - 1];

      if (!topLayer) return;

      addOverhang(
        topLayer.threejs.position.x,
        topLayer.threejs.position.z,
        topLayer.width,
        topLayer.depth,
        `#${topLayer.color}`
      );
      world.removeBody(topLayer.cannonjs);
      scene.remove(topLayer.threejs);

      // Calculate final tickets before showing game over popup
      const currentLevel = currentLevelRef.current;
      let finalTickets = calculateTickets(currentLevel);

      setTickets(finalTickets);

      gameEnded = true;
      setGameState("ended");

      setIsGameLost(true);
    }

    function animation(time) {
      if (lastTime) {
        const timePassed = time - lastTime;

        // Use the current level from our ref
        const currentLevel = currentLevelRef.current;
        const baseSpeed = getMovementSpeed(currentLevel);

        // Adjust speed for mobile devices
        const speed = isMobile() ? baseSpeed * 0.6 : baseSpeed;

        if (gameState === "playing" && !gameEnded && stack.length >= 2) {
          const topLayer = stack[stack.length - 1];

          if (!topLayer) {
            lastTime = time;
            return;
          }

          topLayer.threejs.position[topLayer.direction] +=
            speed * timePassed * movementDirection;
          topLayer.cannonjs.position[topLayer.direction] +=
            speed * timePassed * movementDirection;

          const currentPosition = topLayer.threejs.position[topLayer.direction];

          if (currentPosition > movementBoundary) {
            movementDirection = -1;
          } else if (currentPosition < -movementBoundary) {
            movementDirection = 1;
          }
        }

        if (
          gameState === "playing" &&
          camera.position.y < boxHeight * (stack.length - 2) + 5
        ) {
          camera.position.y += speed * timePassed;
        }

        updatePhysics(timePassed);
        renderer.render(scene, camera);
      }
      lastTime = time;
    }

    function updatePhysics(timePassed) {
      world.step(timePassed / 1000);

      overhangs.forEach((element) => {
        element.threejs.position.copy(element.cannonjs.position);
        element.threejs.quaternion.copy(element.cannonjs.quaternion);
      });
    }

    // Clean up event listeners
    return () => {
      if (canvasRef.current) {
        canvasRef.current.onclick = null;
      }
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("resize", () => {});
      renderer.setAnimationLoop(null);
    };
  }, [gameConfig]);

  // Add this after the other useEffect hooks
  useEffect(() => {
    if (gameConfig) {
      const platesPerLevel = getPlatesPerLevel(level);
      //console.log(
      //   `Level changed to: ${level}, Plates per level: ${platesPerLevel}`
      // );
    }
  }, [level, gameConfig]);

  const handleRiskIt = async () => {
    if (isButtonClicked) return; // Prevent further clicks if a button is already clicked

    setIsButtonClicked(true); // Disable all buttons after any click
    setLoadingRiskIt(true);
    try {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.continueToNextLevel();
      }
    } catch (error) {
      console.error("Error in Risk It action", error);
    } finally {
      setLoadingRiskIt(false);
      setIsButtonClicked(false);
    }
  };

  const handleQuitExit = async () => {
    if (isButtonClicked) return; // Prevent further clicks if a button is already clicked

    setIsButtonClicked(true); // Disable all buttons after any click
    setLoadingQuit(true);
    try {
      saveGameHistory(true);
    } catch (error) {
      console.error("Error in Quit action", error);
    }
  };

  const handlePlayAgain = async () => {
    if (isButtonClicked) return; // Prevent further clicks if a button is already clicked

    setIsButtonClicked(true); // Disable all buttons after any click
    setLoadingPlayAgain(true);
    try {
      saveGameHistory(false);
    } catch (error) {
      console.error("Error in Play Again action", error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          setIsMuted(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Play failed:", err);
          setIsMuted(true);
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
      setIsMuted(true);
      setIsPlaying(false);
    }
  };

  if (!gameConfig) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading game configuration...</p>
      </div>
    );
  }

  const buttonStyle = {
    opacity: isButtonClicked ? 0.6 : 1,
    pointerEvents: isButtonClicked ? "none" : "auto",
    backgroundColor: isButtonClicked ? "rgb(85 85 85)" : "",
    borderColor: isButtonClicked ? "rgb(181 181 181)" : "",
    boxShadow: isButtonClicked ? "#212020ed 0px 0px 10px" : "",
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          // border: "2px solid red",
          width: "100%",
          height: "94vh",
          zIndex: 2,
        }}
      ></div>
      <div className={styles.gameContainer}>
        <div className={styles.scoreDisplay}>{centerScore}</div>
        <div className={styles.controls}>
          <button onClick={toggleFullscreen} className={styles.controlButton}>
            <Maximize size={24} className={styles.controlIcon} />
          </button>
          <button onClick={toggleSound} className={styles.controlButton}>
            <Volume2
              size={24}
              className={`${styles.controlIcon} ${
                isPlaying ? styles.iconActive : styles.iconMuted
              }`}
            />
          </button>
        </div>

        <div className={styles.statsDisplay}>
          <div>Level: {level}</div>
          {/* <div>Accumulated Tickets: {tickets.toFixed(2)}</div> */}
        </div>

        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {gameState === "ended" && showGameOverPopup && !isLastLevel && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuContent}>
            <h1 className={styles.winTitle}>You've won</h1>
            <p className={styles.ticketAmount}>
              {tickets.toFixed(2)} <span className={styles.ticketIcon}></span>
            </p>
            <div className={styles.riskkquitt}>
              <button
                className={styles.riskButton}
                onClick={handleRiskIt}
                style={buttonStyle}
                disabled={isButtonClicked || loadingRiskIt || loadingQuit}
              >
                {"Risk It"}
              </button>
              <button
                className={styles.quitButton}
                onClick={handleQuitExit}
                style={buttonStyle}
                disabled={isButtonClicked || loadingQuit || loadingRiskIt}
              >
                {"Quit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "ended" && isLastLevel && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuContent}>
            <div className={styles.partyIcon}></div>
            <h1 className={styles.winTitle}>Congratulations!</h1>
            <h4 className={styles.winTitleee}>
              You have completed all levels and won
            </h4>
            <p className={styles.ticketAmount}>
              {tickets.toFixed(2)} <span className={styles.ticketIcon}></span>
            </p>
            <button
              className={styles.riskButton}
              onClick={handleQuitExit}
              style={buttonStyle}
              disabled={isButtonClicked || loadingQuit}
            >
              {"Exit"}
            </button>
          </div>
        </div>
      )}

      {gameState === "ended" && isGameLost && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuContent}>
            <div className={styles.partyIcon}></div>
            <h1 className={styles.winTitle}>Game Over</h1>
            <p className={`${styles.gameOverText} mb-1`}>You lost</p>
            <p
              style={{
                fontSize: "28px",
                color: "gold",
                fontWeight: "bold",
                margin: "0",
              }}
            >
              {quantity}
            </p>
            <button
              className={styles.riskButton}
              onClick={handlePlayAgain}
              style={buttonStyle}
              disabled={isButtonClicked || loadingPlayAgain}
            >
              {"Play Again"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
