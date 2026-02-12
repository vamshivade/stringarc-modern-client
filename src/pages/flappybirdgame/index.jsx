import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/layout/DashboardLayout";
import Banner from "./Banner";
import Rules from "@/components/Rules";
import { getAPIHandler } from "@/ApiConfig/service";
import axios from "axios";
import { useRouter } from "next/router";

export default function FlappyBirdGame() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState();

  const getGameMinMax = async (source, id) => {
    try {
      const res = await getAPIHandler({
        endPoint: "userViewGame",
        paramsData: {
          _id: id,
        },
        source: source,
      });

      if (res && res.data.responseCode === 200) {
        setCategoryData(res.data.result);
        const levelData = JSON.stringify(res.data.result.level);

        localStorage.setItem("flappyBirdLevelData", levelData);
        // localStorage.setItem("gameId", res.data.result._id);
      } else {
        setCategoryData();
      }
    } catch (error) {
      //console.log("error");
      setCategoryData();
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    if (location?.search?.split("?")[1]) {
      getGameMinMax(source, location?.search?.split("?")[1]);
    } else {
      router.push("/");
    }

    return () => {
      source.cancel();
    };
  }, [location]);

  return (
    <>
      <Box
        className="bannerlanding1"
        style={{
          position: "relative",
          height: "86vh",
        }}
      >
        <Banner categoryData={categoryData} />
        <Rules categoryData={categoryData} />
      </Box>
    </>
  );
}

FlappyBirdGame.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
