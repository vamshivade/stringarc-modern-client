import { useEffect, useRef, useContext } from "react";
import AppContext from "@/context/AppContext";

const SessionManageComponent = () => {
  const auth = useContext(AppContext);
  const logoutTimer = useRef(null);

  const logout = () => {
    auth.logoutHandler();
  };

  const resetTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(logout, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  const handleUserActivity = () => {
    resetTimer();
  };

  const checkSessionExpiration = () => {
    const lastActivity = localStorage.getItem("lastActivity");
    const currentTime = Date.now();
    const timeElapsed = currentTime - parseInt(lastActivity);
    if (timeElapsed >= 24 * 60 * 60 * 1000) {
      // Check if greater than or equal to 24 hours
      logout();
    }
  };

  useEffect(() => {
    if (localStorage.getItem("modernToken3")) {
      const sessionStart = localStorage.getItem("sessionStart");
      if (!sessionStart) {
        localStorage.setItem("sessionStart", Date.now().toString());
      } else {
        checkSessionExpiration(); // Check session expiration when the component mounts
      }
      resetTimer(); // Reset timer whenever the component mounts
      const events = [
        "mousedown",
        "keydown",
        "mousemove",
        "scroll",
        "touchstart",
      ];

      const attachEventListeners = () => {
        events.forEach((event) => {
          window.addEventListener(event, handleUserActivity);
        });
      };

      attachEventListeners();

      // Periodically check for session expiration
      const interval = setInterval(checkSessionExpiration, 24 * 60 * 60 * 1000); // 24 hours

      // Check for session expiration when the window gains focus
      const handleFocus = () => {
        checkSessionExpiration();
        resetTimer(); // Reset timer on focus to handle the case when the user switches tabs
      };

      window.addEventListener("focus", handleFocus);

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
        clearTimeout(logoutTimer.current);
        clearInterval(interval);
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, []);

  return null;
};

export default SessionManageComponent;
