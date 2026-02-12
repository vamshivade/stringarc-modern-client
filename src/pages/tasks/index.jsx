// import { useState, useEffect, useContext, useRef, useCallback } from "react";
// import styles from "./tasks.module.css";
// import taskPopupStyles from "./TaskPopup.module.css";
// import MainRewards from "./MainRewards.module.css";
// import BasicTasks from "./BasicTasks.module.css";
// import { X } from "lucide-react";
// import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
// import AppContext from "@/context/AppContext";
// import toast from "react-hot-toast";
// import axios from "axios";
// import PageLoading from "@/components/PageLoader";
// // import TelegramAds from "@/components/TelegramAds";
// import { useRouter } from "next/router";
// import ReactGA from "react-ga";

// const formatTime = (remainingTimeInSeconds) => {
//   const hours = Math.floor(remainingTimeInSeconds / 3600);
//   const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
//   const seconds = remainingTimeInSeconds % 60;
//   const formattedHours = hours > 0 ? String(hours).padStart(2, "0") : "";
//   const formattedMinutes = String(minutes).padStart(2, "0");
//   const formattedSeconds = String(seconds).padStart(2, "0");

//   if (hours > 0) {
//     return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
//   } else if (minutes > 0) {
//     return `${formattedMinutes}:${formattedSeconds}`;
//   } else {
//     return `${formattedSeconds}`;
//   }
// };

// function addMinutes(date, minutes) {
//   return new Date(date.getTime() + minutes * 60 * 1000);
// }

// export default function TasksPage() {
//   const router = useRouter();
//   const { updateTicketBalance, ticketBalance, userData } =
//     useContext(AppContext);

//   const [tabs, setTabs] = useState([]);
//   const [activeTab, setActiveTab] = useState("");
//   const [progress, setProgress] = useState(0);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [tasksFromApi, setTasksFromApi] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [tasksLength, setTasksLength] = useState(0);
//   const [completedTasks, setCompletedTasks] = useState(0);

//   const [adsTasks, setAdsTasks] = useState([]);
//   const [endTimes, setEndTimes] = useState([]);
//   const [adTimers, setAdTimers] = useState({});

//   const [isCompletingTask, setIsCompletingTask] = useState(false);
//   const [adTaskData, setAdTaskData] = useState(null);
//   const [tgAdsInstance, setTgAdsInstance] = useState(null);

//   const [AdController, setAdController] = useState(null);
//   const [adShown, setAdShown] = useState(false);

//   const [isAdProcessing, setIsAdProcessing] = useState({});

//   const showAdextraAd = () => {
//     // Check if the AdExtra SDK is available
//     if (typeof window !== "undefined" && window.p_adextra) {
//       console.log("Calling p_adextra...");

//       // Call the AdExtra ad display function directly
//       window.setTimeout(() => {
//         window.p_adextra();
//       });
//     } else {
//       console.error("AdExtra SDK is not loaded yet.");
//     }
//   };

//   // Google Analytics Page View Tracking
//   useEffect(() => {
//     ReactGA.initialize("G-Q6EKQ53YY4");

//     // Track page view
//     ReactGA.pageview(window.location.pathname + window.location.search);
//   }, [router.asPath]);

//   // Initialize Adsgram SDK on component mount
//   useEffect(() => {
//     if (window && window.Adsgram) {
//       const controller = window.Adsgram.init({ blockId: "int-11986" });
//       setAdController(controller);
//     }
//   }, []);

//   const showAdsgram = useCallback(() => {
//     if (AdController) {
//       AdController.show()
//         .then((result) => {
//           if (result.done) {
//             // Ad watched till the end or closed in interstitial format
//           } else {
//             // Error during ad playback
//             //console.log("Error or ad not completed:", result);
//           }
//         })
//         .catch((result) => {
//           // Handle any errors that occurred during the ad display
//           //console.log("Error during ad playback:", result);
//         });
//     }
//   }, [AdController]);

//   // Ref to store show functions for spot IDs
//   const showAdFunctions = useRef({});

//   // Initialize show functions for spot ID-type AdSDKs
//   useEffect(() => {
//     const initializeShowFunctions = async () => {
//       const spotAds = adsTasks.filter((ad) => /^\d+$/.test(ad.AdSDK)); // Spot IDs are purely numeric
//       await Promise.all(
//         spotAds.map(async (ad) => {
//           try {
//             const show = await window.initCdTma?.({ id: ad.AdSDK });
//             if (show) {
//               showAdFunctions.current[ad.AdSDK] = show;
//             }
//           } catch (error) {
//             console.error(`Error initializing ad with AdSDK ${ad.AdSDK}:`);
//           }
//         })
//       );
//     };

//     if (adsTasks.length > 0) {
//       initializeShowFunctions();
//     }
//   }, [adsTasks]);

//   // *******************************************

//   // tasks progress
//   useEffect(() => {
//     if (tasksLength === 0) {
//       setProgress(0);
//       return;
//     }
//     const percentage = Math.min(
//       (completedTasks / tasksLength) * 100,
//       100
//     ).toFixed(2);
//     setProgress(percentage);
//   }, [completedTasks, tasksLength]);

//   // To fetch tasks
//   const fetchTasks = async (source) => {
//     try {
//       const res = await getAPIHandler({
//         endPoint: "getuserTask",
//         source: source,
//       });

