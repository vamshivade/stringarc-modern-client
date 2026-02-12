import { ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { createCustomTheme } from "/src/Themes/index";
import ContextWrapper from "@/context/ContextWrapper";
import { Router, useRouter } from "next/router";
import { isAuthenticated, withoutAuthRoutes } from "@/AuthGuard";
import { Toaster } from "react-hot-toast";
import SessionManageComponent from "@/components/SessionManageComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardLayout from "@/layout/DashboardLayout";
import Script from "next/script";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useTelegram } from "@/hooks/useTelegram";

function MyApp({ Component, pageProps }) {
  const { isValidTelegram } = useTelegram();
  const theme = createCustomTheme();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Default to true to prevent content rendering until checks are complete

  useEffect(() => {
    // Ensure the Telegram back button is hidden globally for all pages by default
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.hide(); // Hide the back button on all pages

      // Cleanup: Hide the back button when navigating away
      const handleRouteChange = () => {
        tg.BackButton.hide(); // Hide the back button on route change
      };

      router.events.on("routeChangeStart", handleRouteChange);

      // Cleanup on component unmount
      return () => {
        router.events.off("routeChangeStart", handleRouteChange);
      };
    }
  }, [router.events]);

  const getLayout =
    Component.getLayout ||
    ((page) => <DashboardLayout>{page}</DashboardLayout>);

  useEffect(() => {
    localStorage.setItem("baseUrl", process.env.NEXT_PUBLIC_BASE_URL);
    const notRequiresAuth = !withoutAuthRoutes.includes(router.pathname);
    if (isAuthenticated() && router.pathname !== "/") {
      notRequiresAuth && router.push("/");
    }
    if (!router.pathname.includes("/game")) {
      localStorage.removeItem("currentLevel");
      localStorage.removeItem("betAmount");
      localStorage.removeItem("highScore");
      localStorage.removeItem("gameCodeId");
    }
  }, [router.pathname]);

  useEffect(() => {
    setIsClient(true);
    setLoading(false); // Set loading to false after initial state checks
  }, []);

  useEffect(() => {
    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);

    Router.events.on("routeChangeStart", startLoading);
    Router.events.on("routeChangeComplete", stopLoading);
    Router.events.on("routeChangeError", stopLoading);

    return () => {
      Router.events.off("routeChangeStart", startLoading);
      Router.events.off("routeChangeComplete", stopLoading);
      Router.events.off("routeChangeError", stopLoading);
    };
  }, []);

  const renderNotMobileDevice = () => (
    <div
      style={{
        background: "linear-gradient(to bottom, #000428, #004e92",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        padding: "10px",
      }}
    >
      <img
        src="/images/4dec/NotFound404.png"
        alt=""
        style={{
          maxWidth: "70vw",
          height: "150px",
          objectFit: "contain",
          filter: "drop-shadow(2px 4px 30px black)",
        }}
      />
      <h1
        style={{
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          opacity: 1,
          color: "white",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(to right, #eedd44, #f32170, #ff6b08, #cf23cf, #eedd44)",
          backgroundSize: "200% auto", // Required for the animation
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shine 3s linear infinite", // Add the animation
          filter: "drop-shadow(black 2px 2px 10px)",
        }}
      >
        @stringarc8modernbot
      </h1>
      <style>
        {`
          @-webkit-keyframes shine {
            0% {
              background-position: 100%;
            }
            100% {
              background-position: -100%;
            }
          }
          @keyframes shine {
            0% {
              background-position: 100%;
            }
            100% {
              background-position: -100%;
            }
          }
        `}
      </style>
      <h5 style={{ color: "yellow", textAlign: "center" }}>
        Play on Telegram Mobile!
      </h5>
    </div>
  );

  // Show a loading state until everything is ready
  if (loading) {
    return (
      <div>Loading...</div> // You can replace this with a better loading screen
    );
  }

  // If not a valid Telegram platform, show the unsupported message
  if (!isValidTelegram) {
    return renderNotMobileDevice();
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Telegram && window.Telegram?.WebApp) {
            const telegram = window.Telegram.WebApp;
            telegram.ready();
            telegram.expand();
          }
        }}
      />
      <Toaster autoClose={1000} position="top-right" reverseOrder={false} />

      {!loading && isClient && (
        <TonConnectUIProvider manifestUrl="https://tele-modfront.stringarc8.io/tonconnect-manifest.json">
          <ThemeProvider theme={theme}>
            <ContextWrapper>
              <SessionManageComponent />
              {getLayout(<Component {...pageProps} />)}
            </ContextWrapper>
          </ThemeProvider>
        </TonConnectUIProvider>
      )}
    </>
  );
}

export default MyApp;
