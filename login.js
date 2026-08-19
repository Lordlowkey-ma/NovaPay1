/* =====================================================
   NOVAPAY — LOGIN PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    return;
  }


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const email =
    document.getElementById("loginEmail");

  const password =
    document.getElementById("loginPassword");

  const emailError =
    document.getElementById("loginEmailError");

  const passwordError =
    document.getElementById("loginPasswordError");

  const loginButton =
    document.getElementById("loginButton");

  const showPassword =
    document.getElementById("loginShowPassword");

  const forgotPassword =
    document.getElementById("forgotPassword");

  const themeButton =
    document.getElementById("loginTheme");


  /* =====================================================
     SHOW / HIDE PASSWORD
  ===================================================== */

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


  /* =====================================================
     CLEAR ERRORS
  ===================================================== */

  function clearErrors() {

    emailError.textContent = "";
    passwordError.textContent = "";

  }


  /* =====================================================
     EMAIL VALIDATION
  ===================================================== */

  function validEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  }


  /* =====================================================
     LOGIN
  ===================================================== */

  loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();

    let valid = true;

    const emailValue =
      email.value.trim();

    const passwordValue =
      password.value;


    /* Email */

    if (emailValue === "") {

      emailError.textContent =
        "Please enter your email address.";

      valid = false;

    } else if (!validEmail(emailValue)) {

      emailError.textContent =
        "Please enter a valid email address.";

      valid = false;

    }


    /* Password */

    if (passwordValue === "") {

      passwordError.textContent =
        "Please enter your password.";

      valid = false;

    } else if (passwordValue.length < 8) {

      passwordError.textContent =
        "Password must be at least 8 characters.";

      valid = false;

    }


    if (!valid) {
      return;
    }


    /* =================================================
       BACKEND NOT CONNECTED YET

       Firebase Authentication will be connected
       here later.

       We do NOT store passwords in:
       - localStorage
       - sessionStorage
       - cookies
       - our database
    ================================================= */

    loginButton.disabled = true;

    loginButton.querySelector("span:first-child").textContent =
      "Checking...";


    setTimeout(function () {

      loginButton.disabled = false;

      loginButton.querySelector("span:first-child").textContent =
        "Login";

      passwordError.textContent =
        "Authentication will be connected when the backend is ready.";

    }, 700);

  });


  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  if (forgotPassword) {

    forgotPassword.addEventListener("click", function (event) {

      event.preventDefault();

      clearErrors();

      const emailValue =
        email.value.trim();


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


      /*
        Firebase password-reset email will be connected
        here later.
      */

      emailError.textContent =
        "Password reset will be available when authentication is connected.";

    });

  }


  /* =====================================================
     THEME
  ===================================================== */

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
    "NovaPay login frontend loaded successfully."
  );

});