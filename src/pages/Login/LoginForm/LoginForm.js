import React, { useRef, useState } from "react";
import classes from "./LoginForm.module.css";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import CustomModal from "../../../components/CustomModal/CustomModal";
import Loader from "../../../components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
  const auth = getAuth();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef();
  const emailRef = useRef();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  // STATE TO STORE DATA FETCHED FROM FIRESTORE DATABASE
  const [userDetails, setUserDetails] = useState({});

  // SHOW / HIDE PASSWORD
  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  // VALIDATION CHECK
  function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }
  function isValidPassword(password) {
    return password.length >= 8;
  }

  // HANDLE ERRORS
  function handleEmailBlur() {
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
    }
  }
  function handlePasswordBlur() {
    if (loginData.password === "") {
      setPasswordError("Please enter your password.");
    } else if (!isValidPassword(loginData.password)) {
      setPasswordError(
        "Please enter your password containing min 8 characters."
      );
    }
  }

  // HANDLE INPUT
  function handleEmailInput(e) {
    let value = e.target.value;
    setLoginData((prev) => ({ ...prev, email: value }));
    setEmailError("");
    setFormError("");
    setNotification("");
  }
  function handlePasswordInput(e) {
    let value = e.target.value;
    setLoginData((prev) => ({ ...prev, password: value }));
    setPasswordError("");
    setFormError("");
    setNotification("");
  }

  // FOCUS ON CLICK
  function focusEmail() {
    emailRef.current.focus();
  }

  function focusPassword() {
    passwordRef.current.focus();
  }

  // FORGOT PASSWORD
  async function forgotPassword() {
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
      return;
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      try {
        await sendPasswordResetEmail(auth, loginData.email);
        setNotification(
          "A password reset email has been sent to your email address. Please reset your password and then log in."
        );
      } catch (e) {
        setFormError(e.message);
      }
    }
  }

  // HANDLE SUBMIT EMAIL AND PASSWORD
  async function handleSubmit(e) {
    e.preventDefault();
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
      return;
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else if (loginData.password === "") {
      setPasswordError("Please enter your password.");
      return;
    } else if (!isValidPassword(loginData.password)) {
      setPasswordError(
        "Please enter your password containing min 8 characters."
      );
      return;
    } else {
      try {
        setLoading(true);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
        );

        const userId = userCredential.user.uid;
        const docRef = doc(db, "userList", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          setFormError(
            "You currently don't have an account. Please register to proceed."
          );
        }
      } catch (e) {
        setFormError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <div className={classes.fieldsContainer}>
        {/* EMAIL INPUT */}
        <div>
          <label>Email*</label>
          <div
            onClick={focusEmail}
            onBlur={handleEmailBlur}
            style={{ borderColor: emailError !== "" ? "red" : "white" }}
            className={classes.fieldContainer}
          >
            <input
              style={{ borderColor: emailError !== "" ? "red" : "white" }}
              onChange={handleEmailInput}
              placeholder="mail@website.com"
              ref={emailRef}
            />
          </div>
          {emailError !== "" && (
            <div className={classes.error}>{emailError}</div>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <label>Password*</label>
          <div
            onClick={focusPassword}
            onBlur={handlePasswordBlur}
            style={{ borderColor: passwordError !== "" ? "red" : "white" }}
            className={classes.fieldContainer}
          >
            <input
              onChange={handlePasswordInput}
              placeholder="Min. 8 characters"
              type={showPassword ? "text" : "password"}
              ref={passwordRef}
            />
            {showPassword ? (
              <FontAwesomeIcon
                icon={faEyeSlash}
                onClick={toggleShowPassword}
                className={classes.eyeLogo}
              />
            ) : (
              <FontAwesomeIcon
                icon={faEye}
                onClick={toggleShowPassword}
                className={classes.eyeLogo}
              />
            )}
          </div>
          {passwordError !== "" && (
            <div className={classes.error}>{passwordError}</div>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD */}
      <div className={classes.forgotPasswordContainer}>
        <button
          onClick={forgotPassword}
          type="button"
          className={classes.forgotPassword}
        >
          Forgot Password?
        </button>
      </div>
      {/* NOTIFICATION */}
      {notification !== "" && (
        <div className={classes.notification}>{notification}</div>
      )}
      {/* SUBMIT BUTTON */}
      <button type="submit" className={classes.actionButton}>
        Login
      </button>

      {/* FORM ERROR */}
      {formError !== "" && <div className={classes.error}>{formError}</div>}

      {/* LOADER */}
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
    </form>
  );
}
