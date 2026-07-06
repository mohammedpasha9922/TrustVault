document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const authMessage = document.getElementById('authMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const result = loginUser(email, password, rememberMe);

            if (!result.success) {
                showMessage(authMessage, result.message, 'error');
                return;
            }

            showMessage(authMessage, 'Login successful. Redirecting...', 'success');
            window.setTimeout(function () {
                window.location.assign('dashboard.html');
            }, 400);
        });
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function () {
            showMessage(authMessage, 'Password reset is unavailable in the demo. Please use a registered account or create a new one.', 'error');
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
