/* =========================================================
   NOVAPAY DASHBOARD
   Firebase Authentication + Dashboard Data
========================================================= */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    "https://novapay-backend-1.onrender.com";


/*
   This is the dashboard endpoint.

   If your backend uses a different route, we will change
   ONLY this line after checking the backend.
*/
const DASHBOARD_ENDPOINT =
    `${API_BASE_URL}/api/dashboard`;


/* =========================================================
   ELEMENTS
========================================================= */

const usernameElement =
    document.getElementById("username");

const profileInitial =
    document.getElementById("profileInitial");

const walletBalance =
    document.getElementById("walletBalance");

const balanceToggle =
    document.getElementById("balanceToggle");

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const supportButton =
    document.getElementById("supportButton");

const notificationButton =
    document.getElementById("notificationButton");

const notificationBadge =
    document.getElementById("notificationBadge");

const historyButton =
    document.getElementById("historyButton");

const addMoneyButton =
    document.getElementById("addMoneyButton");

const transactionsSection =
    document.getElementById("transactionsSection");

const transactionsContainer =
    document.getElementById("transactionsContainer");

const seeAllTransactions =
    document.getElementById("seeAllTransactions");

const moreServicesButton =
    document.getElementById("moreServicesButton");

const services =
    document.querySelectorAll(".service");

const bottomNavigation =
    document.querySelectorAll(".bottom-nav-item");


/* =========================================================
   STATE
========================================================= */

let balanceVisible = true;

let currentBalance = 0;


/* =========================================================
   SAVED USER
========================================================= */

function getSavedUser() {

    try {

        const saved =
            localStorage.getItem(
                "novapay_user"
            );

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.warn(
            "NovaPay: saved user profile could not be read."
        );

        return null;
    }
}


/* =========================================================
   USERNAME
========================================================= */

function getUsername(firebaseUser) {

    const savedUser =
        getSavedUser();

    return (
        savedUser?.username ||
        savedUser?.name ||
        savedUser?.displayName ||
        firebaseUser?.displayName ||
        firebaseUser?.phoneNumber ||
        "User"
    );
}


function displayUser(firebaseUser) {

    const username =
        getUsername(firebaseUser);


    if (usernameElement) {

        usernameElement.textContent =
            username;
    }


    if (profileInitial) {

        profileInitial.textContent =
            username
                .trim()
                .charAt(0)
                .toUpperCase() || "N";
    }
}


/* =========================================================
   NAIRA FORMAT
========================================================= */

function formatNaira(amount) {

    const number =
        Number(amount);


    if (!Number.isFinite(number)) {

        return "₦0.00";
    }


    return (
        "₦" +
        number.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}


/* =========================================================
   BALANCE
========================================================= */

function renderBalance() {

    if (!walletBalance) {
        return;
    }


    if (!balanceVisible) {

        walletBalance.textContent =
            "₦••••";

        return;
    }


    walletBalance.textContent =
        formatNaira(
            currentBalance
        );
}


function setBalance(amount) {

    const number =
        Number(amount);


    currentBalance =
        Number.isFinite(number)
            ? number
            : 0;


    renderBalance();
}


balanceToggle?.addEventListener(
    "click",
    () => {

        balanceVisible =
            !balanceVisible;

        renderBalance();


        balanceToggle.setAttribute(
            "aria-pressed",
            String(!balanceVisible)
        );
    }
);


/* =========================================================
   THEME
========================================================= */

const THEME_KEY =
    "novapay_theme";


function applyTheme(theme) {

    const isLight =
        theme === "light";


    document.body.classList.toggle(
        "light-mode",
        isLight
    );


    if (themeIcon) {

        themeIcon.textContent =
            isLight
                ? "☀"
                : "☾";
    }


    if (themeToggle) {

        themeToggle.setAttribute(
            "aria-pressed",
            String(isLight)
        );
    }
}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    applyTheme(
        savedTheme === "light"
            ? "light"
            : "dark"
    );
}


themeToggle?.addEventListener(
    "click",
    () => {

        const isLight =
            document.body.classList.contains(
                "light-mode"
            );


        const newTheme =
            isLight
                ? "dark"
                : "light";


        localStorage.setItem(
            THEME_KEY,
            newTheme
        );


        applyTheme(
            newTheme
        );
    }
);


