import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    return;
  }

  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");

  const emailError = document.getElementById("loginEmailError");
  const passwordError = document.getElementById("loginPasswordError");

  const loginButton = document.getElementById("loginButton");
  const showPassword = document.getElementById("loginShowPassword");
  const forgotPassword = document.getElementById("forgotPassword");
  const themeButton = document.getElementById("loginTheme");


  function clearErrors() {
    emailError.textContent = "";
    passwordError.textContent = "";
  }


  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }


  /* SHOW / HIDE PASSWORD */

  if (showPassword) {
    showPassword.addEventListener("click", function () {

      if (password.type === "password") {
        password.type = "text";
        showPassword.textContent = "Hide";
      } else {
        password.type = "password";
        showPassword.textContent = "Show";
      }

    });
  }


  /* LOGIN */

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearErrors();

    const emailValue = email.value.trim().toLowerCase();
    const passwordValue = password.value;

    let valid = true;


    if (emailValue === "") {
      emailError.textContent = "Please enter your email address.";
      valid = false;
    } else if (!validEmail(emailValue)) {
      emailError.textContent = "Please enter a valid email address.";
      valid = false;
    }


    if (passwordValue === "") {
      passwordError.textContent = "Please enter your password.";
      valid = false;
    } else if (passwordValue.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters.";
      valid = false;
    }


    if (!valid) {
      return;
    }


    loginButton.disabled = true;

    const buttonText =
      loginButton.querySelector("span:first-child");

    if (buttonText) {
      buttonText.textContent = "Checking...";
    }


    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          emailValue,
          passwordValue
        );


      const user = userCredential.user;


      /*
        Require email verification
      */

      if (!user.emailVerified) {

        await signOut(auth);

        passwordError.textContent =
          "Please verify your email address before logging in.";

        loginButton.disabled = false;

        if (buttonText) {
          buttonText.textContent = "Login";
        }

        return;
      }


      /*
        Successful login
      */

      window.location.href = "dashboard.html";


    } catch (error) {

      console.error("NovaPay login error:", error);

      let message =
        "We couldn't log you in. Please check your details and try again.";


      if (error.code === "auth/invalid-credential") {
        message =
          "Incorrect email or password.";
      }

      else if (error.code === "auth/user-not-found") {
        message =
          "No NovaPay account was found with this email.";
      }

      else if (error.code === "auth/wrong-password") {
        message =
          "Incorrect email or password.";
      }

      else if (error.code === "auth/invalid-email") {
        message =
          "Please enter a valid email address.";
      }

      else if (error.code === "auth/too-many-requests") {
        message =
          "Too many login attempts. Please wait and try again.";
      }

      else if (error.code === "auth/network-request-failed") {
        message =
          "Network error. Please check your internet connection.";
      }


      passwordError.textContent = message;

      loginButton.disabled = false;

      if (buttonText) {
        buttonText.textContent = "Login";
      }

    }

  });


  /* FORGOT PASSWORD */

  if (forgotPassword) {

    forgotPassword.addEventListener("click", async function (event) {

      event.preventDefault();

      clearErrors();

      const emailValue = email.value.trim().toLowerCase();


      if (emailValue === "") {

        emailError.textContent =
          "Enter your email first.";

        email.focus();

        return;
      }


      if (!validEmail(emailValue)) {

        emailError.textContent =
          "Please enter a valid email address.";

        email.focus();

        return;
      }


      try {

        await sendPasswordResetEmail(
          auth,
          emailValue
        );

        emailError.textContent =
          "Password reset email sent. Check your inbox.";

      } catch (error) {

        console.error(
          "NovaPay password reset error:",
          error
        );

        emailError.textContent =
          "We couldn't send the password reset email.";

      }

    });

  }


  /* THEME */

  if (themeButton) {

    themeButton.addEventListener("click", function () {

      document.body.classList.toggle("light");

      const isLight =
        document.body.classList.contains("light");

      themeButton.textContent =
        isLight ? "☀" : "☾";

      localStorage.setItem(
        "novapay-theme",
        isLight ? "light" : "dark"
      );

    });


    const savedTheme =
      localStorage.getItem("novapay-theme");


    if (savedTheme === "light") {

      document.body.classList.add("light");

      themeButton.textContent = "☀";

    }

  }


  console.log(
    "NovaPay Firebase login loaded successfully."
  );

});