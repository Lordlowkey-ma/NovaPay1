/* =========================================================
   NOVAPAY — FORGOT PASSWORD
   Phone verification + secure password reset
   ========================================================= */

import {
    auth
} from "./firebase.js";

import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   API
   ========================================================= */

const API_BASE_URL =
    "https://novapay-backend-1.onrender.com";


/* =========================================================
   ELEMENTS
   ========================================================= */

const step1 =
    document.getElementById("forgotStep1");

const step2 =
    document.getElementById("forgotStep2");

const step3 =
    document.getElementById("forgotStep3");

const successStep =
    document.getElementById("forgotSuccess");


const phoneInput =
    document.getElementById("forgotPhone");

const codeInput =
    document.getElementById("forgotCode");

const newPasswordInput =
    document.getElementById("forgotNewPassword");

const confirmPasswordInput =
    document.getElementById("forgotConfirmPassword");


const sendCodeButton =
    document.getElementById(
        "forgotSendCodeButton"
    );

const verifyButton =
    document.getElementById(
        "forgotVerifyButton"
    );

const resendButton =
    document.getElementById(
        "forgotResendButton"
    );

const resetButton =
    document.getElementById(
        "forgotResetButton"
    );


const showNewPasswordButton =
    document.getElementById(
        "forgotShowNewPassword"
    );

const showConfirmPasswordButton =
    document.getElementById(
        "forgotShowConfirmPassword"
    );


const phoneError =
    document.getElementById(
        "forgotPhoneError"
    );

const codeError =
    document.getElementById(
        "forgotCodeError"
    );

const passwordError =
    document.getElementById(
        "forgotPasswordError"
    );

const confirmError =
    document.getElementById(
        "forgotConfirmError"
    );


const message1 =
    document.getElementById(
        "forgotMessage"
    );

const message2 =
    document.getElementById(
        "forgotMessageStep2"
    );

const message3 =
    document.getElementById(
        "forgotMessageStep3"
    );


/* =========================================================
   STATE
   ========================================================= */

let recaptchaVerifier = null;

let confirmationResult = null;

let verifiedUser = null;


/* =========================================================
   FRIENDLY ERROR
   ========================================================= */

function friendlyError(error) {

    console.error(
        "NovaPay password recovery error:",
        error
    );


    /*
     * Never expose Firebase/server technical errors
     * to the user.
     */


    const code =
        error?.code || "";


    if (
        code ===
        "auth/invalid-phone-number"
    ) {

        return "Please enter a valid phone number.";

    }


    if (
        code ===
        "auth/invalid-verification-code"
    ) {

        return "The verification code is incorrect.";

    }


    if (
        code ===
        "auth/code-expired"
    ) {

        return "That verification code has expired. Please request a new one.";

    }


    if (
        code ===
        "auth/too-many-requests"
    ) {

        return "Too many attempts. Please wait a little and try again.";

    }


    if (
        code ===
        "auth/quota-exceeded"
    ) {

        return "We can't send another verification code right now. Please try again later.";

    }


    if (
        error instanceof TypeError
    ) {

        return "We're having trouble connecting right now. Please try again in a moment.";

    }


    if (
        error?.message?.includes(
            "Failed to fetch"
        ) ||
        error?.message?.includes(
            "NetworkError"
        )
    ) {

        return "We're having trouble connecting right now. Please try again in a moment.";

    }


    /*
     * Backend messages that are already
     * safe for users can be shown.
     */

    const safeMessages = [
        "We couldn't find a NovaPay account for this phone number.",
        "We couldn't verify this account.",
        "Your verification has expired. Please try again.",
        "Your new password must be at least 8 characters.",
        "A new password is required.",
        "Phone verification is required."
    ];


    if (
        safeMessages.includes(
            error?.message
        )
    ) {

        return error.message;

    }


    return "Something went wrong. Please try again.";

}


/* =========================================================
   SHOW MESSAGE
   ========================================================= */

function showMessage(
    element,
    message,
    type = "error"
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.className =
        "forgot-message show";


    if (
        type === "success"
    ) {

        element.classList.add(
            "success"
        );

    }

}


/* =========================================================
   CLEAR MESSAGES
   ========================================================= */

