import React, { useContext } from "react";
import { Container } from "@mui/material";
import AppContext from "@/context/AppContext";
import displayBarStyles from "./displayBar.module.css";
import { Col, Row } from "react-bootstrap";
import Image from "next/image";

export default function TopBar() {
  const auth = useContext(AppContext);
  const getTickets = auth?.getTickets;
  const { ticketBalance, userData } = auth;

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

  return (
    <Container fluid className={`w-100 px-2 ${displayBarStyles.wrapper}`}>
      <Row className={displayBarStyles.displayRow}>
        <Col xs={6} className={displayBarStyles.currencyCol}>
          <div className={displayBarStyles.currencyWrapper}>
            <div className={displayBarStyles.diamond}>
              <Image
                src="/images/4dec/Treasure Box2.png"
                alt="Treasure Box"
                width={20}
                height={20}
                fetchpriority="high"
              />
            </div>
            <span className={displayBarStyles.amount}>
              {userData ? formatNumber(ticketBalance) : formatNumber(0)}
            </span>
          </div>
        </Col>

        <Col xs={6} className={displayBarStyles.ticketsCol}>
          <span className={displayBarStyles.ticketText}>
            <span>
              <Image
                src="/images/4dec/Treasure Box2.png"
                alt="Balance Icon"
                width={20}
                height={20}
                fetchpriority="high"
                className={displayBarStyles.balanceImage}
              />
              {formatNumber(getTickets?.ticketQuantity || 0)}
            </span>
            =
            <span>
              {getTickets?.amountInToken || 0}
              <Image
                src="/images/thet.png"
                alt="Thet Icon"
                width={20}
                height={20}
                fetchpriority="high"
                className={displayBarStyles.thetIcon}
              />
            </span>
          </span>
        </Col>
      </Row>
    </Container>
  );
}