/* =========================================================
   NOTIFICATIONS
========================================================= */

function updateNotificationBadge(count) {

    const number =
        Number(count);


    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        if (notificationBadge) {

            notificationBadge.hidden =
                true;
        }

        return;
    }


    if (notificationBadge) {

        notificationBadge.hidden =
            false;

        notificationBadge.textContent =
            number > 99
                ? "99+"
                : String(number);
    }
}


notificationButton?.addEventListener(
    "click",
    () => {

        console.log(
            "NovaPay notifications selected."
        );

        /*
           Notifications page will be connected
           when that feature is built.
        */
    }
);


/* =========================================================
   LIVE SUPPORT
========================================================= */

supportButton?.addEventListener(
    "click",
    () => {

        console.log(
            "NovaPay Live Support selected."
        );

        /*
           Live Support will be connected
           when that feature is built.
        */
    }
);


/* =========================================================
   WALLET ACTIONS
========================================================= */

addMoneyButton?.addEventListener(
    "click",
    () => {

        window.location.href =
            "add-money.html";
    }
);


historyButton?.addEventListener(
    "click",
    () => {

        window.location.href =
            "history.html";
    }
);


seeAllTransactions?.addEventListener(
    "click",
    () => {

        window.location.href =
            "history.html";
    }
);


/* =========================================================
   QUICK SERVICES
========================================================= */

services.forEach(
    (service) => {

        service.addEventListener(
            "click",
            () => {

                const serviceName =
                    service.dataset.service;


                if (!serviceName) {
                    return;
                }


                console.log(
                    "NovaPay service:",
                    serviceName
                );
            }
        );
    }
);


moreServicesButton?.addEventListener(
    "click",
    () => {

        console.log(
            "NovaPay More Services selected."
        );
    }
);


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

bottomNavigation.forEach(
    (item) => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;


                if (!page) {
                    return;
                }


                bottomNavigation.forEach(
                    (navItem) => {

                        navItem.classList.remove(
                            "active"
                        );
                    }
                );


                item.classList.add(
                    "active"
                );


                if (page === "profile") {

                    window.location.href =
                        "profile.html";

                    return;
                }


                if (page === "cards") {

                    console.log(
                        "NovaPay Cards selected."
                    );

                    return;
                }


                if (page === "points") {

                    console.log(
                        "NovaPay Points selected."
                    );

                    return;
                }
            }
        );
    }
);


/* =========================================================
   TRANSACTION HELPERS
========================================================= */

function getTransactionsFromResponse(data) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        Array.isArray(
            data?.transactions
        )
    ) {
        return data.transactions;
    }


    if (
        Array.isArray(
            data?.recentTransactions
        )
    ) {
        return data.recentTransactions;
    }


    if (
        Array.isArray(
            data?.data?.transactions
        )
    ) {
        return data.data.transactions;
    }


    if (
        Array.isArray(
            data?.data?.recentTransactions
        )
    ) {
        return data.data.recentTransactions;
    }


    return [];
}


/* =========================================================
   TRANSACTION DATE
========================================================= */

function formatTransactionDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }


    return date.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =========================================================
   TRANSACTION ICON
========================================================= */

function getTransactionIcon(transaction) {

    const type =
        String(
            transaction?.type ||
            transaction?.category ||
            transaction?.service ||
            ""
        ).toLowerCase();


    if (type.includes("airtime")) {
        return "☎";
    }


    if (type.includes("data")) {
        return "◉";
    }


    if (type.includes("electric")) {
        return "◇";
    }


    if (type.includes("tv")) {
        return "▣";
    }


    if (type.includes("bet")) {
        return "⚽";
    }


    return "◆";
}


/* =========================================================
   TRANSACTION NAME
========================================================= */

function getTransactionName(transaction) {

    return (
        transaction?.description ||
        transaction?.name ||
        transaction?.title ||
        transaction?.type ||
        transaction?.category ||
        "Transaction"
    );
}


/* =========================================================
   TRANSACTION AMOUNT
========================================================= */

function getTransactionAmount(transaction) {

    const amount =
        Number(
            transaction?.amount ??
            transaction?.value ??
            0
        );


    if (!Number.isFinite(amount)) {
        return "₦0.00";
    }


    const isCredit =
        transaction?.direction === "credit" ||
        transaction?.type === "credit" ||
        transaction?.credit === true;


    const prefix =
        isCredit
            ? "+"
            : amount > 0
                ? "-"
                : "";


    return (
        prefix +
        formatNaira(
            Math.abs(amount)
        )
    );
}