function clearMessages() {

    [
        message1,
        message2,
        message3
    ].forEach(
        element => {

            if (!element) {
                return;
            }

            element.textContent = "";

            element.className =
                "forgot-message";

        }
    );

}


/* =========================================================
   CLEAR ERRORS
   ========================================================= */

function clearErrors() {

    [
        phoneError,
        codeError,
        passwordError,
        confirmError
    ].forEach(
        element => {

            if (element) {
                element.textContent = "";
            }

        }
    );

}


/* =========================================================
   PHONE NORMALIZATION
   ========================================================= */

function normalizePhone(value) {

    let phone =
        String(value || "")
            .trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "")
            .replace(/[()]/g, "");


    if (
        phone.startsWith("0") &&
        phone.length === 11
    ) {

        phone =
            "+234" +
            phone.substring(1);

    }


    if (
        phone.startsWith("234") &&
        !phone.startsWith("+234")
    ) {

        phone =
            "+" +
            phone;

    }


    return phone;

}


/* =========================================================
   CREATE RECAPTCHA
   ========================================================= */

function createRecaptcha() {

    if (
        recaptchaVerifier
    ) {

        return;

    }


    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "forgot-recaptcha-container",
            {
                size: "normal",

                callback: () => {

                    console.log(
                        "NovaPay recovery reCAPTCHA completed."
                    );

                },

                "expired-callback": () => {

                    console.log(
                        "NovaPay recovery reCAPTCHA expired."
                    );

                }

            }
        );

}


/* =========================================================
   STEP SWITCH
   ========================================================= */

function showStep(step) {

    step1.hidden =
        step !== 1;

    step2.hidden =
        step !== 2;

    step3.hidden =
        step !== 3;

    successStep.hidden =
        step !== 4;

}


/* =========================================================
   SET BUTTON LOADING
   ========================================================= */

function setButtonLoading(
    button,
    loadingText
) {

    if (!button) {
        return;
    }


    button.disabled = true;

    button.dataset.original =
        button.innerHTML;

    button.innerHTML =
        `<span>${loadingText}</span>`;

}


/* =========================================================
   RESTORE BUTTON
   ========================================================= */

function restoreButton(button) {

    if (!button) {
        return;
    }


    button.disabled = false;


    if (
        button.dataset.original
    ) {

        button.innerHTML =
            button.dataset.original;

    }

}


/* =========================================================
   SEND CODE
   ========================================================= */

async function sendVerificationCode() {

    clearErrors();
    clearMessages();


    const phone =
        normalizePhone(
            phoneInput.value
        );


    if (!phone) {

        phoneError.textContent =
            "Please enter your phone number.";

        phoneInput.focus();

        return;

    }


    try {

        setButtonLoading(
            sendCodeButton,
            "Sending..."
        );


        createRecaptcha();


        confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phone,
                recaptchaVerifier
            );


        /*
         * Store phone only for this
         * recovery session.
         */

        sessionStorage.setItem(
            "novapay_reset_phone",
            phone
        );


        showStep(2);


        showMessage(
            message2,
            "A verification code has been sent to your phone.",
            "success"
        );


    } catch (error) {

        showMessage(
            message1,
            friendlyError(error)
        );


        /*
         * Reset reCAPTCHA so the user
         * can try again.
         */

        if (
            recaptchaVerifier
        ) {

            try {

                recaptchaVerifier.clear();

            } catch (clearError) {

                console.error(
                    "reCAPTCHA cleanup error:",
                    clearError
                );

            }

            recaptchaVerifier =
                null;

        }

    } finally {

        restoreButton(
            sendCodeButton
        );

    }

}


/* =========================================================
   VERIFY CODE
   ========================================================= */

async function verifyCode() {

    clearErrors();
    clearMessages();


    const code =
        codeInput.value
            .trim();


    if (
        !/^\d{6}$/.test(code)
    ) {

        codeError.textContent =
            "Enter the 6-digit verification code.";

        codeInput.focus();

        return;

    }


    if (
        !confirmationResult
    ) {

        showMessage(
            message2,
            "Please request a new verification code."
        );

        return;

    }


    try {

        setButtonLoading(
            verifyButton,
            "Verifying..."
        );


        const userCredential =
            await confirmationResult.confirm(
                code
            );


        verifiedUser =
            userCredential.user;


        if (
            !verifiedUser
        ) {

            throw new Error(
                "Verification could not be completed."
            );

        }


        /*
         * Firebase has now verified the phone.
         *
         * We do NOT trust the phone number
         * entered by the user.
         *
         * The backend will verify the Firebase
         * ID token and obtain the verified phone.
         */


        showStep(3);


        showMessage(
            message3,
            "Phone verified. Create your new password.",
            "success"
        );


    } catch (error) {

        showMessage(
            message2,
            friendlyError(error)
        );

    } finally {

        restoreButton(
            verifyButton
        );

    }

}