//       if (res && res.data?.responseCode === 200) {
//         const uniqueTaskNames = [
//           ...new Set(res.data.result.map((task) => task.TaskName)),
//         ];
//         setTabs(uniqueTaskNames);

//         setActiveTab((prevActiveTab) => {
//           if (uniqueTaskNames.includes(prevActiveTab)) {
//             return prevActiveTab;
//           } else {
//             return uniqueTaskNames[0] || "";
//           }
//         });

//         const userTasks = res.data.result.map((task) => ({
//           TaskId: task.TaskId,
//           TaskName: task.TaskName,
//           Subtask: task.Subtask,
//           Description: task.Description,
//           Sitelink: task.Sitelink,
//           Rewardpoints: Number(task.Rewardpoints),
//           Siteimg: task.Siteimg,
//           Status: task.Status,
//           TaskImage: task.TaskImage,
//         }));

//         setTasksLength(userTasks.length);

//         const groupedTasks = userTasks.reduce((acc, task) => {
//           if (!acc[task.TaskName]) {
//             acc[task.TaskName] = [];
//           }
//           acc[task.TaskName].push(task);
//           return acc;
//         }, {});
//         setTasksFromApi(groupedTasks);

//         const completedCount = userTasks.filter(
//           (task) => task.Status === "COMPLETED"
//         ).length;
//         setCompletedTasks(completedCount);
//       } else {
//       }
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         // Handle the cancellation gracefully (don't log it)
//         //console.log("Request canceled due to component unmounting");
//       } else {
//         console.error("Error fetching category game data:", error);
//       }
//     } finally {
//       setIsLoading(false); // Set loading state to false after fetching
//     }
//   };

//   // To fetch ads
//   const fetchAds = async (source) => {
//     try {
//       // setIsLoading(true); // Set loading state to true
//       const res = await getAPIHandler({ endPoint: "getAds", source: source });

//       // //console.log("FETCH ADS RESPONSE", res);

//       if (res && res.data?.responseCode === 200) {
//         const activeAds = res.data.result.filter(
//           (ads) => ads.Status === "ACTIVE"
//         );
//         setAdsTasks(activeAds);
//       } else {
//       }
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         // Handle the cancellation gracefully (don't log it)
//         //console.log("Request canceled due to component unmounting");
//       } else {
//         console.error("Error fetching category game data:", error);
//       }
//     } finally {
//       setIsLoading(false); // Set loading state to false after fetching
//     }
//   };

//   // To fetch ad end times
//   const fetchAdEndTimes = async (source) => {
//     try {
//       // setIsLoading(true); // Set loading state to true
//       const res = await getAPIHandler({
//         endPoint: "adsEndTime",
//         source: source,
//       });

//       // //console.log("FETCH ADS END TIMES RESPONSE", res);

//       if (res && res.data?.responseCode === 200) {
//         setEndTimes(res.data.result || []);
//       } else {
//       }
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         // Handle the cancellation gracefully (don't log it)
//         //console.log("Request canceled due to component unmounting");
//       } else {
//         console.error("Error fetching category game data:", error);
//       }
//     } finally {
//       setIsLoading(false); // Set loading state to false after fetching
//     }
//   };

//   useEffect(() => {
//     const source = axios.CancelToken.source();
//     fetchTasks(source);

//     return () => {
//       source.cancel();
//     };
//   }, []);

//   useEffect(() => {
//     const source = axios.CancelToken.source();
//     fetchAdEndTimes(source);

//     return () => {
//       source.cancel();
//     };
//   }, []);

//   useEffect(() => {
//     const source = axios.CancelToken.source();
//     fetchAds(source);

//     return () => {
//       source.cancel();
//     };
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!endTimes || endTimes.length === 0) return;

//       const now = new Date().getTime();
//       const updatedAdTimers = {};

//       endTimes.forEach((ad) => {
//         const { adId, adNextEndTime } = ad;
//         if (!adNextEndTime) {
//           updatedAdTimers[adId] = 0;
//           return;
//         }
//         const endTimeMs = new Date(adNextEndTime).getTime();
//         const diffInSeconds = Math.floor((endTimeMs - now) / 1000);
//         updatedAdTimers[adId] = diffInSeconds > 0 ? diffInSeconds : 0;
//       });

//       setAdTimers(updatedAdTimers);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [endTimes]);

//   const handleRewardClick = (task) => {
//     if (task.Status === "COMPLETED") {
//       toast.error("Task already completed!");
//       return;
//     }

//     if (task.Status === "PENDING" && task.Sitelink) {
//       const newTab = window.open(
//         task.Sitelink,
//         "_blank",
//         "noopener,noreferrer"
//       );

//       if (newTab) {
//         newTab.focus();
//       }

//       setSelectedTask(task);
//       setTimeout(() => {
//         setIsPopupOpen(true);
//       }, 1000);
//     }
//   };

//   const handleCompleteTask = async () => {
//     const source = axios.CancelToken.source();
//     if (!selectedTask.TaskId || selectedTask.Rewardpoints == null) {
//       return;
//     }

//     setIsCompletingTask(true);
//     try {
//       const updateTaskResponse = await postAPIHandler({
//         endPoint: "taskstatus",
//         dataToSend: {
//           Rewardpoints: selectedTask.Rewardpoints,
//           TaskId: selectedTask.TaskId,
//         },
//       });

