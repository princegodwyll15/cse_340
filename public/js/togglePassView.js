// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('account_password');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the eye icon between eye and eye-slash
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash';
        });
    }
});