/* =========================================================
   RESET PASSWORD
   ========================================================= */

async function resetPassword() {

    clearErrors();
    clearMessages();


    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    /* -----------------------------------------------------
       VALIDATE PASSWORD
    ----------------------------------------------------- */

    if (
        newPassword.length < 8
    ) {

        passwordError.textContent =
            "Your new password must be at least 8 characters.";

        newPasswordInput.focus();

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        confirmError.textContent =
            "The passwords do not match.";

        confirmPasswordInput.focus();

        return;

    }


    if (
        !verifiedUser
    ) {

        showMessage(
            message3,
            "Please verify your phone before changing your password."
        );

        return;

    }


    try {

        setButtonLoading(
            resetButton,
            "Updating..."
        );


        /* -------------------------------------------------
           GET FRESH FIREBASE ID TOKEN
        ------------------------------------------------- */

        const idToken =
            await verifiedUser.getIdToken(
                true
            );


        /* -------------------------------------------------
           SEND TO RENDER
        ------------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/api/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        idToken:
                            idToken,

                        newPassword:
                            newPassword

                    })

                }
            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (parseError) {

            console.error(
                "NovaPay reset response was not JSON:",
                responseText
            );

            throw new Error(
                "The server returned an unexpected response."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "We couldn't update your password."
            );

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "We couldn't update your password."
            );

        }


        /* -------------------------------------------------
           SIGN OUT RECOVERY SESSION
        ------------------------------------------------- */

        try {

            await signOut(auth);

        } catch (signOutError) {

            console.error(
                "Recovery sign-out error:",
                signOutError
            );

        }


        sessionStorage.removeItem(
            "novapay_reset_phone"
        );


        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        showStep(4);


    } catch (error) {

        showMessage(
            message3,
            friendlyError(error)
        );

    } finally {

        restoreButton(
            resetButton
        );

    }

}


/* =========================================================
   RESEND CODE
   ========================================================= */

async function resendCode() {

    /*
     * Return to step 1.
     *
     * The user can request another
     * Firebase SMS verification.
     */

    showStep(1);

    clearErrors();
    clearMessages();


    if (recaptchaVerifier) {

        try {

            recaptchaVerifier.clear();

        } catch (error) {

            console.error(
                "reCAPTCHA cleanup error:",
                error
            );

        }

        recaptchaVerifier =
            null;

    }


    showMessage(
        message1,
        "Please complete the verification again."
    );

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

if (
    showNewPasswordButton
) {

    showNewPasswordButton.addEventListener(
        "click",
        () => {

            const visible =
                newPasswordInput.type ===
                "text";


            newPasswordInput.type =
                visible
                    ? "password"
                    : "text";


            showNewPasswordButton.textContent =
                visible
                    ? "Show"
                    : "Hide";

        }
    );

}


if (
    showConfirmPasswordButton
) {

    showConfirmPasswordButton.addEventListener(
        "click",
        () => {

            const visible =
                confirmPasswordInput.type ===
                "text";


            confirmPasswordInput.type =
                visible
                    ? "password"
                    : "text";


            showConfirmPasswordButton.textContent =
                visible
                    ? "Show"
                    : "Hide";

        }
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

sendCodeButton?.addEventListener(
    "click",
    sendVerificationCode
);


verifyButton?.addEventListener(
    "click",
    verifyCode
);


resetButton?.addEventListener(
    "click",
    resetPassword
);


resendButton?.addEventListener(
    "click",
    resendCode
);


/* =========================================================
   STARTUP
   ========================================================= */

console.log(
    "NovaPay password recovery loaded."
);

console.log(
    "NovaPay recovery API:",
    API_BASE_URL
);