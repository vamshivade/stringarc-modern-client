"use client";

import React, { useContext, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Formik, Form, Field } from "formik";
import { putAPIHandler } from "@/ApiConfig/service";
import AppContext from "@/context/AppContext";
import toast from "react-hot-toast";

export default function UserNameUpdate({ isOpen, onClose, onSave, userData }) {
  const auth = useContext(AppContext);

  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  // Regular expression to match valid usernames
  const usernameRegex = /^[A-Za-z]+$/; // Only alphabetic characters allowed (no numbers, spaces, or special characters)

  // Handle Form Submission
  const handleSubmit = async (values) => {
    if (!usernameRegex.test(values.userName)) {
      toast.error("Only alphabetic characters allowed");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await putAPIHandler({
        endPoint: "editProfile",
        dataToSend: {
          userName: values.userName,
        },
      });

      if (response && response.data?.responseCode === 200) {
        auth.getProfileDataApi(); // Refresh user data
        toast.success("Username updated successfully!");
        onSave(values.userName); // Notify parent component
        onClose(); // Close the popup
      } else {
        toast.error(response.data.responseMessage);
      }
    } catch (error) {
      console.error("Error updating username:");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
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
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "44%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "400px",
          borderRadius: "20px",
          border: "1px solid rgb(71, 71, 71)",
          backgroundColor: "rgb(0, 0, 0)",
          padding: "20px",
          textAlign: "center",
          zIndex: 1000,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: "white" }}>Edit Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <Formik
          initialValues={{
            userName: userData?.userName || "",
          }}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleBlur }) => (
            <Form>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label
                  htmlFor="userName"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#888",
                    fontSize: "14px",
                  }}
                >
                  Username
                </label>
                <Field
                  type="text"
                  id="userName"
                  name="userName"
                  placeholder="Enter Username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    outline: "none",
                    boxSizing: "border-box",
                    backdropFilter: "blur(10px)",
                    fontSize: "16px",
                  }}
                  required
                  disabled={isUpdating}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: "48%",
                    padding: "4px",
                    border: "1px solid #FFFF00",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    opacity: isUpdating ? 0.6 : 1,
                    pointerEvents: isUpdating ? "none" : "auto",
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    width: "48%",
                    padding: "4px",
                    border: "1px solid #FFFF00",
                    borderRadius: "10px",
                    background: "#FF4081",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    opacity: isUpdating ? 0.6 : 1,
                    pointerEvents: isUpdating ? "none" : "auto",
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
