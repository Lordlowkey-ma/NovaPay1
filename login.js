/* =========================================================
   NOVAPAY LOGIN
   Firebase persistent session
   ========================================================= */

import {
    auth
} from "./firebase.js";

import {
    signInWithCustomToken,
    setPersistence,
    browserLocalPersistence,
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

const loginForm =
    document.getElementById("loginForm");

const loginPhone =
    document.getElementById("loginPhone");

const loginPassword =
    document.getElementById("loginPassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const loginPhoneError =
    document.getElementById("loginPhoneError");

const loginPasswordError =
    document.getElementById("loginPasswordError");

const loginShowPassword =
    document.getElementById("loginShowPassword");

const forgotPassword =
    document.getElementById("forgotPassword");

const loginTheme =
    document.getElementById("loginTheme");


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        "login-message show";

    if (type === "success") {
        loginMessage.classList.add("success");
    }

}


function clearMessage() {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = "";

    loginMessage.className =
        "login-message";

}


/* =========================================================
   ERRORS
   ========================================================= */

function clearErrors() {

    if (loginPhoneError) {
        loginPhoneError.textContent = "";
    }

    if (loginPasswordError) {
        loginPasswordError.textContent = "";
    }

    clearMessage();

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
   SHOW / HIDE PASSWORD
   ========================================================= */

if (loginShowPassword) {

    loginShowPassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                loginShowPassword.textContent =
                    "Hide";

            } else {

                loginPassword.type =
                    "password";

                loginShowPassword.textContent =
                    "Show";

            }

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearErrors();


            const phone =
                normalizePhone(
                    loginPhone.value
                );

            const password =
                loginPassword.value;


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!phone) {

                loginPhoneError.textContent =
                    "Please enter your phone number.";

                loginPhone.focus();

                return;

            }


            if (!password) {

                loginPasswordError.textContent =
                    "Please enter your password.";

                loginPassword.focus();

                return;

            }


            if (password.length < 8) {

                loginPasswordError.textContent =
                    "Password must be at least 8 characters.";

                loginPassword.focus();

                return;

            }


            /* ---------------------------------------------
               BUTTON
            --------------------------------------------- */

            loginButton.disabled = true;

            const originalButton =
                loginButton.innerHTML;

            loginButton.innerHTML =
                "<span>Logging in...</span>";


            try {

                /* -----------------------------------------
                   REQUEST BACKEND LOGIN
                ----------------------------------------- */

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                phone: phone,
                                password: password
                            })
                        }
                    );


                const responseText =
                    await response.text();


                let result;


                try {

                    result =
                        responseText
                            ? JSON.parse(responseText)
                            : {};

                } catch (error) {

                    console.error(
                        "NovaPay login invalid response:",
                        responseText
                    );

                    throw new Error(
                        `Server returned an invalid response (${response.status}).`
                    );

                }


                console.log(
                    "NovaPay login response:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        result.error ||
                        `Login failed (${response.status}).`
                    );

                }


                if (!result.success) {

                    throw new Error(
                        result.message ||
                        "Login failed."
                    );

                }


                if (!result.token) {

                    throw new Error(
                        "Login succeeded but no authentication token was returned."
                    );

                }


                /* -----------------------------------------
                   PERSIST FIREBASE AUTH SESSION
                ----------------------------------------- */

                await setPersistence(
                    auth,
                    browserLocalPersistence
                );


                /* -----------------------------------------
                   SIGN INTO FIREBASE
                ----------------------------------------- */

                const userCredential =
                    await signInWithCustomToken(
                        auth,
                        result.token
                    );


                const firebaseUser =
                    userCredential.user;


                console.log(
                    "NovaPay Firebase session established:",
                    firebaseUser.uid
                );


                /* -----------------------------------------
                   VERIFY SESSION
                ----------------------------------------- */

                if (
                    firebaseUser.uid !==
                    result.user.uid
                ) {

                    await signOut(auth);

                    throw new Error(
                        "The authentication session could not be verified."
                    );

                }


                /* -----------------------------------------
                   SAVE SAFE USER PROFILE
                   
                   This is NOT authentication.
                   Firebase is the authentication source.
                ----------------------------------------- */

                if (result.user) {

                    localStorage.setItem(
                        "novapay_user",
                        JSON.stringify(
                            result.user
                        )
                    );

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                showMessage(
                    "Login successful. Redirecting...",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "NovaPay login error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to log in right now."
                );


                loginButton.disabled =
                    false;

                loginButton.innerHTML =
                    originalButton;

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        () => {

            window.location.href =
                "forgot-password.html";

        }
    );

}


/* =========================================================
   THEME
   ========================================================= */

if (loginTheme) {

    loginTheme.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-mode"
            );


            const isLight =
                document.body.classList.contains(
                    "light-mode"
                );


            loginTheme.textContent =
                isLight ? "☀" : "☾";

        }
    );

}


/* =========================================================
   STARTUP
   ========================================================= */

console.log(
    "NovaPay login loaded."
);

console.log(
    "NovaPay API:",
    API_BASE_URL
);