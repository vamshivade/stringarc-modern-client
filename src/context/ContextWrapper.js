import React, { createContext, useEffect, useState } from "react";
import AppContext from "./AppContext";
import axios from "axios";
import { setCookie } from "nookies";
import { destroyCookie } from "nookies";
import { getAPIHandler } from "@/ApiConfig/service";

export const AccountContext = createContext();

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("modernToken3", accessToken);
    setCookie(null, "modernToken3", accessToken, {
      maxAge: 15 * 86400,
      path: "/",
    });
  } else {
    localStorage.removeItem("modernToken3");
    destroyCookie(null, "modernToken3");
    delete axios.defaults.headers.common.Authorization;
  }
};

function checkLogin() {
  const accessToken = window.localStorage.getItem("modernToken3");
  return accessToken ? true : false;
}

export default function ContextWrapper({ children }) {
  const [isLogin, setIsLogin] = useState(checkLogin());
  const [userData, setUserData] = useState(null);

  const [ticketBalance, setTicketBalance] = useState(0);
  const [getTickets, setGetTickets] = useState([]);

  const [amountInToken, setAmountInToken] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(0);

  const updateTicketBalance = (newBalance) => {
    setTicketBalance(newBalance);
  };

  const logoutHandler = () => {
    setIsLogin(false);
    setUserData();
    localStorage.removeItem("modernToken3");
    localStorage.removeItem("referralCode");
    destroyCookie(null, "modernToken3");
  };

  const getProfileDataApi = async (token) => {
    if (!token) return; // Extra check: if token is missing, exit early

    try {
      const response = await getAPIHandler({
        endPoint: "getProfile",
      });


      if (response && response.data?.responseCode === 200) {
        setUserData(response.data.result);
        setTicketBalance(response.data.result.ticketBalance);
      } else {
        logoutHandler();
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.responseCode === 403) {
          logoutHandler();
        }
        if (error.response.data.responseCode === 402) {
          logoutHandler();
        }
        if (error.response.data.responseCode === 404) {
          logoutHandler();
        }
        logoutHandler();
      }
    }
  };
  const fetchGetTickets = async (source) => {
    const token = localStorage.getItem("modernToken3");
    if (!token) {
      return;
    }
    try {
      const response = await getAPIHandler({
        endPoint: "getTickets",
        source: source,
      });

      if (response && response.data?.responseCode === 200) {
        setGetTickets(response.data.result[0]);
        setAmountInToken(response.data.result[0].amountInToken);
        setTicketQuantity(response.data.result[0].ticketQuantity);
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

    const token = localStorage.getItem("modernToken3");
    if (token) {
      getProfileDataApi(token);
      fetchGetTickets(source);
    }

    return () => {
      source.cancel();
    };
  }, [localStorage.getItem("modernToken3")]);

  useEffect(() => {
    updateTicketBalance(userData?.ticketBalance);
  }, [userData]);

  const [boosters, setBoosters] = useState([]);
  const [activeBooster, setActiveBooster] = useState(null);
  const [boosterStartTime, setBoosterStartTime] = useState(null);
  const [boosterEndTime, setBoosterEndTime] = useState(null);

  // Function to get active boosters from API
  const getBoosters = async (source) => {
    const token = localStorage.getItem("modernToken3");
    if (!token) {
      //console.log("No token found, skipping booster fetch.");
      return;
    }

    try {
      const response = await getAPIHandler({
        endPoint: "userboosters",
        source: source,
      });

      if (response && response.data?.responseCode === 200) {
        setBoosters(response.data.result);

        const activeBooster = response.data.result.find(
          (booster) => booster.Status === "ACTIVE"
        );

        if (activeBooster) {
          setActiveBooster(activeBooster);
          setBoosterStartTime(new Date(activeBooster.BoosterStart).getTime());
          setBoosterEndTime(new Date(activeBooster.BoosterEnd).getTime());
          // Store Booster Multiplier in localStorage
          localStorage.setItem(
            "Booster_Multiplier",
            activeBooster.Booster_Id.Booster_Multiplier
          );
        } else {
          // Remove Booster_Multiplier if no active booster exists
          setActiveBooster(null);
          localStorage.removeItem("Booster_Multiplier");
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

  // Periodic check for booster expiration
  useEffect(() => {
    const source = axios.CancelToken.source();

    // Fetch boosters if the token is present
    const token = localStorage.getItem("modernToken3");
    if (token) {
      getBoosters(source);

      if (boosterStartTime && boosterEndTime) {
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const timeLeft = boosterEndTime - now;
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);

          if (now >= boosterEndTime) {
            //console.log("Booster has ended.");
            setActiveBooster(null);
            clearInterval(interval);
            getBoosters(source); // Fetch boosters after booster ends
          }
        }, 1000); // Check every 1 second

        if (new Date().getTime() >= boosterEndTime) {
          //console.log("Booster has ended.");
          clearInterval(interval); // Clean up the interval
          setActiveBooster(null);
        }
        return () => {
          clearInterval(interval); // Clean up the interval
          source.cancel(
            "Request canceled due to component unmounting or booster expiration"
          );
        };
      }
    }

    return () => {
      source.cancel("Request canceled due to component unmounting");
    };
  }, [boosterStartTime, boosterEndTime]);

  let data = {
    boosters,
    getBoosters: (source) => {
      getBoosters(source);
    },
    activeBooster,
    boosterStartTime,
    boosterEndTime,
    getTickets,
    setGetTickets,
    amountInToken,
    ticketQuantity,
    ticketBalance,
    setTicketBalance,
    updateTicketBalance,
    userLoggedIn: isLogin,
    userData,
    userLogIn: (type, data) => {
      setSession(data);
      setIsLogin(type);
    },
    getProfileDataApi: () => {
      getProfileDataApi(window.localStorage.getItem("modernToken3"));
    },
    isWalletConnected: () => {
      isWalletConnected();
    },
    logoutHandler: () => logoutHandler(),
  };

  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}
