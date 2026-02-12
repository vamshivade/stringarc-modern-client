import React from "react";
import { CircularProgress, Box } from "@mui/material";

export default function ButtonCircularProgress() {
  return (
    <Box
      color="secondary.main"
      display="flex"
      style={{
        display: "flex",
        justifyContent: "center",
        marginLeft: "10px",
      }}
    >
      <CircularProgress size={20} thickness={5} style={{ color: "22A7F0" }} />
    </Box>
  );
}
