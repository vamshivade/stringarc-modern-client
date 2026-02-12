import React from "react";
import { Box, Typography } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { styled } from "@mui/material/styles";

const StyledModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  zIndex: 1,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  "& .modal-content": {
    backgroundColor: "#fefefe",
    padding: "3px",
    border: "1px solid #888",
    borderRadius: "7px",
    boxShadow: "none",
    color: "#fff",
    position: "relative",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#28192b",
    filter: "none",
    backgroundImage:
      "linear-gradient(#3f2045, #3f2045), linear-gradient(rgb(222, 20, 255) 0%, rgba(52, 88, 141, 0.79) 100%)",
    backgroundOrigin: "border-box",
    backgroundClip: "content-box, border-box",
    cursor: "pointer",
    "@media (max-width: 768px)": {
      width: "75%",
    },
    "@media (min-width: 769px)": {
      width: "50%",
    },
  },
  "& p": {
    textAlign: "center",
    margin: 0,
    fontSize: "16px",
    fontWeight: 300,
    lineHeight: "20px",
    letterSpacing: "0.01071em",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  },
  "& button": {
    background: "#44134b",
    border: "1px solid #9c27b0",
    padding: "5px 9px",
    borderRadius: "100px",
    color: "#ffffffc2",
    fontWeight: 300,
    fontSize: "12px",
    cursor: "pointer",
  },
});

const RecaptchaModal = ({ recaptchaVerified, setRecaptchaVerified }) => {
  const onRecaptchaSuccess = () => {
    setRecaptchaVerified(true);
  };

  const onRecaptchaExpired = () => {
    setRecaptchaVerified(false);
  };

  setRecaptchaVerified(true);
  return (
    <>
      {!recaptchaVerified && (
        <StyledModal>
          <Box className="modal-content">
            <Typography variant="body1">
              Please complete the reCAPTCHA to start the game.
            </Typography>
            <ReCAPTCHA
              sitekey="6LcaEG4qAAAAAPy2u1l828HCJfyYFCdGVBZ7QH3A"
              onChange={onRecaptchaSuccess}
              onExpired={onRecaptchaExpired}
            />
          </Box>
        </StyledModal>
      )}
    </>
  );
};

export default RecaptchaModal;
