import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     ELEMENTS
  ========================================= */

  const form =
    document.getElementById("registerForm");

  const stepOne =
    document.getElementById("registerStepOne");

  const stepTwo =
    document.getElementById("registerStepTwo");

  const continueButton =
    document.getElementById("continueButton");

  const username =
    document.getElementById("username");

  const email =
    document.getElementById("email");

  const password =
    document.getElementById("password");

  const confirmPassword =
    document.getElementById("confirmPassword");

  const terms =
    document.getElementById("terms");

  const stepLabel =
    document.getElementById("registerStep");

  const registerTheme =
    document.getElementById("registerTheme");


  /* =========================================
     REQUIRED ELEMENT CHECK
  ========================================= */

  if (
    !form ||
    !stepOne ||
    !stepTwo ||
    !continueButton ||
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !terms
  ) {
    console.error(
      "NovaPay registration elements are missing."
    );

    return;
  }


  /* =========================================
     ERROR ELEMENTS
  ========================================= */

  const usernameError =
    document.getElementById("usernameError");

  const emailError =
    document.getElementById("emailError");

  const passwordError =
    document.getElementById("passwordError");

  const confirmPasswordError =
    document.getElementById("confirmPasswordError");

  const termsError =
    document.getElementById("termsError");


  /* =========================================
     CLEAR ERRORS
  ========================================= */

  function clearErrors() {

    if (usernameError) {
      usernameError.textContent = "";
    }

    if (emailError) {
      emailError.textContent = "";
    }

    if (passwordError) {
      passwordError.textContent = "";
    }

    if (confirmPasswordError) {
      confirmPasswordError.textContent = "";
    }

    if (termsError) {
      termsError.textContent = "";
    }

  }


  /* =========================================
     STEP ONE VALIDATION
  ========================================= */

  continueButton.addEventListener(
    "click",
    function () {

      clearErrors();

      let valid = true;


      const usernameValue =
        username.value.trim();


      /* Username */

      if (usernameValue === "") {

        usernameError.textContent =
          "Please enter your username.";

        valid = false;

      } else if (usernameValue.length < 3) {

        usernameError.textContent =
          "Username must be at least 3 characters.";

        valid = false;

      } else if (usernameValue.length > 20) {

        usernameError.textContent =
          "Username must not exceed 20 characters.";

        valid = false;

      } else if (
        !/^[a-zA-Z0-9_]+$/.test(usernameValue)
      ) {

        usernameError.textContent =
          "Use only letters, numbers and underscores.";

        valid = false;

      }


      /* Email */

      const emailValue =
        email.value.trim().toLowerCase();

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (emailValue === "") {

        emailError.textContent =
          "Please enter your email address.";

        valid = false;

      } else if (
        emailValue.length > 254
      ) {

        emailError.textContent =
          "Email address is too long.";

        valid = false;

      } else if (
        !emailPattern.test(emailValue)
      ) {

        emailError.textContent =
          "Please enter a valid email address.";

        valid = false;

      }


      if (!valid) {
        return;
      }


      /* =========================================
         MOVE TO STEP TWO
      ========================================= */

      continueButton.disabled = true;

      stepOne.classList.add("fade-out");


      setTimeout(function () {

        stepOne.hidden = true;

        stepTwo.hidden = false;

        stepTwo.classList.remove("fade-in");

        void stepTwo.offsetWidth;

        stepTwo.classList.add("fade-in");

        if (stepLabel) {
          stepLabel.textContent = "STEP 2";
        }

        password.focus();

      }, 300);

    }
  );


  /* =========================================
     SHOW / HIDE PASSWORD
  ========================================= */

  const passwordButtons =
    document.querySelectorAll(".show-password");


  passwordButtons.forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const target =
          document.getElementById(
            button.dataset.target
          );


        if (!target) {
          return;
        }


        if (target.type === "password") {

          target.type = "text";

          button.textContent = "Hide";

        } else {

          target.type = "password";

          button.textContent = "Show";

        }

      }
    );

  });


  /* =========================================
     REGISTRATION
  ========================================= */

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      clearErrors();

      let valid = true;


      /* Password */

      if (password.value.length < 8) {

        passwordError.textContent =
          "Password must be at least 8 characters.";

        valid = false;

      }


      if (password.value.length > 128) {

        passwordError.textContent =
          "Password is too long.";

        valid = false;

      }


      /* Confirm password */

      if (confirmPassword.value === "") {

        confirmPasswordError.textContent =
          "Please confirm your password.";

        valid = false;

      } else if (
        password.value !== confirmPassword.value
      ) {

        confirmPasswordError.textContent =
          "Passwords do not match.";

        valid = false;

      }


      /* Terms */

      if (!terms.checked) {

        termsError.textContent =
          "Please accept the Terms & Conditions and Privacy Policy.";

        valid = false;

      }


      if (!valid) {
        return;
      }


      /* =========================================
         CLEAN VALUES
      ========================================= */

      const usernameValue =
        username.value.trim();

      const emailValue =
        email.value.trim().toLowerCase();

      const passwordValue =
        password.value;


      /* =========================================
         REGISTER BUTTON
      ========================================= */

      const registerButton =
        form.querySelector(
          'button[type="submit"]'
        );


      const originalButtonText =
        registerButton
          ? registerButton.textContent
          : "Register";


      if (registerButton) {

        registerButton.disabled = true;

        registerButton.textContent =
          "Creating your account…";

      }


      try {

        /* =========================================
           CREATE FIREBASE ACCOUNT
        ========================================= */

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            emailValue,
            passwordValue
          );


        const user =
          userCredential.user;


        console.log(
          "NovaPay: Firebase account created.",
          user.uid
        );


        /* =========================================
           SAVE USERNAME
        ========================================= */

        try {

          await updateProfile(
            user,
            {
              displayName: usernameValue
            }
          );

          console.log(
            "NovaPay: username saved."
          );

        } catch (profileError) {

          console.error(
            "NovaPay: username update failed:",
            profileError
          );

          alert(
            "Your NovaPay account was created, " +
            "but your username could not be saved. " +
            "Please contact support before continuing."
          );

          if (registerButton) {

            registerButton.disabled = false;

            registerButton.textContent =
              originalButtonText;

          }

          return;
        }


        /* =========================================
           VERIFICATION EMAIL SETTINGS
        ========================================= */

        const actionCodeSettings = {

          url:
            "https://lordlowkey-ma.github.io/NovaPay1/login.html",

          handleCodeInApp: true

        };


        /* =========================================
           SEND VERIFICATION EMAIL
        ========================================= */

        try {

          await sendEmailVerification(
            user,
            actionCodeSettings
          );

          console.log(
            "NovaPay: verification email sent."
          );

        } catch (verificationError) {

          console.error(
            "NovaPay: verification email failed:",
            verificationError
          );

          if (registerButton) {

            registerButton.disabled = false;

            registerButton.textContent =
              originalButtonText;

          }

          alert(
            "Your NovaPay account was created successfully, " +
            "but we could not send the verification email.\n\n" +
            "Please try again from the login page or contact support."
          );

          return;
        }


        /* =========================================
           SUCCESS
        ========================================= */

        if (registerButton) {

          registerButton.textContent =
            "Check your email";

        }


        alert(
          "Your NovaPay account has been created.\n\n" +
          "We've sent a verification link to " +
          emailValue +
          ".\n\n" +
          "Please check your email and verify your account."
        );


        console.log(
          "NovaPay registration completed successfully."
        );


      } catch (error) {

        console.error(
          "NovaPay registration error:",
          error
        );


        if (registerButton) {

          registerButton.disabled = false;

          registerButton.textContent =
            originalButtonText;

        }


        let message =
          "Registration failed.";


        if (
          error.code ===
          "auth/email-already-in-use"
        ) {

          message =
            "This email is already associated with a NovaPay account.";

        } else if (
          error.code ===
          "auth/invalid-email"
        ) {

          message =
            "Please enter a valid email address.";

        } else if (
          error.code ===
          "auth/weak-password"
        ) {

          message =
            "Please choose a stronger password.";

        } else if (
          error.code ===
          "auth/network-request-failed"
        ) {

          message =
            "Network error. Please check your internet connection and try again.";

        } else if (
          error.code ===
          "auth/operation-not-allowed"
        ) {

          message =
            "Email and password registration is currently unavailable.";

        } else {

          message =
            "Registration failed: " +
            (error.message || "Unknown error.");

        }


        alert(message);

      }

    }
  );


  /* =========================================
     THEME
  ========================================= */

  if (registerTheme) {

    registerTheme.addEventListener(
      "click",
      function () {

        document.body.classList.toggle("light");

        const lightMode =
          document.body.classList.contains("light");


        registerTheme.textContent =
          lightMode ? "☀" : "☾";


        localStorage.setItem(
          "novapay-theme",
          lightMode ? "light" : "dark"
        );

      }
    );


    const savedTheme =
      localStorage.getItem(
        "novapay-theme"
      );


    if (savedTheme === "light") {

      document.body.classList.add("light");

      registerTheme.textContent = "☀";

    }

  }


  /* =========================================
     READY
  ========================================= */

  console.log(
    "NovaPay registration JavaScript loaded successfully."
  );

});