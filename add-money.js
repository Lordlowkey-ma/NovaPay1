import { auth } from "./firebase.js";


/* =========================================================
   NOVAPAY API
========================================================= */

const API_BASE_URL =
    "https://novapay-backend-1.onrender.com";


/* =========================================================
   ELEMENTS
========================================================= */

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

function showError(
    element,
    message
) {
    if (!element) return;

    element.textContent =
        message;

    element.hidden =
        false;
}


function clearError(
    element
) {
    if (!element) return;

    element.textContent =
        "";

    element.hidden =
        true;
}


function showPaymentMessage(
    message
) {
    alert(message);
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
   PAYSTACK CALLBACK REFERENCE
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const callbackReference =
    String(
        urlParams.get("reference") || ""
    ).trim();


/* =========================================================
   WAIT FOR FIREBASE AUTH
========================================================= */

async function waitForAuthenticatedUser() {

    let attempts = 0;

    while (
        !auth.currentUser &&
        attempts < 20
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );

        attempts++;
    }

    return auth.currentUser;
}


/* =========================================================
   VERIFY PAYSTACK PAYMENT
========================================================= */

async function handlePaystackCallback() {

    if (!callbackReference) {
        return false;
    }


    console.log(
        "NovaPay: Paystack callback detected:",
        callbackReference
    );


    const user =
        await waitForAuthenticatedUser();


    if (!user) {

        showPaymentMessage(
            "Your NovaPay session has expired. Please log in again."
        );

        window.location.href =
            "login.html";

        return true;
    }


    try {

        /*
           Get a fresh Firebase ID token.

           The backend uses this token to confirm that
           the logged-in NovaPay user owns this payment.
        */

        const idToken =
            await user.getIdToken(
                true
            );


        console.log(
            "NovaPay: Verifying payment with backend..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/payments/verify/${encodeURIComponent(
                    callbackReference
                )}`,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${idToken}`
                    }
                }
            );


        const responseText =
            await response.text();


        console.log(
            "NovaPay verification status:",
            response.status
        );


        console.log(
            "NovaPay verification response:",
            responseText
        );


        let result;

        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "The payment server returned an invalid response."
            );

        }


        /*
           The backend is the source of truth.

           Do not credit the wallet in this browser.
        */

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );

        }


        console.log(
            "NovaPay: Payment verification result:",
            result
        );


        /*
           IMPORTANT:

           The server can return:

           status = credited

           This means the wallet was credited successfully.

           It can also return alreadyCredited when the
           Paystack webhook credited it first.

           Both are successful outcomes.
        */

        if (
            result.status ===
                "credited"
        ) {

            showPaymentMessage(
                "Payment confirmed successfully. Your wallet has been credited."
            );

        } else {

            /*
               Do not tell the user that money was credited
               if the server has not confirmed it.
            */

            throw new Error(
                result.message ||
                "Payment has not been confirmed yet. Please check your wallet shortly."
            );

        }


        /*
           Remove the Paystack reference from the URL
           before returning to the dashboard.
        */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        /*
           Clear the locally stored pending reference.
        */

        sessionStorage.removeItem(
            "novapayPendingPaymentReference"
        );


        /*
           Return to dashboard only after the backend
           has confirmed the payment.
        */

        window.location.href =
            "dashboard.html";


        return true;


    } catch (error) {

        console.error(
            "NovaPay payment verification error:",
            error
        );


        showPaymentMessage(
            error.message ||
            "We could not verify your payment. Please contact support before trying again."
        );


        return true;

    }

}


/* =========================================================
   CHECK CALLBACK FIRST
========================================================= */

if (callbackReference) {

    handlePaystackCallback();

}


/* =========================================================
   GET AMOUNT IN NAIRA
========================================================= */

/*
   IMPORTANT:

   The backend currently expects the amount in NAIRA.

   Example:

   User enters:
       500

   This function returns:
       500

   NOT:
       50000

   The server is responsible for converting
   500 NGN into 50,000 kobo.
*/

function getAmountInNaira() {

    const rawAmount =
        String(
            amountInput?.value || ""
        ).trim();


    const amount =
        Number(
            rawAmount
        );


    if (
        !rawAmount ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(
            amountError,
            "Enter a valid amount."
        );

        return null;

    }


    if (
        amount < 100
    ) {

        showError(
            amountError,
            "Minimum amount is ₦100."
        );

        return null;

    }


    if (
        amount > 10000000
    ) {

        showError(
            amountError,
            "Amount is too large."
        );

        return null;

    }


    /*
       Only allow two decimal places.
    */

    if (
        Math.round(
            amount * 100
        ) !==
        amount * 100
    ) {

        showError(
            amountError,
            "Enter an amount with no more than two decimal places."
        );

        return null;

    }


    clearError(
        amountError
    );


    return Number(
        amount.toFixed(2)
    );

}


