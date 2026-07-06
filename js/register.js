document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showMessage(authMessage, 'Passwords do not match.', 'error');
                return;
            }

            const result = registerUser(username, email, password);

            if (!result.success) {
                showMessage(authMessage, result.message, 'error');
                return;
            }

            showMessage(authMessage, 'Account created successfully. Redirecting to sign in...', 'success');
            window.setTimeout(function () {
                window.location.assign('login.html');
            }, 500);
        });
    }
});

function showMessage(element, text, type) {
    if (!element) {
        return;
    }

    element.textContent = text;
    element.className = 'message ' + type;
}
