import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  Divider,
  Pagination,
  PaginationItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AppContext from "@/context/AppContext";
import { getAPIHandler } from "@/ApiConfig/service";

// Styled components
const HeaderContainer = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  padding: theme.spacing(1.5, 2),
  borderRadius: "12px 12px 0 0",
  color: "white",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  background: "rgba(30, 35, 45, 0.7)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
    background: "rgba(35, 40, 50, 0.8)",
  },
  overflow: "hidden",
  position: "relative",
  padding: theme.spacing(0),
}));

const AmountChip = styled(Chip)(({ theme }) => ({
  fontWeight: "bold",
  background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  color: "white",
  boxShadow: "0 2px 6px rgba(56, 239, 125, 0.3)",
  padding: theme.spacing(0, 0.5),
  height: 24,
  fontSize: 12,
}));

const CountBadge = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.15)",
  borderRadius: theme.spacing(4),
  padding: theme.spacing(0.2, 1.5),
  display: "inline-flex",
  alignItems: "center",
  backdropFilter: "blur(5px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  fontSize: 12,
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2, 1.5, 2),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  "& svg": {
    color: "rgba(255, 255, 255, 0.6)",
    marginRight: theme.spacing(1),
    fontSize: 16,
  },
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    color: "rgba(255, 255, 255, 0.7)",
    minWidth: 30,
    height: 30,
    fontSize: 13,
    "&.Mui-selected": {
      background: "rgba(255, 255, 255, 0.15)",
      color: "white",
      fontWeight: "bold",
    },
    "&:hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "150px",
  color: "white",
}));

const PageContainer = styled(Box)(({ theme }) => ({
  height: "86vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  // background: "linear-gradient(135deg, #1e2a40 0%, #121420 100%)",
  position: "relative",
  overflowX: "hidden",
  overflowY: "auto",
  "&::before": {
    content: '""',
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    // backgroundImage:
    //   "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232a3a5a' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E\")",

    opacity: 0.5,
    zIndex: 0,
    width: "100%",
    height: "100%",
  },
  // Hide scrollbar
  "&::-webkit-scrollbar": {
    width: 0,
    display: "none",
  },
  scrollbarWidth: "none", // Firefox
  msOverflowStyle: "none", // IE and Edge
}));

export default function ReferralHistories() {
  const [loading, setLoading] = useState(true);
  const [referralHistories, setReferralHistories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Default page number is 1
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [limit, setLimit] = useState(10); // Number of items per page
  const [refrerralCount, setRefrerralCount] = useState(0);
  const { userData } = useContext(AppContext);

  const fetchAllHistories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAPIHandler({
        endPoint: "allHistories",
        paramsData: {
          historyType: "referral",
          ReferredBy: userData?._id,
          page,
          limit,
        },
      });

      if (response && response.data?.responseCode === 200) {
        const {
          docs,
          page: currentPg,
          pages,
          limit: resLimit,
          total,
        } = response.data.result;

        setReferralHistories(docs || []);
        setCurrentPage(currentPg);
        setTotalPages(pages);
        setLimit(resLimit);
        setRefrerralCount(total);
      } else {
        console.error("Failed to fetch referral histories:");
      }
    } catch (error) {
      console.error("Error fetching all histories: ");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value); // Update current page number
    fetchAllHistories(value); // Fetch data for the selected page
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    if (userData && userData?._id) {
      fetchAllHistories();
    }
  }, [userData]);

  return (
    <PageContainer>
      <Box
        sx={{
          p: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(10px)",
          background: "rgba(30, 35, 45, 0.7)",
        }}
      >
        <HeaderContainer>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="subtitle1"
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 0.2,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontSize: 16,
              }}
            >
              Referral History
            </Typography>
            <CountBadge>
              <PersonAddIcon sx={{ fontSize: 12, mr: 0.5 }} />
              <Typography variant="caption">
                Total Referrals: {loading ? "..." : refrerralCount}
              </Typography>
            </CountBadge>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            aria-label="close"
            sx={{
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
              zIndex: 1,
              position: "relative",
              padding: 0.5,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </HeaderContainer>
      </Box>

      <Box sx={{ p: 2, pt: 2, position: "relative", zIndex: 1, flex: 1 }}>
        {loading ? (
          <LoadingContainer>
            <CircularProgress
              size={30}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
          </LoadingContainer>
        ) : (
          <>
            {referralHistories.map((row, index) => (
              <StyledCard
                key={row._id}
                sx={{
                  animation: "fadeIn 0.3s ease-out",
                  animationDelay: `${index * 0.03}s`,
                  animationFillMode: "both",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(8px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <CardHeader>
                  <Typography
                    sx={{ fontWeight: 600, color: "white", fontSize: 14 }}
                  >
                    {row.userId.userName}
                  </Typography>
                  <AmountChip label={row.Referral_Amount} />
                </CardHeader>

                <Divider
                  sx={{
                    mx: 2,
                    mb: 1,
                    opacity: 0.2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                />

                <CardContent>
                  <InfoItem>
                    <CalendarTodayIcon fontSize="small" />
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {formatDate(row.createdAt)}
                    </Typography>
                  </InfoItem>
                </CardContent>
              </StyledCard>
            ))}

            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 1.5,
                mb: 2,
                "& .MuiPaginationItem-root": {
                  color: "white",
                },
              }}
            >
              <StyledPagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
                size="small"
                siblingCount={1}
                boundaryCount={1}
                renderItem={(item) => (
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                    {...item}
                  />
                )}
              />
            </Box>
          </>
        )}
      </Box>
    </PageContainer>
  );
}
