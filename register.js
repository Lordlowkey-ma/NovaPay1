document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     ELEMENTS
  ========================================= */

  const form = document.getElementById("registerForm");

  const stepOne = document.getElementById("registerStepOne");
  const stepTwo = document.getElementById("registerStepTwo");

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
     MAKE SURE EVERYTHING EXISTS
  ========================================= */

  if (!form || !stepOne || !stepTwo || !continueButton) {
    console.error("NovaPay registration elements are missing.");
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
     CLEAR ERROR
  ========================================= */

  function clearErrors() {

    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    termsError.textContent = "";

  }


  /* =========================================
     CONTINUE BUTTON
  ========================================= */

  continueButton.addEventListener("click", function () {

    clearErrors();

    let valid = true;


    /* Username */

    const usernameValue =
      username.value.trim();


    if (usernameValue === "") {

      usernameError.textContent =
        "Please enter your username.";

      valid = false;

    } else if (usernameValue.length < 3) {

      usernameError.textContent =
        "Username must be at least 3 characters.";

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
      email.value.trim();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (emailValue === "") {

      emailError.textContent =
        "Please enter your email address.";

      valid = false;

    } else if (!emailPattern.test(emailValue)) {

      emailError.textContent =
        "Please enter a valid email address.";

      valid = false;

    }


    /* Stop if invalid */

    if (!valid) {
      return;
    }


    /* =========================================
       STEP 1 → STEP 2
    ========================================= */

    continueButton.disabled = true;

    stepOne.classList.add("fade-out");


    setTimeout(function () {

      stepOne.hidden = true;

      stepTwo.hidden = false;

      stepTwo.classList.remove("fade-in");

      /*
        Force browser to recognize the new state
        before starting animation.
      */

      void stepTwo.offsetWidth;

      stepTwo.classList.add("fade-in");

      stepLabel.textContent = "STEP 2";

      /*
        Put cursor automatically in password.
      */

      password.focus();

    }, 300);

  });


  /* =========================================
     SHOW / HIDE PASSWORD
  ========================================= */

  const passwordButtons =
    document.querySelectorAll(".show-password");


  passwordButtons.forEach(function (button) {

    button.addEventListener("click", function () {

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

    });

  });


  /* =========================================
     REGISTER BUTTON
  ========================================= */

  form.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();

    let valid = true;


    /* Password */

    if (password.value.length < 8) {

      passwordError.textContent =
        "Password must be at least 8 characters.";

      valid = false;

    }


    /* Confirm password */

    if (
      confirmPassword.value === ""
    ) {

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


    /*
      Firebase will be connected here later.

      DO NOT store the password in localStorage.
      DO NOT send the password to our own database.
    */

    console.log("NovaPay registration form validated.");

    alert(
      "Your registration details are valid. Firebase authentication will be connected next."
    );

  });


  /* =========================================
     THEME
  ========================================= */

  if (registerTheme) {

    registerTheme.addEventListener("click", function () {

      document.body.classList.toggle("light");

      const lightMode =
        document.body.classList.contains("light");

      registerTheme.textContent =
        lightMode ? "☀" : "☾";

      localStorage.setItem(
        "novapay-theme",
        lightMode ? "light" : "dark"
      );

    });


    const savedTheme =
      localStorage.getItem("novapay-theme");


    if (savedTheme === "light") {

      document.body.classList.add("light");

      registerTheme.textContent = "☀";

    }

  }


  console.log("NovaPay registration JavaScript loaded successfully.");

});