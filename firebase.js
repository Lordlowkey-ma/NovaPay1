import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBH9VlIMaHSlPnqlxyJ2uwPQ4pJWP_ceNY",
  authDomain: "novapay1.firebaseapp.com",
  projectId: "novapay1",
  storageBucket: "novapay1.firebasestorage.app",
  messagingSenderId: "443619986241",
  appId: "1:443619986241:web:f209cc544f184bca012fc0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;