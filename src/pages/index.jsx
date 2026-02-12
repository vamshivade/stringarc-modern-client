import React, { useCallback, useContext, useEffect, useState } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import { Container, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getAPIHandler,
  postAPIHandler,
  postAPIHandler1,
} from "@/ApiConfig/service";
import AppContext from "@/context/AppContext";
import dailyPopupStyles from "./dailyPopup.module.css";
import dailyRewardContainer from "./dailyRewardContainer.module.css";
import toast from "react-hot-toast";
import Image from "next/image";
import axios from "axios";
import { Grid } from "@mui/material";
import GamePlayNewCard from "@/components/GamePlayNewCard";
import PageLoading from "@/components/PageLoader";

export default function HomePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [DailyReward, setDailyReward] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [rewardDetails, setRewardDetails] = useState(null);
  const [token, setToken] = useState(null);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const context = useContext(AppContext);
  const { updateTicketBalance, ticketBalance, getBoosters, userData } = context;

  const [categoryGameData, setCategoryGameData] = useState([]);

  const handleScroll = useCallback(() => {
    const scrollHeightToShowButton = 250;
    if (window.scrollY > scrollHeightToShowButton) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // console.log("window.Telegram.WebApp.initData",window.Telegram.WebApp.initData);

  // Signup function: attempts to create a user.
  const signupUser = useCallback(async (chatId) => {
    try {
      const url = window.location.href;
      const urlObj = new URL(url);

      const referrer = urlObj.searchParams.get("tgWebAppStartParam");

      const data = {
        // chatId: chatId.toString(),
        // userName,
        // profilePic,
        ...(referrer ? { referrerChatId: referrer } : {}),
      };

      const signupResponse = await postAPIHandler1({
        endPoint: "signup",
        dataToSend: { data },
      });

      if (signupResponse.data.responseCode === 200) {
        const token = signupResponse.data.token;
        localStorage.setItem("modernToken3", token);
        localStorage.setItem("chatId", chatId);
        context.userLogIn(true, token);
        return true;
      } else {
        console.error("Signup failed:");
        return false;
      }
    } catch (error) {
      console.error("Error in signupUser:");
      return false;
    }
  }, []);

  const loginUser = useCallback(
    async (chatId) => {
      if (isLoggingIn) return;
      setIsLoggingIn(true);

      try {
        const loginResponse = await postAPIHandler1({
          endPoint: "login",
        });

        if (loginResponse.data.responseCode === 200) {
          const token = loginResponse.data.result.token;
          localStorage.setItem("modernToken3", token);
          localStorage.setItem("chatId", chatId);
          context.userLogIn(true, token);
          setToken(token);
        } else if (loginResponse.data.responseCode === 400 && !hasSignedUp) {
          const signupSuccess = await signupUser();
          console.log("signup");

          if (signupSuccess) {
            setHasSignedUp(true);
            await loginUser();
          } else {
            console.error("Signup was unsuccessful, not retrying login.");
          }
        } else {
          console.error("Login error, not attempting signup again");
        }
      } catch (error) {
        console.error("Error in loginUser:", error);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [context, hasSignedUp, signupUser, isLoggingIn]
  );

  // Get Daily Reward Plan (triggered on button click)
  const GetDailyRewardplan = async () => {
    try {
      const rewardResponse = await getAPIHandler({ endPoint: "getrewardplan" });

      if (rewardResponse.data.responseMessage === "Reward claimed Today") {
        toast.error("Reward claimed Today");
        return;
      }
      if (rewardResponse.data.responseCode === 200) {
        setDailyReward(rewardResponse.data.result.Reward_Amount);
        setRewardDetails(rewardResponse.data.result);
        setIsOpen(true);
      } else {
        // toast.error("Failed to fetch daily reward plan");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error fetching reward plan:");
      setIsOpen(false);
    }
  };

  // Handle Claim Reward
  const handleClaimReward = useCallback(async () => {
    if (rewardDetails) {
      const { Reward_Amount } = rewardDetails;
      const requestData = { Reward_Amount, Status: "Claimed" };
      setIsClaiming(true);
      try {
        setClaimed(true);
        setIsOpen(false);
        const claimResponse = await postAPIHandler({
          endPoint: "addclaim",
          dataToSend: requestData,
        });

        if (claimResponse.data.responseCode === 200) {
          const updatedBalance = ticketBalance + Reward_Amount;
          updateTicketBalance(updatedBalance);
          toast.success("Reward Claimed Successfully");
        }
      } catch (error) {
        console.error("Error claiming reward:");
      } finally {
        setIsClaiming(false);
      }
    }
  }, [rewardDetails, ticketBalance, updateTicketBalance]);

  // On mount: use token from localStorage or try logging in.
  useEffect(() => {
    const chatId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    const storedToken = localStorage.getItem("modernToken3");
    const storedChatId = localStorage.getItem("chatId");

    // Check chatId regardless of token existence
    if (!storedToken || storedChatId !== chatId) {
      loginUser(chatId).finally(() => setIsInitialLoading(false));
    } else {
      // Token exists and chatId matches, so we proceed as usual
      setToken(storedToken);
      context.userLogIn(true, storedToken);
      setIsInitialLoading(false);
    }
  }, []);

  // No need to manually fetch boosters here as it's already managed in context.
  useEffect(() => {
    const source = axios.CancelToken.source();
    if (token) {
      getBoosters(source);
    }
    return () => {
      source.cancel("Request canceled due to component unmounting");
    };
  }, [token]);

  const listCategoryGameApi = async (source) => {
    try {
      const res = await getAPIHandler({
        endPoint: "userGameList",
        paramsData: {
          latest: true,
        },
        source: source,
      });

      if (res && res.data?.responseCode === 200) {
        setCategoryGameData(res.data.result.docs);
      } else {
        setCategoryGameData([]);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error("Error fetching category game data:", error);
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    listCategoryGameApi(source);

    return () => {
      source.cancel("Request canceled due to component unmounting");
    };
  }, []);

  useEffect(() => {
    if (userData) {
      //console.log("userData");
    }
  }, [userData]);

  return (
    <>
      {isInitialLoading ? (
        <PageLoading />
      ) : (
        <Container
          className="position-relative h-100 w-100 mh-100 mw-100 p-2"
          style={{ zIndex: 1, overflow: "hidden", marginTop: "5px" }}
        >
          <div className={dailyRewardContainer.buttonContainer}>
            <div
              className={dailyRewardContainer.buttonWrapper}
              onClick={GetDailyRewardplan}
              disabled={isClaiming}
            >
              <div className={dailyRewardContainer.rewardButton}>
                <div className={dailyRewardContainer.iconWrapper}>
                  <Image
                    src="/images/4dec/freepik__expand__981231.png"
                    alt="Sparkles"
                    width={80}
                    height={80}
                    fetchpriority="high"
                  />
                </div>
              </div>
              <div className={dailyRewardContainer.text}>
                <div className={dailyRewardContainer.title}>Daily Bonus</div>
              </div>
            </div>
          </div>

          {isOpen && DailyReward && (
            <div className={dailyPopupStyles.overlay}>
              <div className={dailyPopupStyles.popup}>
                <h2 className={dailyPopupStyles.title}>Daily Reward</h2>
                <div className={dailyPopupStyles.iconContainer}>
                  <img
                    className={dailyPopupStyles.icon}
                    src={"/images/String Arc8 Daily Reward.png"}
                    alt="Daily Reward"
                  />
                </div>
                <p className={dailyPopupStyles.reward}>{DailyReward}</p>
                <button
                  className={dailyPopupStyles.claimButton}
                  onClick={handleClaimReward}
                  disabled={claimed || DailyReward === null || isClaiming}
                >
                  {isClaiming ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Claim"
                  )}
                </button>
              </div>
            </div>
          )}
          <div style={{ width: "100%", overflow: "hidden", marginTop: "12px" }}>
            {/* <Game /> */}
            <Grid container spacing={0}>
              {categoryGameData?.length > 0 &&
                categoryGameData?.map((data, index) => {
                  return (
                    <Grid item key={data._id || index} xs={12}>
                      <GamePlayNewCard data={data} index={index} />
                    </Grid>
                  );
                })}
            </Grid>
          </div>
        </Container>
      )}
    </>
  );
}

HomePage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
