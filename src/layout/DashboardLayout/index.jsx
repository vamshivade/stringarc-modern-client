import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import TopBar from "./TopBar";
import { useRouter } from "next/router";
import { isAuthenticated, withoutAuthRoutes } from "@/AuthGuard";
import AppContext from "@/context/AppContext";
import { Footer } from "./Footer";

const RootContainer = styled("div")({
  background: "#0D070E",
  position: "fixed",
  width: "100%",
  height: "100vh",
});

const WrapperContainer = styled("div")({
  display: "relative",
  flex: "1 1 auto",
  overflow: "hidden",
  marginTop: "6vh",
  marginBottom: "8vh",
  height: "86vh",
});

const BackgroundContainer = styled("div")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  backgroundImage: "url('/images/4dec/modernbg.9c43e95b.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: -1,
  opacity: 0.4,
});

const DashboardLayout = ({ children }) => {
  let router = useRouter();
  let auth = useContext(AppContext);

  useEffect(() => {
    const notRequiresAuth = !withoutAuthRoutes.includes(router.pathname);
    if (isAuthenticated() && router.pathname !== "/") {
      notRequiresAuth && router.push("/");
    }
  }, [router.pathname, auth?.userLoggedIn]);

  document.oncontextmenu = () => {
    // Disable right click
    return false;
  };

  document.onkeydown = (e) => {
    // Disable F12
    if (e.key === "F12") {
      return false;
    }

    // Disable Ctrl + U
    if (e.ctrlKey && e.key === "u") {
      return false;
    }

    // Disable Ctrl + Shift + I
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
      return false;
    }
  };

  return (
    <RootContainer>
      <TopBar />
      <WrapperContainer>
        <BackgroundContainer />
        {children}
      </WrapperContainer>
      <Footer />
    </RootContainer>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export default DashboardLayout;
