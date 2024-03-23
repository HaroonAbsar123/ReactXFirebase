import React, { useState } from "react";
import classes from "./Login.module.css";
import googleLogo from "../../assets/Login/google.png";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import CustomModal from "../../components/CustomModal/CustomModal";
import Loader from "../../components/Loader/Loader";
import LoginForm from "./LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const auth = getAuth();
  const navigate=useNavigate();

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // STATE TO STORE DATA FETCHED FROM FIRESTORE DATABASE
  const [userDetails, setUserDetails] = useState({});

  // SIGN IN WITH GOOGLE
  async function loginWithGoogle(){
    try{
    setLoading(true);
    const userCredential = await signInWithPopup(auth, provider);
    const userId = userCredential.user.uid;
    const docRef = doc(db, "userList", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          const userData={
            userId,
            userName: userCredential.user.displayName,
            email: userCredential.user.email,
            type: "user",
            image: userCredential.user.photoURL,
          }
          const userDocRef = doc(db, "userList", userId);
          await setDoc(userDocRef, userData);
          setUserDetails(userData);
        }
    } catch(e){
      setFormError(e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className={classes.container}>
      <div className={classes.innerContainer}>
        {/* FORM CONTAINER */}
        <div className={classes.formContainer}>
        <div className={classes.loginContainer}>

            {/* TOP HEADINGS */}
            <div className={classes.formHeading}>Login</div>
            <div className={classes.formDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
            
            {/* LOGIN WITH GOOGLE */}
            <button onClick={loginWithGoogle} type="button" className={classes.signInWithGoogleButton}>
              <img src={googleLogo} alt="" />
              Sign in with Google
            </button>
            {/* FORM ERROR */}
      {formError !== "" && <div className={classes.error}>{formError}</div>}

              <LoginForm />

              <div className={classes.createOrLoginLine}>Don't have an account? <b onClick={() => {navigate("/register")}}>Register Now</b></div>


                {/* @2024 LINE */}
            <div className={classes.endLine}>
              @2024 Haroon Absar. All rights reserved
            </div>

            </div>
        </div>

        {/* IMAGE CONTAINER */}
        <div className={classes.imageContainer}>
          <div className={classes.backgroundLogoImage}></div>
          </div>
      </div>

      {/* LOADER */}
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
    </div>
  );
}
