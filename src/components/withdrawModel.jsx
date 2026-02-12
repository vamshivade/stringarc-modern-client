"use client";

import { postAPIHandler, getAPIHandler } from "@/ApiConfig/service";
import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import AppContext from "@/context/AppContext";
import axios from "axios";

export function WithdrawModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("withdraw");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [walletId, setWalletId] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawHistories, setWithdrawHistories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [minWithdraw, setMinWithdraw] = useState(null);
  const [maxWithdraw, setMaxWithdraw] = useState(null);
  const [percentageCharge, setPercentageCharge] = useState(2);

  // Pagination states for the History tab
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const {
    getProfileDataApi,
    updateTicketBalance,
    ticketBalance,
    getTickets,
    userData,
  } = useContext(AppContext);

  const ticketQuantity = Number(getTickets?.ticketQuantity);

  // --- FETCH WITHDRAWAL HISTORIES WITH PAGINATION ---
  const fetchWithdrawalHistories = async (page = 1) => {
    setLoadingData(true);
    try {
      const response = await getAPIHandler({
        endPoint: "allHistories",
        paramsData: {
          historyType: "withdrawals",
          userId: userData?._id,
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
        } = response.data.result;
        setWithdrawHistories(docs || []);
        setCurrentPage(currentPg);
        setTotalPages(pages);
        setLimit(resLimit);
      }
    } catch (error) {
      //console.log("Error fetching all histories: ");
    } finally {
      setLoadingData(false);
    }
  };

  // --- GET PAGE NUMBERS FOR ELLIPSIS PAGINATION ---
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage < 4) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage > totalPages - 3) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  // --- HANDLE PAGE CHANGE ---
  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchWithdrawalHistories(pageNum);
    }
  };

  useEffect(() => {
    // Only fetch history when the user switches to the "history" tab
    if (activeTab === "history" && userData?._id) {
      fetchWithdrawalHistories();
    }
  }, [activeTab, userData]);

  // --- FETCH WITHDRAW SETTINGS ---
  const fetchWithdrawSettingsForUser = async (source) => {
    try {
      const response = await getAPIHandler({
        endPoint: "getwithdrawsettings",
        source: source,
      });

      const activeSettings = response.data?.result.filter(
        (settings) => settings?.status === "ACTIVE"
      );
      if (activeSettings && activeSettings.length > 0) {
        setMaxWithdraw(activeSettings[0].Max_Withdraw);
        setMinWithdraw(activeSettings[0].Min_Withdraw);
        setPercentageCharge(activeSettings[0].Percentage_Charge);
        setNetwork(activeSettings[0].Symbol);
      } else {
        console.error("No active settings found.");
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully (don't log it)
        //console.log("Request canceled due to component unmounting");
      } else {
        console.error("Error fetching category game data:", error);
      }
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchWithdrawSettingsForUser(source);
    if (activeTab === "history" && userData?._id) {
      fetchWithdrawalHistories();
    }

    return () => {
      source.cancel();
    };
  }, [userData]);

  // --- WITHDRAW LOGIC ---
  const withdraw = async (formData) => {
    try {
      const response = await postAPIHandler({
        endPoint: "withDrawTwoFactorAuth",
        dataToSend: formData,
      });

      if (response && response.data?.responseCode === 200) {
        updateTicketBalance(ticketBalance - formData.quantity);
        toast.success(response.data.message || "Withdraw successful!");
        setIsWithdrawing(false);
        getProfileDataApi();
        onClose();
      } else {
        toast.error(response.data.responseMessage);
        setIsWithdrawing(false);
      }
    } catch (err) {
      console.error("Error during withdraw:");
      setIsWithdrawing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !walletId) {
      toast.error("Please enter all fields.");
      return;
    }

    const formData = {
      walletAddress: walletId,
      quantity: amount,
    };

    setIsWithdrawing(true);
    withdraw(formData);
  };

  // --- FORMAT NUMBER ---
  const formatNumber = (value) => {
    const number = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(number) || number === null || number === undefined) {
      return "0";
    }

    if (number >= 1_000_000_000_000) {
      return (number / 1_000_000_000_000).toFixed(2) + " T";
    } else if (number >= 1_000_000_000) {
      return (number / 1_000_000_000).toFixed(2) + " B";
    } else if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(2) + " M";
    } else if (number >= 1_000) {
      return (number / 1_000).toFixed(2) + " K";
    } else {
      return number.toString();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          zIndex: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "400px",
            borderRadius: "20px",
            border: "1px solid rgb(71 71 71)",
            backgroundColor: "rgb(0, 0, 0)",
            padding: "10px",
            textAlign: "center",
            zIndex: 1000,
            minHeight: "385px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setActiveTab("withdraw")}
              style={{
                flex: 1,
                padding: "4px",
                fontSize: "20px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === "withdraw" ? "2px solid #FFFF00" : "none",
                color: activeTab === "withdraw" ? "#FFFF00" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Withdraw
            </button>

            <button
              onClick={() => setActiveTab("history")}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "20px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === "history" ? "2px solid #FFFF00" : "none",
                color: activeTab === "history" ? "#FFFF00" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              History
            </button>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {activeTab === "withdraw" && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label
                  className="importantFontSize"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#888",
                    fontSize: "14px",
                  }}
                >
                  Choose Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1px solid #FFFF00",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    outline: "none",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <option>{network}</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label
                  className="importantFontSize"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#888",
                    fontSize: "14px",
                  }}
                >
                  Enter Valid Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #FFFF00",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    outline: "none",
                    fontSize: "16px",
                    backdropFilter: "blur(10px)",
                  }}
                  min={minWithdraw * ticketQuantity}
                  max={maxWithdraw * ticketQuantity}
                  step="any"
                  required
                />
              </div>

              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label
                  className="importantFontSize"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#888",
                    fontSize: "14px",
                  }}
                >
                  Wallet ID
                </label>
                <input
                  type="text"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="Enter Wallet ID"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #FFFF00",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    outline: "none",
                    fontSize: "16px",
                    backdropFilter: "blur(10px)",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  fontSize: "14px",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                Platform Charge: {percentageCharge}%
              </div>

              {network && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#aaa",
                    marginTop: "-5px",
                    marginBottom: "10px",
                  }}
                >
                  {`Min: ${formatNumber(
                    minWithdraw * ticketQuantity
                  )} Max: ${formatNumber(maxWithdraw * ticketQuantity)}`}
                </p>
              )}

              <button
                type="submit"
                style={{
                  padding: "2px",
                  background: isWithdrawing ? "#ccc" : "#FF4081",
                  border: "1px solid #FFFF00",
                  fontSize: "22px",
                  borderRadius: "10px",
                  color: "white",
                  cursor: isWithdrawing ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "background 0.3s ease",
                }}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            </form>
          )}

          {activeTab === "history" && (
            <div style={{ textAlign: "left" }}>
              {loadingData ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <p style={{ fontSize: "16px", color: "#666" }}>Loading...</p>
                </div>
              ) : withdrawHistories.length > 0 ? (
                <>
                  <table
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      borderCollapse: "collapse",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "14px",
                      backgroundColor: "transparent",
                      color: "gold",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          No.
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            fontWeight: "600",
                            fontSize: "14px",
                            textAlign: "center",
                          }}
                        >
                          Amount
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            fontWeight: "600",
                            fontSize: "14px",
                            textAlign: "center",
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            fontWeight: "600",
                            fontSize: "14px",
                            textAlign: "center",
                          }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawHistories.map((item, index) => (
                        <tr
                          key={item._id || index}
                          style={{
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.3s",
                            color: "gold",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                          >
                            {/* Display the item index based on pagination */}
                            {(currentPage - 1) * limit + (index + 1)}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: "14px",
                            }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: "14px",
                            }}
                          >
                            {item.createdAt.split("T")[0]}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: "14px",
                            }}
                          >
                            {item.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* PAGINATION UI */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        marginRight: "10px",
                        padding: "6px 12px",
                        backgroundColor: "transparent",
                        border: "1px solid gold",
                        color: "gold",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      P
                    </button>

                    {/* Page Numbers with Ellipses */}
                    {getPageNumbers().map((num, idx) => {
                      if (num === "...") {
                        return (
                          <button
                            key={`ellipsis-${idx}`}
                            disabled
                            style={{
                              marginRight: "5px",
                              padding: "6px 12px",
                              backgroundColor: "transparent",
                              border: "1px solid gold",
                              color: "gold",
                              cursor: "not-allowed",
                            }}
                          >
                            ...
                          </button>
                        );
                      } else {
                        return (
                          <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            style={{
                              marginRight: "5px",
                              padding: "6px 12px",
                              backgroundColor:
                                num === currentPage ? "gold" : "transparent",
                              border: "1px solid gold",
                              color: num === currentPage ? "black" : "gold",
                              cursor: "pointer",
                            }}
                          >
                            {num}
                          </button>
                        );
                      }
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        marginLeft: "10px",
                        padding: "6px 12px",
                        backgroundColor: "transparent",
                        border: "1px solid gold",
                        color: "gold",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      N
                    </button>
                  </div>
                </>
              ) : (
                <p
                  className="importantFontSize"
                  style={{
                    fontSize: "16px",
                    color: "#999",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  No Withdrawal Histories Found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
