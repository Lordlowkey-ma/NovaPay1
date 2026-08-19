/* ================================
   NOVAPAY HOME PAGE
================================ */


/* Mobile Menu */

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

menuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});


/* Close mobile menu after clicking a link */

const mobileLinks = mobileMenu.querySelectorAll("a");

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
});


/* Theme */

const themeButton = document.getElementById("themeButton");

themeButton.addEventListener("click", () => {

  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  themeButton.textContent = isLight ? "☀" : "☾";

  localStorage.setItem(
    "novapay-theme",
    isLight ? "light" : "dark"
  );
});


/* Remember selected theme */

const savedTheme = localStorage.getItem("novapay-theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
  themeButton.textContent = "☀";
}


/* Prevent unfinished links from jumping */

const unfinishedLinks = document.querySelectorAll('a[href="#"]');

unfinishedLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});