/* =========================================================
   VALIDATE EMAIL
========================================================= */

function getPaymentEmail() {

    const email =
        String(
            emailInput?.value || ""
        )
            .trim()
            .toLowerCase();


    if (!email) {

        showError(
            emailError,
            "Enter your email address."
        );

        return null;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        showError(
            emailError,
            "Enter a valid email address."
        );

        return null;

    }


    clearError(
        emailError
    );


    return email;

}


/* =========================================================
   START PAYMENT
========================================================= */

async function startPayment() {

    clearError(
        amountError
    );

    clearError(
        emailError
    );


    /*
       IMPORTANT:

       Keep this as NAIRA.

       If user enters ₦500,
       amountNaira = 500.

       The backend converts it to 50,000 kobo.
    */

    const amountNaira =
        getAmountInNaira();


    if (
        amountNaira === null
    ) {
        return;
    }


    const email =
        getPaymentEmail();


    if (!email) {
        return;
    }


    /*
       Make sure Firebase authentication exists.
    */

    const user =
        await waitForAuthenticatedUser();


    if (!user) {

        showPaymentMessage(
            "Please log in before adding money."
        );


        window.location.href =
            "login.html";


        return;

    }


    if (continueButton) {

        continueButton.disabled =
            true;

    }


    const originalButtonText =
        continueButton?.textContent ||
        "Continue";


    if (continueButton) {

        continueButton.textContent =
            "Starting payment...";

    }


    try {

        /*
           Get Firebase ID token.

           This identifies the authenticated NovaPay
           account to the backend.
        */

        const idToken =
            await user.getIdToken(
                true
            );


        console.log(
            "NovaPay: Initializing Paystack payment..."
        );


        console.log(
            "NovaPay amount being sent to backend:",
            amountNaira,
            "NGN"
        );


        /*
           IMPORTANT:

           Send NAIRA here.

           Do NOT multiply by 100.

           The backend already performs:

               amountKobo = amountNumber * 100
        */

        const response =
            await fetch(
                `${API_BASE_URL}/api/payments/initialize`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${idToken}`
                    },

                    body:
                        JSON.stringify({
                            amount:
                                amountNaira,

                            email:
                                email
                        })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "NovaPay initialization HTTP status:",
            response.status
        );


        console.log(
            "NovaPay initialization response:",
            responseText
        );


        let result;

        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "The payment server returned an invalid response."
            );

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to start payment."
            );

        }


        const authorizationUrl =
            String(
                result.authorization_url ||
                ""
            ).trim();


        const reference =
            String(
                result.reference ||
                ""
            ).trim();


        /*
           Paystack must return a checkout URL.
        */

        if (!authorizationUrl) {

            throw new Error(
                "Paystack did not return a payment URL."
            );

        }


        /*
           Paystack must return a payment reference.
        */

        if (!reference) {

            throw new Error(
                "Paystack did not return a payment reference."
            );

        }


        /*
           Save reference locally only for recovery/debugging.

           The backend remains the source of truth.
        */

        sessionStorage.setItem(
            "novapayPendingPaymentReference",
            reference
        );


        console.log(
            "NovaPay payment initialized:",
            reference
        );


        /*
           Redirect to Paystack checkout.
        */

        window.location.href =
            authorizationUrl;


    } catch (error) {

        console.error(
            "NovaPay payment initialization error:",
            error
        );


        showPaymentMessage(
            error.message ||
            "Unable to start payment. Please try again."
        );


        if (continueButton) {

            continueButton.disabled =
                false;


            continueButton.textContent =
                originalButtonText;

        }

    }

}


/* =========================================================
   CONTINUE BUTTON
========================================================= */

if (continueButton) {

    continueButton.addEventListener(
        "click",
        startPayment
    );

}


/* =========================================================
   AMOUNT INPUT CLEANUP
========================================================= */

if (amountInput) {

    amountInput.addEventListener(
        "input",
        () => {

            clearError(
                amountError
            );

        }
    );

}


/* =========================================================
   EMAIL INPUT CLEANUP
========================================================= */

if (emailInput) {

    emailInput.addEventListener(
        "input",
        () => {

            clearError(
                emailError
            );

        }
    );

}


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (continueButton) {

            continueButton.disabled =
                false;

        }


        if (!callbackReference) {

            console.log(
                "NovaPay: Add Money page ready."
            );

        }

    }
);


/* =========================================================
   PAGE RESTORE
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        /*
           Do not interfere with a payment callback.
        */

        if (
            callbackReference
        ) {
            return;
        }


        if (continueButton) {

            continueButton.disabled =
                false;

        }

    }
);


/* =========================================================
   DEBUG EXPORT
========================================================= */

window.novaPayPayment = {

    startPayment,

    handlePaystackCallback

};