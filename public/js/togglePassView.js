const passwordToggle = document.getElementById("password-toggle");
const confirmPasswordToggle = document.getElementById("confirm_password-toggle");
const passwordInput = document.getElementById("account_password");
const confirmPasswordInput = document.getElementById("confirm_password");
const passwordIcon = passwordToggle.querySelector("#password-toggle-icon");
const confirmPasswordIcon = confirmPasswordToggle.querySelector("#confirm-password-toggle-icon");

passwordToggle.addEventListener("click", function () {
  const passwordType = passwordInput.getAttribute("type");
  if (passwordType === "password") {
    passwordInput.setAttribute("type", "text");
    passwordIcon.classList.remove("fa-eye");
    passwordIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.setAttribute("type", "password");
    passwordIcon.classList.remove("fa-eye-slash");
    passwordIcon.classList.add("fa-eye");
  }
});

confirmPasswordToggle.addEventListener("click", function () {
  const confirmPasswordType = confirmPasswordInput.getAttribute("type");
  if (confirmPasswordType === "password") {
    confirmPasswordInput.setAttribute("type", "text");
    confirmPasswordIcon.classList.remove("fa-eye");
    confirmPasswordIcon.classList.add("fa-eye-slash");
  } else {
    confirmPasswordInput.setAttribute("type", "password");
    confirmPasswordIcon.classList.remove("fa-eye-slash");
    confirmPasswordIcon.classList.add("fa-eye");
  }
});