//       if (updateTaskResponse.data.responseCode === 200) {
//         const updatedBalance = ticketBalance + selectedTask.Rewardpoints;
//         updateTicketBalance(updatedBalance);
//         toast.success("Reward claimed successfully!");
//         setIsPopupOpen(false);
//         // Re-fetch only tasks to update the UI
//         setIsCompletingTask(false);
//         await fetchTasks(source);
//       }
//     } catch (error) {
//       console.error("Error completing the task:", error);
//     } finally {
//       setIsCompletingTask(false);
//     }
//   };

//   const handleAdsTask = async (
//     taskId,
//     adSDK,
//     Rewardpoints,
//     AdTimer_InMinutes
//   ) => {
//     const source = axios.CancelToken.source();
//     if (isAdProcessing[taskId]) {
//       return; // Prevent multiple clicks during ad processing
//     }

//     if (adTimers[taskId] && adTimers[taskId] > 0) {
//       return; // Prevent click if the timer hasn't finished
//     }

//     setIsAdProcessing((prev) => ({ ...prev, [taskId]: true }));

//     const newEndTime = addMinutes(new Date(), AdTimer_InMinutes);

//     if (adSDK === "967150") {
//       setAdTaskData({
//         taskId,
//         adSDK,
//         Rewardpoints,
//         AdTimer_InMinutes,
//       });
//     }

//     // Helper to determine if a string is numeric (spot ID)
//     const isSpotId = (id) => /^\d+$/.test(id);

//     // Helper to check if a function exists on the global window
//     const isGlobalFunction = (name) => typeof window[name] === "function";

//     // Parse AdSDK to extract function name and arguments
//     const parseFunctionCall = (funcCall) => {
//       const functionRegex = /^(\w+)(?:\((.*)\))?$/;
//       const match = funcCall.match(functionRegex);
//       if (match) {
//         const funcName = match[1];
//         const argsString = match[2];
//         let args = [];

//         if (argsString) {
//           args = argsString
//             .match(/(?:'[^']*'|"[^"]*"|[^,]+)/g)
//             ?.map((arg) => arg.trim().replace(/^['"]|['"]$/g, ""));
//         }

//         return { funcName, args };
//       }
//       return { funcName: null, args: [] };
//     };

//     const { funcName, args } = parseFunctionCall(adSDK);

//     try {
//       if (adSDK === "285ad57415617f2ac500ef639987399bde88dcb2") {
//         showAdextraAd();
//       } else if (adSDK === "int-11988") {
//         showAdsgram();
//       } else if (adSDK === "adexium") {
//         if (!window.TGAdsWidget) {
//           console.error(
//             "TGAdsWidget not found on window! Script might not be loaded."
//           );
//           return;
//         }
//         if (!tgAdsInstance) {
//           //console.log("Creating new TGAdsWidget instance...");

//           const tgAds = new window.TGAdsWidget({
//             wid: "a6b80978-405a-4507-a7cc-5d18a2bd24d7",
//             adFormat: "interstitial",
//             // debug: true,
//             debug: false,
//             firstAdImpressionIntervalInSeconds: 0,
//             adImpressionIntervalInSeconds: 0,
//           });

//           tgAds.on("adDisplayed", () => console.log("Event: Ad displayed!"));
//           tgAds.on("adRedirected", () =>
//             console.log("Event: Ad clicked & redirected!")
//           );
//           tgAds.on("adPlaybackCompleted", () =>
//             console.log("Event: Ad playback completed!")
//           );
//           tgAds.on("adFailed", (error) =>
//             console.error("Event: Ad failed to play!", error)
//           );

//           tgAds.init();

//           //console.log("TGAdsWidget initialized and ad requested.");

//           setTgAdsInstance(tgAds);
//         } else {
//           //console.log(
//           //   "TGAdsWidget instance already exists. Calling init() again to show ad."
//           // );
//           tgAdsInstance.init();
//         }
//       } else if (adSDK === "arc8moderan") {
//         if (window.Sonar) {
//           window.Sonar.show({
//             adUnit: "arc8moderan",
//           })
//             .then((result) => {
//               //console.log("Ad result:", result);
//               if (result.status === "error") {
//                 console.error("Ad failed to show:", result.message);
//               } else {
//                 //console.log("Ad status:", result.status);
//               }
//             })
//             .catch((error) => {
//               console.error("Error in showing the ad:", error);
//             });
//         } else {
//           console.error("Sonar SDK is not available.");
//         }
//         // await window.Sonar.show({ adUnit: "arc8moderan" });
//       } else if (funcName && isGlobalFunction(funcName)) {
//         // Case 1: AdSDK is a global function
//         await window[funcName](...args);
//       } else if (isSpotId(funcName || adSDK)) {
//         // Case 2: AdSDK is a numeric spot ID
//         const spotId = funcName || adSDK;
//         const showAd = showAdFunctions.current[spotId];
//         if (showAd) {
//           await showAd();
//         } else {
//           return;
//         }
//       } else {
//         // Case 3: Invalid AdSDK format
//         return;
//       }

//       // Update backend with reward and next ad time
//       const response = await postAPIHandler({
//         endPoint: "adsRewards",
//         dataToSend: {
//           Rewardpoints,
//           AdId: taskId,
//           NextAd_Time: newEndTime,
//         },
//       });

//       //console.log("response", response);

//       if (
//         response &&
//         response.data.result &&
//         response.data.result.Rewardpoints
//       ) {
//         // Update ticket balance
//         updateTicketBalance((prevBalance) => {
//           const newBalance = prevBalance + Rewardpoints;
//           return newBalance;
//         });
//         toast.success("Ad viewed successfully!");
//       } else {
//         toast.error("Ads limit exceeded. Watch and claim tomorrow.");
//       }

