import axios from "axios";
import ApiConfig from "../ApiConfig";
import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const encryptSecretKey = (key, timestamp) => {
  // Prepare payload
  const payloadToEncrypt = `${key}&TimeStamp=${timestamp}`;

  // Encrypt the payload
  const encrypted = CryptoJS.AES.encrypt(payloadToEncrypt, key).toString();
  return encrypted;
};

export const postAPIHandler = async ({ endPoint, dataToSend, paramsData }) => {
  const currentTimestamp = new Date().getTime();
  const clientid = encryptSecretKey(secretKey, currentTimestamp);

  try {
    return await axios({
      method: "POST",
      url: ApiConfig[endPoint],
      headers: {
        token: window.localStorage.getItem("modernToken3"),
        clientid: clientid,
      },
      data: dataToSend ? dataToSend : null,
      params: paramsData ? paramsData : null,
    });
  } catch (error) {
    return error.response;
  }
};
export const postAPIHandler1 = async ({ endPoint, dataToSend, paramsData }) => {
  const currentTimestamp = new Date().getTime();
  const clientid = encryptSecretKey(secretKey, currentTimestamp);
  try {
    return await axios({
      method: "POST",
      url: ApiConfig[endPoint],
      headers: {
        initdata: window.Telegram.WebApp.initData,
        clientid: clientid,
      },
      data: dataToSend ? dataToSend : null,
      params: paramsData ? paramsData : null,
    });
  } catch (error) {
    return error.response;
  }
};
export const putAPIHandler = async ({ endPoint, dataToSend, paramsData }) => {
  const currentTimestamp = new Date().getTime();
  const clientid = encryptSecretKey(secretKey, currentTimestamp);
  try {
    return await axios({
      method: "PUT",
      url: ApiConfig[endPoint],
      headers: {
        token: window.localStorage.getItem("modernToken3"),
        clientid: clientid,
      },
      data: dataToSend ? dataToSend : null,
      params: paramsData ? paramsData : null,
    });
  } catch (error) {
    return error.response;
  }
};

export const getAPIHandler = async ({ endPoint, id, source, paramsData }) => {
  const currentTimestamp = new Date().getTime();
  const clientid = encryptSecretKey(secretKey, currentTimestamp);
  try {
    return await axios({
      method: "GET",
      url: id ? `${ApiConfig[endPoint]}/${id}` : ApiConfig[endPoint],
      params: paramsData ? paramsData : null,
      headers: {
        token: window.localStorage.getItem("modernToken3"),
        clientid: clientid,
      },
      cancelToken: source ? source.token : null,
    });
  } catch (error) {
    return error.response;
  }
};