/* =========================================================
   RENDER TRANSACTIONS
========================================================= */

function renderTransactions(transactions) {

    if (
        !transactionsSection ||
        !transactionsContainer
    ) {
        return;
    }


    /*
       No transactions:
       completely remove the section.
    */

    if (
        !Array.isArray(transactions) ||
        transactions.length === 0
    ) {

        transactionsSection.hidden =
            true;

        transactionsContainer.innerHTML =
            "";

        return;
    }


    /*
       Only the latest 2 transactions.
    */

    const latestTwo =
        transactions.slice(0, 2);


    transactionsContainer.innerHTML =
        latestTwo
            .map(
                (transaction) => {

                    const icon =
                        getTransactionIcon(
                            transaction
                        );

                    const name =
                        getTransactionName(
                            transaction
                        );

                    const amount =
                        getTransactionAmount(
                            transaction
                        );

                    const date =
                        formatTransactionDate(
                            transaction?.createdAt ||
                            transaction?.date ||
                            transaction?.timestamp
                        );

                    const status =
                        transaction?.status ||
                        "Successful";


                    return `
                        <div class="transaction-item">

                            <div class="transaction-icon">
                                ${icon}
                            </div>

                            <div class="transaction-details">

                                <div class="transaction-name">
                                    ${escapeHtml(name)}
                                </div>

                                <div class="transaction-date">
                                    ${escapeHtml(date)}
                                </div>

                            </div>

                            <div class="transaction-right">

                                <div class="transaction-amount">
                                    ${escapeHtml(amount)}
                                </div>

                                <div class="transaction-status">
                                    ${escapeHtml(status)}
                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");


    transactionsSection.hidden =
        false;
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DASHBOARD DATA
========================================================= */

async function loadDashboardData(
    firebaseUser
) {

    /*
       Always show the authenticated user
       immediately.
    */

    displayUser(
        firebaseUser
    );


    /*
       Start with a clean dashboard.
    */

    setBalance(0);

    updateNotificationBadge(0);

    renderTransactions([]);


    try {

        /*
           Firebase ID token proves that the
           logged-in user is authenticated.
        */

        const idToken =
            await firebaseUser.getIdToken();


        const response =
            await fetch(
                DASHBOARD_ENDPOINT,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${idToken}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        /*
           Do NOT expose server errors to
           the user.

           The dashboard simply keeps its
           safe empty state.
        */

        if (!response.ok) {

            console.warn(
                "NovaPay dashboard data is not available yet:",
                response.status
            );

            return;
        }


        const data =
            await response.json();


        /*
           Balance
        */

        const balance =
            data?.balance ??
            data?.walletBalance ??
            data?.user?.balance ??
            data?.data?.balance ??
            data?.data?.walletBalance;


        if (
            balance !== undefined &&
            balance !== null
        ) {

            setBalance(
                balance
            );
        }


        /*
           Notifications
        */

        const notificationCount =
            data?.notificationCount ??
            data?.notificationsCount ??
            data?.notifications?.unreadCount ??
            data?.data?.notificationCount ??
            0;


        updateNotificationBadge(
            notificationCount
        );


        /*
           Transactions
        */

        const transactions =
            getTransactionsFromResponse(
                data
            );


        renderTransactions(
            transactions
        );


    } catch (error) {

        /*
           Do not show technical errors
           to the user.

           Keep the dashboard usable.
        */

        console.warn(
            "NovaPay dashboard data request failed."
        );


        setBalance(0);

        updateNotificationBadge(0);

        renderTransactions([]);
    }
}


/* =========================================================
   FIREBASE AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async (firebaseUser) => {

        if (!firebaseUser) {

            /*
               No valid Firebase session.
               Return to login.
            */

            window.location.replace(
                "login.html"
            );

            return;
        }


        console.log(
            "NovaPay Firebase session active:",
            firebaseUser.uid
        );


        await loadDashboardData(
            firebaseUser
        );
    }
);


/* =========================================================
   STARTUP
========================================================= */

loadTheme();


console.log(
    "NovaPay dashboard loaded."
);


console.log(
    "NovaPay API:",
    API_BASE_URL
);