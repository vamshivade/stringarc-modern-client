import React, { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AppContext from "@/context/AppContext";
import styles from "./GamePlayNewCard.module.css";

export default function GamePlayNewCard({ data, index }) {
  const auth = useContext(AppContext);
  const router = useRouter();

  const updateDimensions = () => {
    var offsetWidth = document.getElementById("imagecard" + index).offsetWidth;
    var newOffsetWidth = offsetWidth - 10;
    document.getElementById("imagecard" + index).style.height =
      newOffsetWidth + "px";
  };

  useEffect(() => {
    updateDimensions();
  }, [data, index]);

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handlePlayButton = () => {
    const lowerCaseTitle = data.gameTitle?.toLowerCase();
    const gameTitleToRoute = {
      "flappy bird": "/flappybirdgame",
      "doodle jump": "/doodlejumpgame",
      stack: "/stackgame",
    };

    if (auth.userLoggedIn) {
      const route = gameTitleToRoute[lowerCaseTitle];
      if (route) {
        router.push(`${route}?${data._id}`);
      } else {
        toast.success("Coming soon");
      }
    } else {
      // toast.error("Please log in first to play the game.");
    }
  };

  return (
    <>
      <img
        src={data.gamePic || data?.backgroundImg}
        alt=""
        className={`${styles.row}`}
        id={`imagecard${index}`}
        onClick={handlePlayButton}
      />
    </>
  );
}