//       // Re-fetch end times to update timers
//       await fetchAdEndTimes(source);
//     } catch (error) {
//       console.error(`Error handling AdSDK task for ${adSDK}:`);
//     } finally {
//       setIsAdProcessing((prev) => ({ ...prev, [taskId]: false }));
//     }
//   };

//   if (isLoading) {
//     return <PageLoading />;
//   }

//   return (
//     <div className={styles.container}>
//       {/* Progress Bar */}
//       <div className={styles.progressContainer}>
//         <div className={styles.progressText}>
//           <h2>Task Completion</h2>
//           <span>
//             {completedTasks}/{tasksLength} completed
//           </span>
//         </div>
//         <div className={styles.progressBarContainer}>
//           <div
//             className={styles.progressBar}
//             style={{
//               width: `${progress}%`,
//             }}
//             role="progressbar"
//             aria-valuenow={progress}
//             aria-valuemin="0"
//             aria-valuemax="100"
//           ></div>
//         </div>
//       </div>

//       {/* Ads Section */}
//       {adsTasks && adsTasks.length > 0 && (
//         <div className={MainRewards.containerWrapper}>
//           <div className={MainRewards.container}>
//             <div className={MainRewards.borderEffect}></div>
//             <div className={MainRewards.innerContent}>
//               <h1 className={MainRewards.title}>MAIN REWARDS</h1>
//               <div className={MainRewards.rewardsWrapper}>
//                 {adsTasks.map((adTask, index) => {
//                   const currentTimeLeft = adTimers[adTask._id] || 0;
//                   const isDisabled = currentTimeLeft > 0;

//                   return (
//                     <div
//                       key={adTask._id || index}
//                       className={`${MainRewards.rewardCard} ${
//                         isDisabled ? MainRewards.disabledCard : ""
//                       } ${
//                         isAdProcessing[adTask._id] ? MainRewards.clickedAd : ""
//                       }`}
//                       onClick={
//                         isDisabled || isAdProcessing[adTask._id]
//                           ? undefined // Disable click if currentTimeLeft > 0
//                           : () =>
//                               handleAdsTask(
//                                 adTask._id,
//                                 adTask.AdSDK,
//                                 adTask.Rewardpoints,
//                                 adTask.AdTimer_InMinutes
//                               )
//                       }
//                       style={{
//                         cursor:
//                           currentTimeLeft > 0 || isAdProcessing[adTask._id]
//                             ? "not-allowed"
//                             : "pointer", // Disable pointer if processing
//                         pointerEvents:
//                           currentTimeLeft > 0 || isAdProcessing[adTask._id]
//                             ? "none"
//                             : "auto", // Prevent clicking while processing
//                       }}
//                     >
//                       <div className={MainRewards.rewardContent}>
//                         <div className={MainRewards.leftSection}>
//                           <div className={MainRewards.iconWrapper}>
//                             <img
//                               src={adTask.AdImage}
//                               alt={adTask.AdName}
//                               className={MainRewards.telegramIcon}
//                             />
//                           </div>
//                           <div className={MainRewards.textWrapper}>
//                             <span className={MainRewards.watchText}>
//                               {adTask.AdName}
//                             </span>
//                             <div className={MainRewards.pointsWrapper}>
//                               <img
//                                 src="/images/4dec/Treasure Box2.png"
//                                 alt="Ticket"
//                                 className={MainRewards.ticketIcon}
//                               />
//                               <span className={MainRewards.points}>
//                                 {adTask.Rewardpoints}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className={MainRewards.rightSection}>
//                           {currentTimeLeft > 0 ? (
//                             <span className={MainRewards.timer}>
//                               {formatTime(currentTimeLeft)}
//                             </span>
//                           ) : (
//                             <span className={MainRewards.arrowIcon}>
//                               &#8250;
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {/* {adTaskData && <TelegramAds adTaskData={adTaskData} />} */}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs for tasks */}
//       <div className={styles.tabContainer}>
//         {tabs.map((tab, index) => (
//           <button
//             key={index}
//             className={`${styles.customTab} ${
//               activeTab === tab ? styles.active : ""
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             <span className={styles.tabContent}>{tab}</span>
//           </button>
//         ))}
//       </div>

//       {/* Task List */}
//       <div className={BasicTasks.containerWrapper}>
//         <div className={BasicTasks.container}>
//           <div className={BasicTasks.borderEffect}></div>
//           <div className={BasicTasks.innerContent}>
//             <h1 className={BasicTasks.title}>BASIC TASKS</h1>
//             <div className={BasicTasks.tasksWrapper}>
//               {(tasksFromApi[activeTab] || []).map((task) => (
//                 <div key={task.TaskId} className={BasicTasks.taskCard}>
//                   {/* Main Content Section */}
//                   <div className={BasicTasks.mainContent}>
//                     {/* Left Section: Avatar and Task Name */}
//                     <div className={BasicTasks.leftSection}>
//                       <div className={BasicTasks.avatarWrapper}>
//                         <img
//                           src={task.Siteimg}
//                           alt={task.Subtask}
//                           className={BasicTasks.avatar}
//                         />
//                       </div>
//                       <span className={BasicTasks.taskName}>
//                         {task.Subtask}
//                       </span>
//                     </div>

