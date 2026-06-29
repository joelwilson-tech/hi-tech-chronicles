// auth.js
// Handles authentication logic (Admin login)

let currentFirebaseUser = null;

const AuthManager = {
    init: () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const auth = FirebaseManager.getAuth();
            FirebaseManager.api.onAuthStateChanged(auth, (user) => {
                currentFirebaseUser = user;
                // If on admin dashboard and logged out, redirect
                if (!user && window.location.hash === '#admin-dashboard') {
                    window.location.hash = '#admin';
                }
            });
        }
    },

    isAuthenticated: () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            return !!currentFirebaseUser;
        }
        // Fallback to sessionStorage
        return sessionStorage.getItem('htc_admin_auth') === 'true';
    },

    login: async (email, password) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const auth = FirebaseManager.getAuth();
                await FirebaseManager.api.signInWithEmailAndPassword(auth, email, password);
                return true;
            } catch (error) {
                console.error("Firebase login failed:", error);
                return false;
            }
        } else {
            // Local fallback (we check password against 'admin', ignore email)
            if (password === 'admin') {
                sessionStorage.setItem('htc_admin_auth', 'true');
                return true;
            }
            return false;
        }
    },

    logout: async () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const auth = FirebaseManager.getAuth();
            await FirebaseManager.api.signOut(auth);
        } else {
            sessionStorage.removeItem('htc_admin_auth');
        }
        window.location.hash = '#home';
        if(typeof Utils !== 'undefined') Utils.showToast('Logged out successfully');
    }
};
