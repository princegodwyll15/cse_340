  // This script toggles the visibility of the password input field
// and changes the icon accordingly.
// This code is part of the account management system for a web application.
//on the account registration and login pages.
  const passwordToggle = document.getElementById("password-toggle");
  const passwordInput = document.getElementById("account_password");
  const icon = passwordToggle.querySelector("i");

  passwordToggle.addEventListener("click", function () {
    const passwordType = passwordInput.getAttribute("type");
    if (passwordType === "password") {
      passwordInput.setAttribute("type", "text");
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.setAttribute("type", "password");
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
