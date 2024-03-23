import React, { useRef, useState } from "react";
import classes from "./RegisterForm.module.css";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import CustomModal from "../../../components/CustomModal/CustomModal";
import Loader from "../../../components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function RegisterForm() {
  const auth = getAuth();
  const storage = getStorage();
  const [registerData, setRegisterData] = useState({
    image: null,
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ERRORS AND SHOWING DATA
  const [errors, setErrors] = useState({
    formError: "",
    imageError: "",
    userNameError: "",
    emailError: "",
    phoneError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // REF
  const imageRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  // LOADING
  const [loading, setLoading] = useState(false);

  // STATE TO STORE DATA FETCHED FROM FIRESTORE DATABASE
  const [userDetails, setUserDetails] = useState({});

  // SHOW / HIDE PASSWORD
  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }
  function toggleShowConfirmPassword() {
    setShowConfirmPassword((prev) => !prev);
  }

  // VALIDATION CHECK
  function isValidUsername(username) {
    const regex = /\d/;
    return !regex.test(username);
  }
  function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }
  function isValidPassword(password) {
    return password.length >= 8;
  }

  // HANDLE ERRORS
  function handleImageBlur() {
    if (!registerData.image) {
      setErrors((prev) => ({
        ...prev,
        imageError: "Please select an image.",
      }));
    }
  }
  function handleUserNameBlur() {
    if (registerData.userName === "") {
      setErrors((prev) => ({
        ...prev,
        userNameError: "Please enter your name.",
      }));
    } else if (!isValidUsername(registerData.userName)) {
      setErrors((prev) => ({
        ...prev,
        userNameError: "Please enter valid name i.e. without numbers.",
      }));
    }
  }
  function handleEmailBlur() {
    if (registerData.email === "") {
      setErrors((prev) => ({
        ...prev,
        emailError: "Please enter your email address.",
      }));
    } else if (!isValidEmail(registerData.email)) {
      setErrors((prev) => ({
        ...prev,
        emailError: "Please enter a valid email address.",
      }));
    }
  }
  function handlePasswordBlur() {
    if (registerData.password === "") {
      setErrors((prev) => ({
        ...prev,
        passwordError: "Please enter your password.",
      }));
    } else if (!isValidPassword(registerData.password)) {
      setErrors((prev) => ({
        ...prev,
        passwordError:
          "Please enter your password containing min 8 characters.",
      }));
    }
  }
  function handleConfirmPasswordBlur() {
    if (registerData.confirmPassword === "") {
      setErrors((prev) => ({
        ...prev,
        confirmPasswordError: "Please re-enter your password.",
      }));
    } else if (registerData.confirmPassword !== registerData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPasswordError: "Both passwords do not match. Please recheck.",
      }));
    }
  }

  // HANDLE INPUT IMAGE
  function imageUploadHandler(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegisterData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    e.currentTarget.classList.add("dragOver");
  }
  function handleDragLeave() {
    setIsDragOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("dragOver");

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegisterData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }
  // HANDLE INPUTS TEXT
  function handleUserNameInput(e) {
    let value = e.target.value;
    setRegisterData((prev) => ({ ...prev, userName: value }));
    setErrors((prev) => ({ ...prev, userNameError: "" }));
    setErrors((prev) => ({ ...prev, formError: "" }));
    setNotification("");
  }
  function handleEmailInput(e) {
    let value = e.target.value;
    setRegisterData((prev) => ({ ...prev, email: value }));
    setErrors((prev) => ({ ...prev, emailError: "" }));
    setErrors((prev) => ({ ...prev, formError: "" }));
    setNotification("");
  }
  function handlePasswordInput(e) {
    let value = e.target.value;
    setRegisterData((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({ ...prev, passwordError: "" }));
    setErrors((prev) => ({ ...prev, formError: "" }));
    setNotification("");
  }
  function handleConfirmPasswordInput(e) {
    let value = e.target.value;
    setRegisterData((prev) => ({ ...prev, confirmPassword: value }));
    setErrors((prev) => ({ ...prev, confirmPasswordError: "" }));
    setErrors((prev) => ({ ...prev, formError: "" }));
    setNotification("");
  }

  // FOCUS ON CLICK
  function focusImage() {
      imageRef.current.click();
  }

  function focusUserName() {
    userNameRef.current.focus();
  }

  function focusEmail() {
    emailRef.current.focus();
  }

  function focusPassword() {
    passwordRef.current.focus();
  }

  function focusConfirmPassword() {
    confirmPasswordRef.current.focus();
  }

  // HANDLE SUBMIT EMAIL AND PASSWORD
  async function handleSubmit(e) {
    e.preventDefault();
    if (!registerData.image) {
      setErrors((prev) => ({
        ...prev,
        imageError: "Please select an image.",
      }));
      return;
    } else if (registerData.userName === "") {
      setErrors((prev) => ({
        ...prev,
        userNameError: "Please enter your name.",
      }));
      return;
    } else if (registerData.email === "") {
      setErrors((prev) => ({
        ...prev,
        emailError: "Please enter your email address.",
      }));
      return;
    } else if (!isValidEmail(registerData.email)) {
      setErrors((prev) => ({
        ...prev,
        emailError: "Please enter a valid email address",
      }));
      return;
    } else if (registerData.password === "") {
      setErrors((prev) => ({
        ...prev,
        passwordError: "Please enter your password.",
      }));
      return;
    } else if (!isValidPassword(registerData.password)) {
      setErrors((prev) => ({
        ...prev,
        passwordError:
          "Please enter your password containing min 8 characters.",
      }));
      return;
    } else if (registerData.confirmPassword === "") {
      setErrors((prev) => ({
        ...prev,
        confirmPasswordError: "Please re-enter your password.",
      }));
      return;
    } else if (registerData.password !== registerData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPasswordError: "Both passwords do not match. Please recheck.",
      }));
      return;
    } else {
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          registerData.email,
          registerData.password
        );
        const userId = userCredential.user.uid;
        const docRef = doc(db, "userList", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          const imageRef = ref(storage, `profile_pictures/${userId}`);
          await uploadBytes(imageRef, registerData.image);
          const imageUrl = await getDownloadURL(imageRef);
          const userData={
            userId,
            userName: registerData.userName,
            email: registerData.email,
            type: "user",
            image: imageUrl,
          }
          const userDocRef = doc(db, "userList", userId);
          await setDoc(userDocRef, userData);
          setUserDetails(userData);
        }
      } catch (e) {
        setErrors((prev) => ({ ...prev, formError: e.message }));
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <div className={classes.fieldsContainer}>
        {/* IMAGE */}
        <div>
        <div
          onBlur={handleImageBlur}
          onClick={focusImage}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={classes.chooseImage}
          style={isDragOver ? {background: 'rgba(255, 255, 255, 0.2)'} : { borderColor: errors.imageError !== "" ? "red" : "white" }}
        >
          {registerData.image ? (
            <div className={classes.imageSection}>
            <img src={registerData.image} alt="" width={"100%"} />
          </div>
          ) : (
            <div  className={classes.textSection}>
              <FontAwesomeIcon
                className={classes.chooseImageIcon}
                icon={faImage}
              />
              <label>Click to upload image or drag and drop here</label>
              
            </div>
          )}
          <input
                ref={imageRef}
                type="file"
                id="imageUpload"
                accept=".png,.jpg,.jpeg"
                onChange={imageUploadHandler}
              />
        </div>
        {errors.imageError !== "" && (
            <div className={classes.error}>{errors.imageError}</div>
          )}
        </div>

        {/* USERNAME */}
        <div>
          <label>Name*</label>
          <div
            onClick={focusUserName}
            onBlur={handleUserNameBlur}
            style={{
              borderColor: errors.userNameError !== "" ? "red" : "white",
            }}
            className={classes.fieldContainer}
          >
            <input
              style={{
                borderColor: errors.userNameError !== "" ? "red" : "white",
              }}
              onChange={handleUserNameInput}
              placeholder="John Doe"
              ref={userNameRef}
              value={registerData.userName}
            />
          </div>
          {errors.userNameError !== "" && (
            <div className={classes.error}>{errors.userNameError}</div>
          )}
        </div>

        {/* EMAIL INPUT */}
        <div>
          <label>Email*</label>
          <div
            onClick={focusEmail}
            onBlur={handleEmailBlur}
            style={{ borderColor: errors.emailError !== "" ? "red" : "white" }}
            className={classes.fieldContainer}
          >
            <input
              style={{
                borderColor: errors.emailError !== "" ? "red" : "white",
              }}
              onChange={handleEmailInput}
              placeholder="mail@website.com"
              ref={emailRef}
              value={registerData.email}
            />
          </div>
          {errors.emailError !== "" && (
            <div className={classes.error}>{errors.emailError}</div>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <label>Password*</label>
          <div
            onClick={focusPassword}
            onBlur={handlePasswordBlur}
            style={{
              borderColor: errors.passwordError !== "" ? "red" : "white",
            }}
            className={classes.fieldContainer}
          >
            <input
              onChange={handlePasswordInput}
              placeholder="Min. 8 characters"
              type={showPassword ? "text" : "password"}
              ref={passwordRef}
              value={registerData.password}
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
          {errors.passwordError !== "" && (
            <div className={classes.error}>{errors.passwordError}</div>
          )}
        </div>

        {/* CONFIRM PASSWORD INPUT */}
        <div>
          <label>Confirm Password*</label>
          <div
            onClick={focusConfirmPassword}
            onBlur={handleConfirmPasswordBlur}
            style={{
              borderColor: errors.confirmPasswordError !== "" ? "red" : "white",
            }}
            className={classes.fieldContainer}
          >
            <input
              onChange={handleConfirmPasswordInput}
              placeholder="Re-enter your password"
              type={showConfirmPassword ? "text" : "password"}
              ref={confirmPasswordRef}
              value={registerData.confirmPassword}
            />
            {showConfirmPassword ? (
              <FontAwesomeIcon
                icon={faEyeSlash}
                onClick={toggleShowConfirmPassword}
                className={classes.eyeLogo}
              />
            ) : (
              <FontAwesomeIcon
                icon={faEye}
                onClick={toggleShowConfirmPassword}
                className={classes.eyeLogo}
              />
            )}
          </div>
          {errors.confirmPasswordError !== "" && (
            <div className={classes.error}>{errors.confirmPasswordError}</div>
          )}
        </div>
      </div>

      {/* NOTIFICATION */}
      {notification !== "" && (
        <div className={classes.notification}>{notification}</div>
      )}
      {/* SUBMIT BUTTON */}
      <button type="submit" className={classes.actionButton}>
        Register
      </button>

      {/* FORM ERROR */}
      {errors.formError !== "" && (
        <div className={classes.error}>{errors.formError}</div>
      )}

      {/* LOADER */}
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
    </form>
  );
}
