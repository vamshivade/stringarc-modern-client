import React from "react";
import { Box, Typography, Grid, Container, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { styled } from "@mui/system";

const RulesBox = styled(Box)(({ theme }) => ({
  "& .topPlayerBox": {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    "& h3": {
      color: "rgba(255, 255, 255, 1)",
      fontWeight: "600",
      textAlign: "center",
      width: "100%",
      maxWidth: "612px",
      margin: "0 auto",
      lineHeight: "53px",
      "@media(max-width:425px)": {
        lineHeight: "35px",
      },
    },
    "& .playerContentBox": {
      padding: "30px 0 70px",
      [theme.breakpoints.down("sm")]: {
        padding: "30px 0 50px",
      },
    },
  },
  "& .mainStepBox": {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "20px",
    background: "rgb(0 0 0 / 59%)",
    padding: "24px 14px 11px!important",
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      height: "auto",
    },
    "& h4": {
      fontSize: "18px",
      color: "#fff",
    },
    "& h6": {
      fontSize: "20px !important",
      color: "#fff",
    },
    "& p": {
      width: "100%",
      color: "rgba(255, 255, 255, 0.60)",
      fontFamily: "Satoshi-Light !important",
      width: "100%",
      maxWidth: "279px",
      margin: "0 auto",
      fontSize: "16px !important",
    },
    "& .imageBox": {
      width: "130px",
      height: "130px",
    },
    "& .numberBox": {
      background:
        "var(--sdfsffsf, linear-gradient(105deg, #FFCA64 -4.56%, #CA772A 93.4%))",
      width: "60px",
      height: "60px",
      position: "absolute",
      top: "-41px",
      left: "50%",
      transform: "translateX(-50%)",
      [theme.breakpoints.down("sm")]: {
        top: "-27px",
      },
      "& h4": {
        fontWeight: "500",
        fontSize: "30px",
        "@media(max-width:899px)": {
          fontSize: "20px",
        },
      },
      "@media(max-width:899px)": {
        width: "40px",
        height: "40px",
      },
    },
  },
}));

function Rules({ categoryData }) {
  const arrayData = [
    {
      title: categoryData?.rules[0]?.ruleTitle,
      value: categoryData?.rules[0]?.ruleDescription,
      borderTop: "2px solid #FFB02D",
    },
    {
      title: categoryData?.rules[1]?.ruleTitle,
      value: categoryData?.rules[1]?.ruleDescription,
      borderTop: "2px solid #DE14FF",
      background: "linear-gradient(105deg, #C094F8 -4.56%, #914AF3 93.4%)",
    },
    {
      title: categoryData?.rules[2]?.ruleTitle,
      value: categoryData?.rules[2]?.ruleDescription,
      borderTop: "2px solid #158743",
      background: "linear-gradient(105deg, #58D98C -4.56%, #158743 93.4%)",
    },
  ];

  return (
    <RulesBox>
      <Box className="topPlayerBox">
        <Box
          align="center"
          style={{
            width: "95%",
            position: "relative",
            display: "flex",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "15px",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h3" color="primary">
            Rules for playing game in Three Easy Steps
          </Typography>
        </Box>
        <Container>
          <Box
            className="playerContentBox"
            style={{
              maxHeight: "55vh", // Set the maximum height of the box
              overflowY: "auto", // Enable vertical scrolling
              marginBottom: "10px",
              scrollbarWidth: "none",
            }}
          >
            <Grid container spacing={3}>
              {arrayData?.map((item, i) => {
                return (
                  <Grid
                    item
                    lg={4}
                    md={4}
                    sm={6}
                    xs={12}
                    key={i}
                    // style={{ marginBottom: "10px" }}
                  >
                    <Box
                      className="mainStepBox"
                      align="center"
                      mb={2}
                      style={{
                        borderTop: item.borderTop,
                        borderBottom: item.borderTop,
                      }}
                    >
                      <Box>
                        <IconButton
                          className="numberBox"
                          style={{
                            background: item.background,
                          }}
                        >
                          <Typography variant="h4">{i + 1}</Typography>
                        </IconButton>

                        <Box mb={1}>
                          <Typography
                            variant="h6"
                            style={{ textTransform: "capitalize" }}
                          >
                            {item.title || "..."}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="secondary">
                          {item.value || "..."}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Container>
      </Box>
    </RulesBox>
  );
}

export default Rules;
