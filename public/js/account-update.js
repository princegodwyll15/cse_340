const form = document.querySelector("#edit-account-form")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("#updateBtn")
    // Enable the update button when a change is detected in the form
    updateBtn.removeAttribute("disabled")
})


const passwordUpdateForm = document.querySelector("#update-password-form")
passwordUpdateForm.addEventListener("change", function () {
    const updatePasswordBtn = document.querySelector("#updatePasswordBtn")
    // Enable the update password button when a change is detected in the form
    updatePasswordBtn.removeAttribute("disabled")
})