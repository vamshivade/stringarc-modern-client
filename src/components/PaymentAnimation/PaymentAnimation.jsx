import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "86vh",
        position: "fixed",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.9)",
      }}
    >
      <StyledWrapper>
        <div className="loader">
          <span />
        </div>
      </StyledWrapper>
      <h3
        style={{
          color: "#ffff00",
          marginTop: "30px",
          letterSpacing: "1.5px",
          textAlign: "center",
          fontFamily: "Poppins",
          fontWeight: 500,
        }}
      >
        Verifying Your Payment
      </h3>
      <p
        style={{
          maxWidth: "80%",
          color: "#ffff00",
          letterSpacing: "1.2px",
          textAlign: "center",
          fontFamily: "Poppins",
          fontSize: "1.2rem",
        }}
      >
        This may take a few seconds. Please wait...
      </p>
    </div>
  );
};

const StyledWrapper = styled.div`
  .loader {
    position: relative;
    width: 125px;
    height: 125px;
    background: transparent;
    border-radius: 50%;
    box-shadow: 25px 25px 75px rgba(0, 0, 0, 0.55);
    border: 1px solid #fac142;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .loader::before {
    content: "";
    position: absolute;
    inset: 20px;
    background: transparent;
    border: 1px dashed #fac142;
    border-radius: 50%;
    box-shadow: inset -5px -5px 25px rgba(0, 0, 0, 0.25),
      inset 5px 5px 35px rgba(0, 0, 0, 0.25);
  }

  .loader::after {
    content: "";
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px dashed #fac142;
    box-shadow: inset -5px -5px 25px rgba(0, 0, 0, 0.25),
      inset 5px 5px 35px rgba(0, 0, 0, 0.25);
  }

  .loader span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 100%;
    background: transparent;
    transform-origin: top left;
    animation: radar82 2s linear infinite;
    border-top: 1px dashed #fff;
  }

  .loader span::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fac142;
    transform-origin: top left;
    transform: rotate(-55deg);
    filter: blur(30px) drop-shadow(20px 20px 20px #fac142);
  }

  @keyframes radar82 {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loader;
