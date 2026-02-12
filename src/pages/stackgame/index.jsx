import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Banner from "./Banner";
import DashboardLayout from "@/layout/DashboardLayout";
import Rules from "@/components/Rules";
import { getAPIHandler } from "@/ApiConfig/service";
import axios from "axios";
import { useRouter } from "next/router";

export default function Pacmangame() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);
  const [page, setPage] = useState(1);
  const [leaderBoardList, setLeaderBoardLlist] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [categoryData, setCategoryData] = useState();
  const [noOfPages, setNoOfPages] = useState({
    totalPages: 1,
    totalData: 1,
  });

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  const handleScroll = () => {
    const scrollHeightToShowButton = 250;
    if (window.scrollY > scrollHeightToShowButton) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getLeaderBoardHistory = async (source, id) => {
    try {
      setisLoading(true);
      const response = await getAPIHandler({
        endPoint: "getLeaderBoard",
        source: source,
        paramsData: {
          page: page,
          limit: 10,
          gameId: localStorage.getItem("gameId"),
        },
      });

      if (response && response.data?.responseCode === 200) {
        setLeaderBoardLlist(response.data.result.docs);
        setNoOfPages({
          totalPages: response.data.result.pages,
          totalData: response.data.result.total,
        });
      } else {
        setLeaderBoardLlist([]);
      }
      setisLoading(false);
    } catch (err) {
      //console.log(err);
    }
  };

  const getGameMinMax = async (source, id) => {
    try {
      const res = await getAPIHandler({
        endPoint: "userViewGame",
        paramsData: {
          _id: id,
        },
        source: source,
      });
      if (res && res.data?.responseCode === 200) {
        setCategoryData(res.data.result);
        const levelData = JSON.stringify(res.data.result.level);
        localStorage.setItem("stackLevelData", levelData);
      } else {
        setCategoryData();
      }
    } catch (error) {
      //console.log(error);
      setCategoryData();
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    if (location?.search?.split("?")[1]) {
      getGameMinMax(source, location?.search?.split("?")[1]);
      // window.localStorage.setItem("gameId", location?.search?.split("?")[1]);
    } else {
      router.push("/");
    }

    return () => {
      source.cancel();
    };
  }, [location]);

  // useEffect(() => {
  //   const source = axios.CancelToken.source();
  //   if (localStorage.getItem("gameId")) {
  //     getLeaderBoardHistory(source, localStorage.getItem("gameId"));
  //   }
  //   return () => {
  //     source.cancel();
  //   };
  // }, [page, localStorage.getItem("gameId")]);

  return (
    <>
      <Box className="bannerlanding1">
        <Banner categoryData={categoryData} />
        <Box
          style={{
            position: "relative",
            top: "10px",
            padding: "0px",
            margin: "0px",
          }}
        >
          <Rules categoryData={categoryData} />
        </Box>
      </Box>
    </>
  );
}

Pacmangame.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