//                     {/* Button Section */}
//                     <button
//                       className={`${BasicTasks.goButton} ${
//                         task.Status === "COMPLETED"
//                           ? BasicTasks.completedButton
//                           : ""
//                       }`}
//                       onClick={() => handleRewardClick(task)}
//                       style={{
//                         cursor:
//                           task.Status === "COMPLETED"
//                             ? "not-allowed"
//                             : "pointer",
//                       }}
//                     >
//                       {task.Status === "COMPLETED" ? (
//                         <span className={BasicTasks.completedIcon}>✔</span>
//                       ) : (
//                         <>
//                           Go <span className={BasicTasks.arrow}>→</span>
//                         </>
//                       )}
//                     </button>
//                   </div>

//                   {/* Reward Section */}
//                   <div className={BasicTasks.rewardSection}>
//                     <span className={BasicTasks.rewardText}>Reward</span>
//                     <div className={BasicTasks.pointsWrapper}>
//                       <img
//                         src="/images/4dec/Treasure Box2.png"
//                         alt="Points"
//                         className={BasicTasks.ticketIcon}
//                       />
//                       <span className={BasicTasks.points}>
//                         {task.Rewardpoints.toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isPopupOpen && selectedTask && selectedTask.Status === "PENDING" && (
//         <div className={taskPopupStyles.popup}>
//           <div className={taskPopupStyles.popupContent}>
//             <button
//               className={taskPopupStyles.closeIcon}
//               onClick={() => setIsPopupOpen(false)}
//             >
//               <X size={24} />
//             </button>
//             <div className={taskPopupStyles.taskHeader}>
//               <div className={styles.taskIcon}>
//                 <img
//                   src={selectedTask.Siteimg}
//                   alt="Task"
//                   className={styles.TaskImage}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "contain",
//                   }}
//                 />
//               </div>
//               <h3>{selectedTask.Subtask}</h3>
//             </div>
//             <p className={taskPopupStyles.taskDescription}>
//               {selectedTask.Description}
//             </p>
//             <button
//               className={taskPopupStyles.completeButton}
//               onClick={handleCompleteTask}
//               disabled={isCompletingTask}
//             >
//               {isCompletingTask ? "Claiming..." : "Claim Reward"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useContext, useRef, useCallback } from "react";
import styles from "./tasks.module.css";
import taskPopupStyles from "./TaskPopup.module.css";
import MainRewards from "./MainRewards.module.css";
import BasicTasks from "./BasicTasks.module.css";
import { X, Loader } from "lucide-react";
import { getAPIHandler, postAPIHandler } from "@/ApiConfig/service";
import AppContext from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import PageLoading from "@/components/PageLoader";
import { useRouter } from "next/router";
import ReactGA from "react-ga";

