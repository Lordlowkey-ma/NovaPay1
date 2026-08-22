import { auth } from "./firebase.js";

/* =========================================================
   NOVAPAY API
========================================================= */

const API_BASE_URL =
    "https://novapay-backend-1.onrender.com";


/* =========================================================
   PAGE ELEMENTS
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
   PAYMENT LIMITS
========================================================= */

const MIN_AMOUNT_NAIRA = 50;

const MAX_AMOUNT_NAIRA = 1000000;


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


function showMessage(message) {

    alert(message);
}


/* =========================================================
   CURRENT USER
========================================================= */

async function getCurrentUser() {

    if (auth.currentUser) {

        return auth.currentUser;
    }


    return new Promise((resolve) => {

        let finished = false;


        const unsubscribe =
            auth.onAuthStateChanged(
                (user) => {

                    if (finished) return;

                    finished = true;

                    unsubscribe();

                    resolve(user);
                }
            );


        setTimeout(() => {

            if (finished) return;

            finished = true;

            unsubscribe();

            resolve(
                auth.currentUser
            );

        }, 10000);
    });
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
        urlParams.get("reference") ||
        urlParams.get("trxref") ||
        ""
    ).trim();


/* =========================================================
   AMOUNT VALIDATION
========================================================= */

function getAmountInNaira() {

    const raw =
        String(
            amountInput?.value || ""
        ).trim();


    if (!raw) {

        showError(
            amountError,
            "Enter a valid amount."
        );

        return null;
    }


    const amount =
        Number(raw);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(
            amountError,
            "Enter a valid amount."
        );

        return null;
    }


    /*
     * IMPORTANT:
     * NovaPay minimum is ₦50.
     */

    if (
        amount < MIN_AMOUNT_NAIRA
    ) {

        showError(
            amountError,
            "Minimum amount is ₦50."
        );

        return null;
    }


    if (
        amount > MAX_AMOUNT_NAIRA
    ) {

        showError(
            amountError,
            "Maximum amount is ₦1,000,000."
        );

        return null;
    }


    /*
     * Maximum two decimal places.
     */

    if (
        Math.round(amount * 100) !==
        amount * 100
    ) {

        showError(
            amountError,
            "Enter an amount with no more than two decimal places."
        );

        return null;
    }


    clearError(amountError);


    return Number(
        amount.toFixed(2)
    );
}


/* =========================================================
   EMAIL VALIDATION
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
        !emailPattern.test(email)
    ) {

        showError(
            emailError,
            "Enter a valid email address."
        );

        return null;
    }


    clearError(emailError);


    return email;
}


/* =========================================================
   VERIFY PAYMENT
========================================================= */

async function verifyPayment(
    reference
) {

    const user =
        await getCurrentUser();


    if (!user) {

        showMessage(
            "Your NovaPay session has expired. Please log in again."
        );


        window.location.href =
            "login.html";


        return;
    }


    try {

        const idToken =
            await user.getIdToken(true);


        const response =
            await fetch(
                `${API_BASE_URL}/api/payments/verify/${encodeURIComponent(reference)}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        Authorization:
                            `Bearer ${idToken}`
                    }
                }
            );


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(text);

        } catch {

            throw new Error(
                "The payment server returned an invalid response."
            );
        }


        console.log(
            "NovaPay payment verification:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );
        }


        /*
         * Only the backend can confirm
         * that the payment was actually credited.
         */

        if (
            result.status !==
            "credited"
        ) {

            throw new Error(
                "Payment has not been confirmed yet."
            );
        }


        sessionStorage.removeItem(
            "novapayPendingPaymentReference"
        );


        /*
         * Remove Paystack reference
         * from the browser URL.
         */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        showMessage(
            "Payment confirmed successfully. Your wallet has been credited."
        );


        /*
         * Dashboard will fetch the fresh
         * Firestore balance from the backend.
         */

        window.location.replace(
            "dashboard.html"
        );

    } catch (error) {

        console.error(
            "NovaPay payment verification error:",
            error
        );


        showMessage(
            error.message ||
            "We could not verify your payment. Please try again."
        );


        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.textContent =
                "Continue";
        }
    }
}


/* =========================================================
   HANDLE PAYSTACK CALLBACK
========================================================= */

async function handleCallback() {

    if (!callbackReference) {

        return;
    }


    console.log(
        "NovaPay Paystack callback:",
        callbackReference
    );


    if (continueButton) {

        continueButton.disabled =
            true;

        continueButton.textContent =
            "Verifying payment...";
    }


    await verifyPayment(
        callbackReference
    );
}


/* =========================================================
   START PAYMENT
========================================================= */

async function startPayment() {

    clearError(amountError);

    clearError(emailError);


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


    const user =
        await getCurrentUser();


    if (!user) {

        showMessage(
            "Please log in before adding money."
        );


        window.location.href =
            "login.html";


        return;
    }


    if (continueButton) {

        continueButton.disabled =
            true;

        continueButton.textContent =
            "Starting payment...";
    }


    try {

        const idToken =
            await user.getIdToken(true);


        console.log(
            "NovaPay amount:",
            amountNaira,
            "NGN"
        );


        /*
         * IMPORTANT:
         *
         * ₦500 is sent as 500.
         *
         * The backend converts it to:
         *
         * 500 × 100 = 50,000 kobo
         */

        const response =
            await fetch(
                `${API_BASE_URL}/api/payments/initialize`,
                {
                    method: "POST",

                    cache: "no-store",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${idToken}`
                    },

                    body:
                        JSON.stringify({

                            amountNaira:
                                amountNaira,

                            email:
                                email
                        })
                }
            );


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(text);

        } catch {

            throw new Error(
                "The payment server returned an invalid response."
            );
        }


        console.log(
            "NovaPay payment initialization:",
            result
        );


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


        if (!authorizationUrl) {

            throw new Error(
                "Paystack did not return a payment URL."
            );
        }


        if (!reference) {

            throw new Error(
                "Paystack did not return a payment reference."
            );
        }


        /*
         * Store only the payment reference.
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
         * Redirect to Paystack.
         */

        window.location.href =
            authorizationUrl;

    } catch (error) {

        console.error(
            "NovaPay payment initialization error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to start payment. Please try again."
        );


        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.textContent =
                "Continue";
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
   INPUT CLEANUP
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
   INITIALIZE PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.textContent =
                "Continue";
        }


        /*
         * If Paystack redirected back
         * with a reference, verify it.
         */

        if (callbackReference) {

            handleCallback();

        } else {

            console.log(
                "NovaPay Add Money page ready."
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
         * Do not reset the button while
         * payment verification is running.
         */

        if (callbackReference) {

            return;
        }


        if (continueButton) {

            continueButton.disabled =
                false;

            continueButton.textContent =
                "Continue";
        }
    }
);


/* =========================================================
   DEBUG ACCESS
========================================================= */

window.novaPayPayment = {

    startPayment,

    verifyPayment,

    handleCallback
};