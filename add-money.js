import { auth } from "./firebase.js";

const API_BASE_URL =
  "https://super-fortnight-vpqvrwpx9x6ghpgj6-3000.app.github.dev";


const amountInput =
  document.getElementById("amountInput");

const emailInput =
  document.getElementById("emailInput");

const continueButton =
  document.getElementById("continueButton");

const backButton =
  document.getElementById("backButton");

const amountError =
  document.getElementById("amountError");

const emailError =
  document.getElementById("emailError");


/* =========================================================
   HELPERS
========================================================= */

function showError(element, message) {
  if (!element) return;

  element.textContent = message;
  element.hidden = false;
}


function clearError(element) {
  if (!element) return;

  element.textContent = "";
  element.hidden = true;
}


/* =========================================================
   BACK BUTTON
========================================================= */

if (backButton) {
  backButton.addEventListener(
    "click",
    () => {
      window.location.href =
        "dashboard.html";
    }
  );
}


/* =========================================================
   START PAYMENT
========================================================= */

if (continueButton) {
  continueButton.addEventListener(
    "click",
    async () => {

      clearError(amountError);
      clearError(emailError);


      const amount =
        Number(amountInput?.value);


      const email =
        String(
          emailInput?.value || ""
        )
          .trim()
          .toLowerCase();


      /* -----------------------------------------
         VALIDATE AMOUNT
      ----------------------------------------- */

      if (
        !Number.isFinite(amount) ||
        amount < 100
      ) {
        showError(
          amountError,
          "Enter an amount of at least ₦100."
        );

        return;
      }


      if (amount > 10000000) {
        showError(
          amountError,
          "The maximum amount is ₦10,000,000."
        );

        return;
      }


      /* -----------------------------------------
         VALIDATE EMAIL
      ----------------------------------------- */

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (!emailPattern.test(email)) {
        showError(
          emailError,
          "Enter a valid email address."
        );

        return;
      }


      /* -----------------------------------------
         CHECK FIREBASE SESSION
      ----------------------------------------- */

      const user =
        auth.currentUser;


      if (!user) {
        alert(
          "Your NovaPay session has expired. Please log in again."
        );

        window.location.href =
          "login.html";

        return;
      }


      /* -----------------------------------------
         GET FIREBASE ID TOKEN
      ----------------------------------------- */

      continueButton.disabled = true;

      const originalText =
        continueButton.textContent;

      continueButton.textContent =
        "Starting payment…";


      try {

        const idToken =
          await user.getIdToken();


        console.log(
          "NovaPay: Firebase token obtained."
        );


        /* -----------------------------------------
           SEND PAYMENT REQUEST
        ----------------------------------------- */

        const response =
          await fetch(
            `${API_BASE_URL}/api/payments/initialize`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "Authorization":
                  `Bearer ${idToken}`
              },

              body: JSON.stringify({
                amount: amount,
                email: email
              })
            }
          );


        const responseText =
          await response.text();


        console.log(
          "NovaPay payment HTTP status:",
          response.status
        );


        console.log(
          "NovaPay payment response:",
          responseText
        );


        let result;


        try {
          result =
            JSON.parse(responseText);
        } catch (error) {

          throw new Error(
            "The payment server returned an invalid response."
          );
        }


        /* -----------------------------------------
           BACKEND ERROR
        ----------------------------------------- */

        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.message ||
            "Unable to start payment."
          );

        }


        /* -----------------------------------------
           PAYSTACK CHECKOUT
        ----------------------------------------- */

        if (
          !result.authorization_url
        ) {

          throw new Error(
            "Paystack did not return a checkout link."
          );

        }


        console.log(
          "NovaPay: Paystack payment initialized.",
          result.reference
        );


        /*
          Redirect the user to Paystack.

          Paystack will present the available
          payment methods configured by NovaPay:
          card and bank transfer.
        */

        window.location.href =
          result.authorization_url;


      } catch (error) {

        console.error(
          "NovaPay Add Money error:",
          error
        );


        alert(
          error.message ||
          "We couldn't start your payment. Please try again."
        );


        continueButton.disabled =
          false;

        continueButton.textContent =
          originalText;
      }

    }
  );
}


/* =========================================================
   READY
========================================================= */

console.log(
  "NovaPay Add Money JavaScript loaded."
);