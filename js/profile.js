document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();

    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    const currentUser = getCurrentUser();

    if (profileUsername) {
        profileUsername.textContent = currentUser && currentUser.username ? currentUser.username : 'Not available';
    }

    if (profileEmail) {
        profileEmail.textContent = currentUser && currentUser.email ? currentUser.email : 'Not available';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            logoutUser();
        });
    }
});
