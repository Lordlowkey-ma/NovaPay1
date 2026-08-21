import { auth } from "./firebase.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   NOVAPAY PHONE REGISTRATION
   Flow:
   Phone → SMS/test code → Create password → Backend → Dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     ELEMENTS
     ========================================================= */

  const form = document.getElementById("registerForm");

  const stepOne = document.getElementById("registrationStep1");
  const stepTwo = document.getElementById("registrationStep2");
  const stepThree = document.getElementById("registrationStep3");

  const username = document.getElementById("username");
  const phone = document.getElementById("phone");

  const verificationCode =
    document.getElementById("verificationCode");

  const password =
    document.getElementById("password");

  const confirmPassword =
    document.getElementById("confirmPassword");

  const sendCodeButton =
    document.getElementById("sendCodeBtn");

  const verifyCodeButton =
    document.getElementById("verifyCodeBtn");

  const resendCodeButton =
    document.getElementById("resendCodeBtn");

  const createAccountButton =
    document.getElementById("createAccountBtn");

  const registerMessage =
    document.getElementById("registerMessage");


  /* =========================================================
     CHECK REQUIRED ELEMENTS
     ========================================================= */

  if (
    !form ||
    !stepOne ||
    !stepTwo ||
    !stepThree ||
    !username ||
    !phone ||
    !verificationCode ||
    !password ||
    !confirmPassword ||
    !sendCodeButton ||
    !verifyCodeButton ||
    !resendCodeButton ||
    !createAccountButton
  ) {
    console.error(
      "NovaPay: registration HTML elements are missing."
    );

    return;
  }


  /* =========================================================
     STATE
     ========================================================= */

  let confirmationResult = null;
  let verifiedUser = null;
  let recaptchaVerifier = null;


  /* =========================================================
     BACKEND URL
     =========================================================
     
     For local testing this uses port 3000.

     Later, when the NovaPay backend is deployed,
     replace this with the real HTTPS backend URL.
     ========================================================= */

  const API_BASE_URL =
  "https://super-fortnight-vpqvrwpx9x6ghpgj6-3000.app.github.dev";


  /* =========================================================
     MESSAGE HELPER
     ========================================================= */

  function showMessage(message, type = "error") {

    if (!registerMessage) {
      alert(message);
      return;
    }

    registerMessage.textContent = message;

    registerMessage.classList.remove(
      "error",
      "success",
      "info"
    );

    registerMessage.classList.add(type);
  }


  function clearMessage() {

    if (!registerMessage) {
      return;
    }

    registerMessage.textContent = "";

    registerMessage.classList.remove(
      "error",
      "success",
      "info"
    );
  }


  /* =========================================================
     STEP HELPER
     ========================================================= */

  function showStep(stepNumber) {

    stepOne.hidden = stepNumber !== 1;
    stepTwo.hidden = stepNumber !== 2;
    stepThree.hidden = stepNumber !== 3;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* =========================================================
     PHONE NORMALIZATION
     ========================================================= */

  function normalizeNigeriaPhone(value) {

    let cleaned = value
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

    /*
      Accept:

      08012345678
      8012345678
      +2348012345678
      2348012345678

      Convert everything to:

      +2348012345678
    */

    if (cleaned.startsWith("+234")) {

      return cleaned;

    }

    if (cleaned.startsWith("234")) {

      return "+" + cleaned;

    }

    if (cleaned.startsWith("0")) {

      return "+234" + cleaned.substring(1);

    }

    if (cleaned.length === 10) {

      return "+234" + cleaned;

    }

    return cleaned;
  }


  /* =========================================================
     PHONE VALIDATION
     ========================================================= */

  function isValidNigeriaPhone(phoneNumber) {

    return /^\+234\d{10}$/.test(phoneNumber);
  }


  /* =========================================================
     PASSWORD VALIDATION
     ========================================================= */

  function validatePassword() {

    const passwordValue = password.value;
    const confirmValue = confirmPassword.value;

    if (passwordValue.length < 8) {

      showMessage(
        "Password must be at least 8 characters.",
        "error"
      );

      return false;
    }

    if (passwordValue.length > 128) {

      showMessage(
        "Password is too long.",
        "error"
      );

      return false;
    }

    if (passwordValue !== confirmValue) {

      showMessage(
        "Passwords do not match.",
        "error"
      );

      return false;
    }

    return true;
  }


  /* =========================================================
     FIREBASE RECAPTCHA
     ========================================================= */

  function setupRecaptcha() {

    if (recaptchaVerifier) {
      return recaptchaVerifier;
    }

    recaptchaVerifier =
      new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",

          callback: () => {
            console.log(
              "NovaPay: reCAPTCHA completed."
            );
          },

          "expired-callback": () => {

            showMessage(
              "The security check expired. Please try again.",
              "error"
            );
          }
        }
      );

    return recaptchaVerifier;
  }


  /* =========================================================
     SEND PHONE VERIFICATION CODE
     ========================================================= */

  sendCodeButton.addEventListener(
    "click",
    async () => {

      clearMessage();

      const usernameValue =
        username.value.trim();

      const phoneValue =
        normalizeNigeriaPhone(phone.value);


      /* USERNAME */

      if (!usernameValue) {

        showMessage(
          "Please enter your username.",
          "error"
        );

        username.focus();

        return;
      }


      if (usernameValue.length < 3) {

        showMessage(
          "Username must be at least 3 characters.",
          "error"
        );

        username.focus();

        return;
      }


      if (usernameValue.length > 20) {

        showMessage(
          "Username must not exceed 20 characters.",
          "error"
        );

        username.focus();

        return;
      }


      if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {

        showMessage(
          "Use only letters, numbers and underscores.",
          "error"
        );

        username.focus();

        return;
      }


      /* PHONE */

      if (!isValidNigeriaPhone(phoneValue)) {

        showMessage(
          "Enter a valid Nigerian phone number.",
          "error"
        );

        phone.focus();

        return;
      }


      phone.value = phoneValue;

      sendCodeButton.disabled = true;
      sendCodeButton.textContent = "Sending code…";


      try {

        const verifier = setupRecaptcha();

        confirmationResult =
          await signInWithPhoneNumber(
            auth,
            phoneValue,
            verifier
          );


        console.log(
          "NovaPay: Firebase verification code request sent."
        );


        showMessage(
          "Verification code sent. Enter the 6-digit code.",
          "success"
        );


        showStep(2);

        verificationCode.focus();


      } catch (error) {

        console.error(
          "NovaPay: phone verification failed:",
          error
        );


        if (recaptchaVerifier) {

          try {
            recaptchaVerifier.clear();
          } catch (_) {}

          recaptchaVerifier = null;
        }


        let message =
          "We could not send the verification code. Please try again.";


        if (
          error.code ===
          "auth/invalid-phone-number"
        ) {

          message =
            "The phone number is invalid.";

        } else if (
          error.code ===
          "auth/too-many-requests"
        ) {

          message =
            "Too many attempts. Please wait and try again.";

        } else if (
          error.code ===
          "auth/quota-exceeded"
        ) {

          message =
            "Firebase SMS quota has been reached.";

        } else if (
          error.code ===
          "auth/billing-not-enabled"
        ) {

          message =
            "Firebase phone verification requires the required billing configuration.";

        } else if (error.message) {

          console.error(
            "Firebase error:",
            error.message
          );
        }


        showMessage(
          message,
          "error"
        );


      } finally {

        sendCodeButton.disabled = false;
        sendCodeButton.textContent = "Continue";

      }
    }
  );


  /* =========================================================
     VERIFY 6-DIGIT CODE
     ========================================================= */

  verifyCodeButton.addEventListener(
    "click",
    async () => {

      clearMessage();

      const code =
        verificationCode.value.trim();


      if (!/^\d{6}$/.test(code)) {

        showMessage(
          "Enter the 6-digit verification code.",
          "error"
        );

        verificationCode.focus();

        return;
      }


      if (!confirmationResult) {

        showMessage(
          "Please request a verification code first.",
          "error"
        );

        showStep(1);

        return;
      }


      verifyCodeButton.disabled = true;
      verifyCodeButton.textContent = "Verifying…";


      try {

        const userCredential =
          await confirmationResult.confirm(code);


        verifiedUser =
          userCredential.user;


        console.log(
          "NovaPay: phone verified.",
          verifiedUser.uid
        );


        showMessage(
          "Phone verified successfully.",
          "success"
        );


        showStep(3);

        password.focus();


      } catch (error) {

        console.error(
          "NovaPay: code verification failed:",
          error
        );


        let message =
          "The verification code is incorrect.";


        if (
          error.code ===
          "auth/invalid-verification-code"
        ) {

          message =
            "The verification code is incorrect.";

        } else if (
          error.code ===
          "auth/code-expired"
        ) {

          message =
            "The verification code has expired. Request a new code.";

        } else if (error.message) {

          console.error(
            "Firebase verification error:",
            error.message
          );
        }


        showMessage(
          message,
          "error"
        );


      } finally {

        verifyCodeButton.disabled = false;
        verifyCodeButton.textContent = "Verify code";

      }
    }
  );


  /* =========================================================
     RESEND CODE
     ========================================================= */

  resendCodeButton.addEventListener(
    "click",
    async () => {

      clearMessage();

      const phoneValue =
        normalizeNigeriaPhone(phone.value);


      if (!isValidNigeriaPhone(phoneValue)) {

        showMessage(
          "Your phone number is invalid.",
          "error"
        );

        showStep(1);

        return;
      }


      resendCodeButton.disabled = true;
      resendCodeButton.textContent = "Sending…";


      try {

        if (recaptchaVerifier) {

          try {
            recaptchaVerifier.clear();
          } catch (_) {}

          recaptchaVerifier = null;
        }


        const verifier =
          setupRecaptcha();


        confirmationResult =
          await signInWithPhoneNumber(
            auth,
            phoneValue,
            verifier
          );


        showMessage(
          "A new verification code has been sent.",
          "success"
        );


      } catch (error) {

        console.error(
          "NovaPay: resend failed:",
          error
        );


        showMessage(
          "We could not resend the code. Please try again.",
          "error"
        );


      } finally {

        resendCodeButton.disabled = false;
        resendCodeButton.textContent = "Resend code";

      }
    }
  );


  /* =========================================================
     CREATE NOVAPAY ACCOUNT
     ========================================================= */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      clearMessage();


      if (!verifiedUser) {

        showMessage(
          "Please verify your phone number first.",
          "error"
        );

        showStep(2);

        return;
      }


      if (!validatePassword()) {
        return;
      }


      const usernameValue =
        username.value.trim();

      const phoneValue =
        normalizeNigeriaPhone(phone.value);

      const passwordValue =
        password.value;


      createAccountButton.disabled = true;
      createAccountButton.textContent =
        "Creating account…";


      try {

        /*
          Firebase phone authentication has already
          authenticated this user.

          We now obtain the Firebase ID token.

          The backend will verify this token.
        */

        const idToken =
          await verifiedUser.getIdToken(true);


        console.log(
          "NovaPay: Firebase ID token obtained."
        );


        /* =================================================
           SEND REGISTRATION DATA TO NOVAPAY BACKEND
           ================================================= */

        const response =
          await fetch(
            `${API_BASE_URL}/api/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                idToken: idToken,
                username: usernameValue,
                phone: phoneValue,
                password: passwordValue
              })
            }
          );


        const result =
          await response.json();


        console.log(
          "NovaPay backend response:",
          result
        );


        if (!response.ok || !result.success) {

          throw new Error(
            result.message ||
            "NovaPay account creation failed."
          );
        }


        /* =================================================
           SUCCESS
           ================================================= */

        showMessage(
          "Your NovaPay account was created successfully.",
          "success"
        );


        createAccountButton.textContent =
          "Account created";


        /*
          IMPORTANT:
          Do not put the user's password into localStorage.
          Firebase remains responsible for the authenticated
          session.
        */


        setTimeout(() => {

          window.location.href =
            "dashboard.html";

        }, 1000);


      } catch (error) {

        console.error(
          "NovaPay: registration failed:",
          error
        );


        showMessage(
          error.message ||
          "Registration failed. Please try again.",
          "error"
        );


        createAccountButton.disabled = false;

        createAccountButton.textContent =
          "Create account";

      }
    }
  );


  /* =========================================================
     VERIFICATION CODE INPUT
     ========================================================= */

  verificationCode.addEventListener(
    "input",
    () => {

      verificationCode.value =
        verificationCode.value
          .replace(/\D/g, "")
          .slice(0, 6);

    }
  );


  /* =========================================================
     PHONE INPUT
     ========================================================= */

  phone.addEventListener(
    "input",
    () => {

      phone.value =
        phone.value.replace(
          /[^\d+\s-]/g,
          ""
        );

    }
  );


  /* =========================================================
     PASSWORD SHOW/HIDE
     ========================================================= */

  const passwordButtons =
    document.querySelectorAll(
      ".show-password"
    );


  passwordButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

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

    }
  );


  /* =========================================================
     INITIAL STATE
     ========================================================= */

  showStep(1);

  console.log(
    "NovaPay phone registration JavaScript loaded successfully."
  );

});