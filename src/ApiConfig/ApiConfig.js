export const baseurl = "https://tele-modback.stringarc8.io";
export const reCaptchaKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
export const REDIRECT_URI = "https://tele-modfront.stringarc8.io/";
export const clientSecret = process.env.clientSecret;
export const googleLoginClientId = process.env.googleLoginClientId;

let url = `${baseurl}/api/v1`;
let user = `${baseurl}/api/v1/user`;
let admin = `${baseurl}/api/v1/admin`;
let ticket = `${baseurl}/api/v1/ticket`;
let solana = `${baseurl}/api/v1/solana`;
let tasks = `${baseurl}/api/v1/task`;
let booster = `${baseurl}/api/v1/Booster`;
let ads = `${baseurl}/api/v1/ads`;

const ApiConfig = {
  signup: `${user}/signup`,
  login: `${user}/login`,
  changePassword: `${user}/changePassword`,
  forgotPassword: `${user}/forgotPassword`,
  resetPassword: `${user}/resetPassword`,
  changePassword: `${user}/changePassword`,
  verifyOTP: `${user}/verifyOTP`,
  verifyOTPSignUp: `${user}/verifyOTPSignUp`,
  isChange: `${user}/isChange`,
  resendOtp: `${user}/resendOtp`,
  getProfile: `${user}/getProfile`,
  editProfile: `${user}/editProfile`,
  checkUserName: `${user}/checkUserName`,
  socialLogin: `${user}/socialLogin`,
  verify2FAOTP: `${user}/verify2FAOTP`,
  editEmail2FA: `${user}/editEmail2FA`,
  enableTwoFactorGoogle: `${user}/enableTwoFactorGoogle`,
  verifyTwoFactorGoogle: `${user}/verifyTwoFactorGoogle`,
  contactUs: `${user}/contactUs`,
  listBannerUser: `${user}/listBannerUser`,
  graphDWUser: `${user}/graphDWUser`,
  playGame: `${user}/playGame`,
  createGameHistory: `${user}/createGameHistory`,
  getgamestatus: `${user}/getgamestatus`,
  getGameHistory: `${user}/getGameHistory`,
  userReferredList: `${user}/userReferredList`,
  graphGameScore: `${user}/graphGameScore`,
  editSound: `${user}/editSound`,
  getLatestBet: `${user}/getLatestBet`,

  listBannerUser: `${url}/banner/listBannerUser`,

  gettask: `${tasks}/gettask`,
  taskstatus: `${tasks}/taskstatus`,
  getuserTask: `${tasks}/getuserTask`,

  boosterdata: `${booster}/boosterdata`,
  userboosters: `${booster}/userboosters`,
  transferurls: `${booster}/transferurls`,
  boosterstatus: `${booster}/boosterstatus`,

  getrewardplan: `${url}/rewards/getrewardplan`,
  addclaim: `${url}/rewards/addclaim`,

  // ticket
  getTickets: `${ticket}/userGetTickets`,
  buyTicket: `${ticket}/buyTicket`,
  transactionListUser: `${ticket}/transactionListUser`,
  graphAnalytics: `${ticket}/graphAnalytics`,
  createWithdrawRequest: `${ticket}/createWithdrawRequest`,
  withDrawTwoFactorAuth: `${ticket}/withDrawTwoFactorAuth`,
  getwithdrawsettings: `${ticket}/getwithdrawsettings`,

  connectWallet: `${solana}/connectWallet`,

  ///static////
  faqList: `${url}/static/faqList`,
  staticContentList: `${url}/static/staticContentList`,

  ///Category////
  listCategory: `${url}/category/listCategory`,

  /////ads////
  getAds: `${ads}/getAds`,
  adsRewards: `${ads}/Adsreward`,
  adsEndTime: `${ads}/adsEndTime`,

  ///game////
  userGameList: `${url}/game/userGameList`,
  userViewGame: `${url}/game/userViewGame`,
  userGameListAll: `${url}/game/userGameListAll`,
  searchGame: `${url}/game/searchGame`,

  // Histories
  allHistories: `${admin}/allHistories`,

  ///notification////
  listNotification: `${url}/notification/listNotification`,
  deleteNotification: `${url}/notification/deleteNotification`,
  clearNotification: `${url}/notification/clearNotification`,
  readStatus: `${url}/notification/readStatus`,
  readNotification: `${url}/notification/readNotification`,
  // graph
  graphDWUser: `${user}/graphDWUser`,
  graphGameHistoryUser: `${user}/graphGameHistoryUser`,
  getLatestBet: `${user}/getLatestBet`,
};

export default ApiConfig;
