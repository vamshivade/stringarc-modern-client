import React, { useEffect, useState } from "react";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";

const RootContainer = styled("div")`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 2000;
  background: #000000;
`;

const LoaderImage = styled("img")`
  width: 70%;
  height: 70%;
`;

export default function PageLoading() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3 * 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <RootContainer>
      <Box align="center">
        <LoaderImage src="/images/modern.svg" alt="loader" />
      </Box>
    </RootContainer>
  );
}
