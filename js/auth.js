(function (global) {
    const USER_STORAGE_KEY = 'trustVaultUsers';
    const SESSION_STORAGE_KEY = 'trustVaultActiveSession';
    const SESSION_STORAGE_TYPE = 'trustVaultSessionType';

    function safeParse(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    function getUsers() {
        try {
            const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
            if (!storedUsers) {
                return [];
            }

            const parsedUsers = safeParse(storedUsers);
            return Array.isArray(parsedUsers) ? parsedUsers : [];
        } catch (error) {
            console.warn('Unable to read users from storage:', error);
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    }

    function createUserId() {
        return 'user-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
    }

    function normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function normalizeUsername(username) {
        return String(username || '').trim();
    }

    function hashPassword(password) {
        const salt = 'trustvault-auth-v1';
        const input = salt + ':' + String(password || '');
        let hash = 0;

        for (let index = 0; index < input.length; index += 1) {
            hash = (hash << 5) - hash + input.charCodeAt(index);
            hash = hash & hash;
        }

        return 'hash-' + (hash >>> 0).toString(36);
    }

    function getActiveSession() {
        try {
            const localSession = localStorage.getItem(SESSION_STORAGE_KEY);
            if (localSession) {
                return safeParse(localSession);
            }

            const sessionSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionSession) {
                return safeParse(sessionSession);
            }
        } catch (error) {
            console.warn('Unable to read active session:', error);
        }

        return null;
    }

    function persistSession(sessionData) {
        const isPersistent = Boolean(sessionData && sessionData.rememberMe);

        if (isPersistent) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.setItem(SESSION_STORAGE_TYPE, 'persistent');
        } else {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
            localStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.setItem(SESSION_STORAGE_TYPE, 'session');
        }
    }

    function clearSession() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_TYPE);
    }

    function registerUser(username, email, password) {
        const normalizedUsername = normalizeUsername(username);
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedUsername || !normalizedEmail || !String(password || '').trim()) {
            return { success: false, message: 'Please complete all required fields.' };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        const users = getUsers();
        const duplicateUser = users.find(function (user) {
            return String(user.email || '').toLowerCase() === normalizedEmail;
        });

        if (duplicateUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser = {
            id: createUserId(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        return {
            success: true,
            message: 'Account created successfully. Please sign in.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        };
    }

    function loginUser(email, password, rememberMe) {
        const normalizedEmail = normalizeEmail(email);
        const trimmedPassword = String(password || '').trim();

        if (!normalizedEmail || !trimmedPassword) {
            return { success: false, message: 'Please enter your email and password.' };
        }

        const users = getUsers();
        const matchedUser = users.find(function (user) {
            return String(user.email || '').toLowerCase() === normalizedEmail;
        });

        if (!matchedUser) {
            return { success: false, message: 'No account found for this email.' };
        }

        if (hashPassword(trimmedPassword) !== matchedUser.password) {
            return { success: false, message: 'The password you entered is incorrect.' };
        }

        const sessionData = {
            id: matchedUser.id,
            username: matchedUser.username,
            email: matchedUser.email,
            rememberMe: Boolean(rememberMe),
            loggedInAt: new Date().toISOString()
        };

        persistSession(sessionData);

        return {
            success: true,
            message: 'Login successful.',
            user: sessionData
        };
    }

    function logoutUser() {
        clearSession();
        global.location.replace('login.html');
        return true;
    }

    function getCurrentUser() {
        return getActiveSession();
    }

    function checkAuthStatus() {
        const currentPath = global.location.pathname.split('/').pop() || '';
        const publicPages = ['login.html', 'register.html'];

        const session = getActiveSession();
        if (session) {
            return true;
        }

        if (!publicPages.includes(currentPath)) {
            global.location.replace('login.html');
        }

        return false;
    }

    global.TrustVaultAuth = {
        registerUser: registerUser,
        loginUser: loginUser,
        logoutUser: logoutUser,
        checkAuthStatus: checkAuthStatus,
        getCurrentUser: getCurrentUser
    };

    global.registerUser = registerUser;
    global.loginUser = loginUser;
    global.logoutUser = logoutUser;
    global.checkAuthStatus = checkAuthStatus;
    global.getCurrentUser = getCurrentUser;
})(window);