const formatTime = (remainingTimeInSeconds) => {
  const hours = Math.floor(remainingTimeInSeconds / 3600);
  const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
  const seconds = remainingTimeInSeconds % 60;
  const formattedHours = hours > 0 ? String(hours).padStart(2, "0") : "";
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else if (minutes > 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedSeconds}`;
  }
};

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export default function TasksPage() {
  const router = useRouter();
  const { updateTicketBalance, ticketBalance, userData } =
    useContext(AppContext);

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tasksFromApi, setTasksFromApi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLength, setTasksLength] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [adsTasks, setAdsTasks] = useState([]);
  const [endTimes, setEndTimes] = useState([]);
  const [adTimers, setAdTimers] = useState({});

  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [adTaskData, setAdTaskData] = useState(null);
  const [tgAdsInstance, setTgAdsInstance] = useState(null);

  const [AdController, setAdController] = useState(null);
  const [adShown, setAdShown] = useState(false);

  const [isAdProcessing, setIsAdProcessing] = useState({});
  // State to track which ads are currently loading
  const [loadingAds, setLoadingAds] = useState({});
  // NEW: Store the next ad time for each ad to ensure smooth transition
  const [nextAdTimes, setNextAdTimes] = useState({});

  const showAdextraAd = () => {
    if (typeof window !== "undefined" && window.p_adextra) {
      console.log("Calling p_adextra...");
      window.setTimeout(() => {
        window.p_adextra();
      });
    } else {
      console.error("AdExtra SDK is not loaded yet.");
    }
  };

  // Google Analytics Page View Tracking
  useEffect(() => {
    ReactGA.initialize("G-Q6EKQ53YY4");
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [router.asPath]);

  // Initialize Adsgram SDK on component mount
  useEffect(() => {
    if (window && window.Adsgram) {
      const controller = window.Adsgram.init({ blockId: "int-11986" });
      setAdController(controller);
    }
  }, []);

  const showAdsgram = useCallback(() => {
    if (AdController) {
      AdController.show()
        .then((result) => {
          if (result.done) {
            // Ad watched till the end or closed in interstitial format
          }
        })
        .catch((result) => {
          // Handle any errors that occurred during the ad display
        });
    }
  }, [AdController]);

  // Ref to store show functions for spot IDs
  const showAdFunctions = useRef({});

  // Initialize show functions for spot ID-type AdSDKs
  useEffect(() => {
    const initializeShowFunctions = async () => {
      const spotAds = adsTasks.filter((ad) => /^\d+$/.test(ad.AdSDK));
      await Promise.all(
        spotAds.map(async (ad) => {
          try {
            const show = await window.initCdTma?.({ id: ad.AdSDK });
            if (show) {
              showAdFunctions.current[ad.AdSDK] = show;
            }
          } catch (error) {
            console.error(`Error initializing ad with AdSDK ${ad.AdSDK}:`);
          }
        })
      );
    };

    if (adsTasks.length > 0) {
      initializeShowFunctions();
    }
  }, [adsTasks]);

  // tasks progress
  useEffect(() => {
    if (tasksLength === 0) {
      setProgress(0);
      return;
    }
    const percentage = Math.min(
      (completedTasks / tasksLength) * 100,
      100
    ).toFixed(2);
    setProgress(percentage);
  }, [completedTasks, tasksLength]);

  // To fetch tasks
  const fetchTasks = async (source) => {
    try {
      const res = await getAPIHandler({
        endPoint: "getuserTask",
        source: source,
      });

      if (res && res.data?.responseCode === 200) {
        const uniqueTaskNames = [
          ...new Set(res.data.result.map((task) => task.TaskName)),
        ];
        setTabs(uniqueTaskNames);

        setActiveTab((prevActiveTab) => {
          if (uniqueTaskNames.includes(prevActiveTab)) {
            return prevActiveTab;
          } else {
            return uniqueTaskNames[0] || "";
          }
        });

        const userTasks = res.data.result.map((task) => ({
          TaskId: task.TaskId,
          TaskName: task.TaskName,
          Subtask: task.Subtask,
          Description: task.Description,
          Sitelink: task.Sitelink,
          Rewardpoints: Number(task.Rewardpoints),
          Siteimg: task.Siteimg,
          Status: task.Status,
          TaskImage: task.TaskImage,
        }));

        setTasksLength(userTasks.length);

        const groupedTasks = userTasks.reduce((acc, task) => {
          if (!acc[task.TaskName]) {
            acc[task.TaskName] = [];
          }
          acc[task.TaskName].push(task);
          return acc;
        }, {});
        setTasksFromApi(groupedTasks);

        const completedCount = userTasks.filter(
          (task) => task.Status === "COMPLETED"
        ).length;
        setCompletedTasks(completedCount);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully
      } else {
        console.error("Error fetching category game data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // To fetch ads
  const fetchAds = async (source) => {
    try {
      const res = await getAPIHandler({ endPoint: "getAds", source: source });

      if (res && res.data?.responseCode === 200) {
        const activeAds = res.data.result.filter(
          (ads) => ads.Status === "ACTIVE"
        );
        setAdsTasks(activeAds);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully
      } else {
        console.error("Error fetching category game data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // To fetch ad end times
  const fetchAdEndTimes = async (source) => {
    try {
      const res = await getAPIHandler({
        endPoint: "adsEndTime",
        source: source,
      });

      if (res && res.data?.responseCode === 200) {
        setEndTimes(res.data.result || []);

        // NEW: Store next ad times for smooth transition
        const nextTimes = {};
        res.data.result.forEach((ad) => {
          if (ad.adNextEndTime) {
            nextTimes[ad.adId] = new Date(ad.adNextEndTime).getTime();
          }
        });
        setNextAdTimes((prev) => ({ ...prev, ...nextTimes }));
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle the cancellation gracefully
      } else {
        console.error("Error fetching category game data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchTasks(source);
    return () => {
      source.cancel();
    };
  }, []);

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchAdEndTimes(source);
    return () => {
      source.cancel();
    };
  }, []);

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchAds(source);
    return () => {
      source.cancel();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!endTimes || endTimes.length === 0) return;

      const now = new Date().getTime();
      const updatedAdTimers = {};

      endTimes.forEach((ad) => {
        const { adId, adNextEndTime } = ad;
        if (!adNextEndTime) {
          updatedAdTimers[adId] = 0;
          return;
        }
        const endTimeMs = new Date(adNextEndTime).getTime();
        const diffInSeconds = Math.floor((endTimeMs - now) / 1000);
        updatedAdTimers[adId] = diffInSeconds > 0 ? diffInSeconds : 0;
      });

      setAdTimers(updatedAdTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTimes]);

  const handleRewardClick = (task) => {
    if (task.Status === "COMPLETED") {
      toast.error("Task already completed!");
      return;
    }

    if (task.Status === "PENDING" && task.Sitelink) {
      const newTab = window.open(
        task.Sitelink,
        "_blank",
        "noopener,noreferrer"
      );

      if (newTab) {
        newTab.focus();
      }

      setSelectedTask(task);
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 1000);
    }
  };

  const handleCompleteTask = async () => {
    const source = axios.CancelToken.source();
    if (!selectedTask.TaskId || selectedTask.Rewardpoints == null) {
      return;
    }

    setIsCompletingTask(true);
    try {
      const updateTaskResponse = await postAPIHandler({
        endPoint: "taskstatus",
        dataToSend: {
          Rewardpoints: selectedTask.Rewardpoints,
          TaskId: selectedTask.TaskId,
        },
      });

      if (updateTaskResponse.data.responseCode === 200) {
        const updatedBalance = ticketBalance + selectedTask.Rewardpoints;
        updateTicketBalance(updatedBalance);
        toast.success("Reward claimed successfully!");
        setIsPopupOpen(false);
        setIsCompletingTask(false);
        await fetchTasks(source);
      }
    } catch (error) {
      console.error("Error completing the task:", error);
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleAdsTask = async (
    taskId,
    adSDK,
    Rewardpoints,
    AdTimer_InMinutes
  ) => {
    const source = axios.CancelToken.source();

    // Check if already loading or timer is active
    if (loadingAds[taskId] || (adTimers[taskId] && adTimers[taskId] > 0)) {
      return;
    }

    // Set loading state immediately
    setLoadingAds((prev) => ({ ...prev, [taskId]: true }));
    setIsAdProcessing((prev) => ({ ...prev, [taskId]: true }));

    const newEndTime = addMinutes(new Date(), AdTimer_InMinutes);

    if (adSDK === "967150") {
      setAdTaskData({
        taskId,
        adSDK,
        Rewardpoints,
        AdTimer_InMinutes,
      });
    }

    // Helper to determine if a string is numeric (spot ID)
    const isSpotId = (id) => /^\d+$/.test(id);

    // Helper to check if a function exists on the global window
    const isGlobalFunction = (name) => typeof window[name] === "function";

    // Parse AdSDK to extract function name and arguments
    const parseFunctionCall = (funcCall) => {
      const functionRegex = /^(\w+)(?:\((.*)\))?$/;
      const match = funcCall.match(functionRegex);
      if (match) {
        const funcName = match[1];
        const argsString = match[2];
        let args = [];

        if (argsString) {
          args = argsString
            .match(/(?:'[^']*'|"[^"]*"|[^,]+)/g)
            ?.map((arg) => arg.trim().replace(/^['"]|['"]$/g, ""));
        }

        return { funcName, args };
      }
      return { funcName: null, args: [] };
    };

    const { funcName, args } = parseFunctionCall(adSDK);

    try {
      if (adSDK === "285ad57415617f2ac500ef639987399bde88dcb2") {
        showAdextraAd();
      } else if (adSDK === "int-11988") {
        showAdsgram();
      } else if (adSDK === "adexium") {
        if (!window.TGAdsWidget) {
          console.error(
            "TGAdsWidget not found on window! Script might not be loaded."
          );
          return;
        }
        if (!tgAdsInstance) {
          const tgAds = new window.TGAdsWidget({
            wid: "a6b80978-405a-4507-a7cc-5d18a2bd24d7",
            adFormat: "interstitial",
            debug: false,
            firstAdImpressionIntervalInSeconds: 0,
            adImpressionIntervalInSeconds: 0,
          });

          tgAds.on("adDisplayed", () => console.log("Event: Ad displayed!"));
          tgAds.on("adRedirected", () =>
            console.log("Event: Ad clicked & redirected!")
          );
          tgAds.on("adPlaybackCompleted", () =>
            console.log("Event: Ad playback completed!")
          );
          tgAds.on("adFailed", (error) =>
            console.error("Event: Ad failed to play!", error)
          );

          tgAds.init();
          setTgAdsInstance(tgAds);
        } else {
          tgAdsInstance.init();
        }
      } else if (adSDK === "arc8moderan") {
        if (window.Sonar) {
          window.Sonar.show({
            adUnit: "arc8moderan",
          })
            .then((result) => {
              if (result.status === "error") {
                console.error("Ad failed to show:", result.message);
              }
            })
            .catch((error) => {
              console.error("Error in showing the ad:", error);
            });
        } else {
          console.error("Sonar SDK is not available.");
        }
      } else if (adSDK === "show_10087360()") {
        if (window.show_10087360) {
          window.show_10087360();
        } else {
          console.error("show_10087360 function is not available.");
        }
      } else if (adSDK === "show_10087360('pop')") {
        if (window.show_10087360) {
          window.show_10087360('pop');
        } else {
          console.error("show_10087360 function is not available.");
        }
      } else if (funcName && isGlobalFunction(funcName)) {
        await window[funcName](...args);
      } else if (isSpotId(funcName || adSDK)) {
        const spotId = funcName || adSDK;
        const showAd = showAdFunctions.current[spotId];
        if (showAd) {
          await showAd();
        } else {
          return;
        }
      } else {
        return;
      }

      // Update backend with reward and next ad time
      const response = await postAPIHandler({
        endPoint: "adsRewards",
        dataToSend: {
          Rewardpoints,
          AdId: taskId,
          NextAd_Time: newEndTime,
        },
      });

      if (
        response &&
        response.data.result &&
        response.data.result.Rewardpoints
      ) {
        updateTicketBalance((prevBalance) => {
          const newBalance = prevBalance + Rewardpoints;
          return newBalance;
        });
        toast.success("Ad viewed successfully!");

        // NEW: Set the next ad time immediately for smooth transition
        setNextAdTimes((prev) => ({
          ...prev,
          [taskId]: newEndTime.getTime(),
        }));
      } else {
        toast.error("Ads limit exceeded. Watch and claim tomorrow.");
      }

      // Re-fetch end times to update timers
      await fetchAdEndTimes(source);
    } catch (error) {
      console.error(`Error handling AdSDK task for ${adSDK}:`);
    } finally {
      // Clear loading state when done
      setLoadingAds((prev) => {
        const newLoading = { ...prev };
        delete newLoading[taskId];
        return newLoading;
      });
      setIsAdProcessing((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressText}>
          <h2>Task Completion</h2>
          <span>
            {completedTasks}/{tasksLength} completed
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{
              width: `${progress}%`,
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Ads Section */}
      {adsTasks && adsTasks.length > 0 && (
        <div className={MainRewards.containerWrapper}>
          <div className={MainRewards.container}>
            <div className={MainRewards.borderEffect}></div>
            <div className={MainRewards.innerContent}>
              <h1 className={MainRewards.title}>MAIN REWARDS</h1>
              <div className={MainRewards.rewardsWrapper}>
                {adsTasks.map((adTask, index) => {
                  const apiTimeLeft = adTimers[adTask._id] || 0;
                  const isLoadingAd = loadingAds[adTask._id];

                  // NEW: Calculate time left from nextAdTimes for smooth transition
                  const nextAdTime = nextAdTimes[adTask._id];
                  let calculatedTimeLeft = 0;

                  if (nextAdTime) {
                    const now = new Date().getTime();
                    calculatedTimeLeft = Math.floor((nextAdTime - now) / 1000);
                    calculatedTimeLeft =
                      calculatedTimeLeft > 0 ? calculatedTimeLeft : 0;
                  }

                  // Use calculated time if API timer hasn't updated yet
                  const currentTimeLeft =
                    apiTimeLeft > 0 ? apiTimeLeft : calculatedTimeLeft;
                  const isDisabled = currentTimeLeft > 0 || isLoadingAd;

                  return (
                    <div
                      key={adTask._id || index}
                      className={`${MainRewards.rewardCard} ${
                        isDisabled ? MainRewards.disabledCard : ""
                      } ${
                        isAdProcessing[adTask._id] ? MainRewards.clickedAd : ""
                      }`}
                      onClick={
                        isDisabled
                          ? undefined
                          : () =>
                              handleAdsTask(
                                adTask._id,
                                adTask.AdSDK,
                                adTask.Rewardpoints,
                                adTask.AdTimer_InMinutes
                              )
                      }
                      style={{
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        pointerEvents: isDisabled ? "none" : "auto",
                      }}
                    >
                      <div className={MainRewards.rewardContent}>
                        <div className={MainRewards.leftSection}>
                          <div className={MainRewards.iconWrapper}>
                            <img
                              src={adTask.AdImage}
                              alt={adTask.AdName}
                              className={MainRewards.telegramIcon}
                            />
                          </div>
                          <div className={MainRewards.textWrapper}>
                            <span className={MainRewards.watchText}>
                              {adTask.AdName}
                            </span>
                            <div className={MainRewards.pointsWrapper}>
                              <img
                                src="/images/4dec/Treasure Box2.png"
                                alt="Ticket"
                                className={MainRewards.ticketIcon}
                              />
                              <span className={MainRewards.points}>
                                {adTask.Rewardpoints}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={MainRewards.rightSection}>
                          {isLoadingAd ? (
                            <Loader className={MainRewards.loader} size={16} />
                          ) : currentTimeLeft > 0 ? (
                            <span className={MainRewards.timer}>
                              {formatTime(currentTimeLeft)}
                            </span>
                          ) : (
                            <span className={MainRewards.arrowIcon}>
                              &#8250;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for tasks */}
      <div className={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.customTab} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className={styles.tabContent}>{tab}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className={BasicTasks.containerWrapper}>
        <div className={BasicTasks.container}>
          <div className={BasicTasks.borderEffect}></div>
          <div className={BasicTasks.innerContent}>
            <h1 className={BasicTasks.title}>BASIC TASKS</h1>
            <div className={BasicTasks.tasksWrapper}>
              {(tasksFromApi[activeTab] || []).map((task) => (
                <div key={task.TaskId} className={BasicTasks.taskCard}>
                  <div className={BasicTasks.mainContent}>
                    <div className={BasicTasks.leftSection}>
                      <div className={BasicTasks.avatarWrapper}>
                        <img
                          src={task.Siteimg}
                          alt={task.Subtask}
                          className={BasicTasks.avatar}
                        />
                      </div>
                      <span className={BasicTasks.taskName}>
                        {task.Subtask}
                      </span>
                    </div>

                    <button
                      className={`${BasicTasks.goButton} ${
                        task.Status === "COMPLETED"
                          ? BasicTasks.completedButton
                          : ""
                      }`}
                      onClick={() => handleRewardClick(task)}
                      style={{
                        cursor:
                          task.Status === "COMPLETED"
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {task.Status === "COMPLETED" ? (
                        <span className={BasicTasks.completedIcon}>✔</span>
                      ) : (
                        <>
                          Go <span className={BasicTasks.arrow}>→</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className={BasicTasks.rewardSection}>
                    <span className={BasicTasks.rewardText}>Reward</span>
                    <div className={BasicTasks.pointsWrapper}>
                      <img
                        src="/images/4dec/Treasure Box2.png"
                        alt="Points"
                        className={BasicTasks.ticketIcon}
                      />
                      <span className={BasicTasks.points}>
                        {task.Rewardpoints.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && selectedTask && selectedTask.Status === "PENDING" && (
        <div className={taskPopupStyles.popup}>
          <div className={taskPopupStyles.popupContent}>
            <button
              className={taskPopupStyles.closeIcon}
              onClick={() => setIsPopupOpen(false)}
            >
              <X size={24} />
            </button>
            <div className={taskPopupStyles.taskHeader}>
              <div className={styles.taskIcon}>
                <img
                  src={selectedTask.Siteimg}
                  alt="Task"
                  className={styles.TaskImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <h3>{selectedTask.Subtask}</h3>
            </div>
            <p className={taskPopupStyles.taskDescription}>
              {selectedTask.Description}
            </p>
            <button
              className={taskPopupStyles.completeButton}
              onClick={handleCompleteTask}
              disabled={isCompletingTask}
            >
              {isCompletingTask ? "Claiming..." : "Claim Reward"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
