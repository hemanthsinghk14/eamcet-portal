/**
 * Authentication Manager - Handles user authentication and session management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.initializeAuth();
    }

    /**
     * Initialize authentication system
     */
    initializeAuth() {
        this.loadUsers();
        this.createDefaultUsers();
        this.setupEventListeners();
    }

    /**
     * Setup authentication event listeners
     */
    setupEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signup-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Show signup screen
        document.getElementById('show-signup')?.addEventListener('click', () => {
            this.showSignupScreen();
        });

        // Show login screen
        document.getElementById('show-login')?.addEventListener('click', () => {
            this.showLoginScreen();
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Role change handler for department field
        document.getElementById('signup-role')?.addEventListener('change', (e) => {
            this.handleRoleChange(e.target.value);
        });
    }

    /**
     * Load users from localStorage
     */
    loadUsers() {
        try {
            this.users = JSON.parse(localStorage.getItem('eamcet_users')) || [];
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    /**
     * Save users to localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem('eamcet_users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    /**
     * Create default users for demo
     */
    createDefaultUsers() {
        if (this.users.length === 0) {
            this.users = [
                {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@svgroup.edu',
                    password: 'admin123',
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
                    name: 'John Smith',
                    email: 'john@svgroup.edu',
                    password: 'staff123',
                    role: 'staff',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 3,
                    name: 'Sarah Johnson',
                    email: 'sarah@svgroup.edu',
                    password: 'staff123',
                    role: 'staff',
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            this.saveUsers();
        }
    }

    /**
     * Handle login process
     */
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showError('login-error', 'Please fill in all fields');
            return;
        }

        const user = this.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password && 
            u.isActive
        );

        if (user) {
            this.currentUser = user;
            this.saveCurrentUser();
            this.showApp();
            this.clearLoginForm();
        } else {
            this.showError('login-error', 'Invalid email or password');
        }
    }

    /**
     * Handle signup process
     */
    handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        if (!name || !email || !password || !role) {
            this.showError('signup-error', 'Please fill in all required fields');
            return;
        }

        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('signup-error', 'An account with this email already exists');
            return;
        }

        if (password.length < 6) {
            this.showError('signup-error', 'Password must be at least 6 characters long');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.showSuccess('Account created successfully! Please sign in.');
        this.showLoginScreen();
        this.clearSignupForm();
    }

    /**
     * Handle role change in signup form
     */
    handleRoleChange(role) {
        // No department handling needed - simplified staff registration
    }

    /**
     * Show signup screen
     */
    showSignupScreen() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('signup-screen').classList.remove('hidden');
        this.clearErrors();
    }

    /**
     * Show login screen
     */
    showLoginScreen() {
        document.getElementById('signup-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        this.clearErrors();
    }

    /**
     * Show main application
     */
    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Update user info in header
        document.getElementById('current-user-name').textContent = this.currentUser.name;
        document.getElementById('current-user-role').textContent = this.capitalizeFirst(this.currentUser.role);
        
        // Initialize appropriate panel based on user role
        if (window.app) {
            if (this.currentUser.role === 'admin') {
                window.app.showAdminPanel();
            } else {
                window.app.showStaffPanel();
            }
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        this.showLoginScreen();
    }

    /**
     * Save current user session
     */
    saveCurrentUser() {
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
    }

    /**
     * Load current user session
     */
    loadCurrentUser() {
        try {
            const savedUser = localStorage.getItem('current_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                // Verify user still exists and is active
                const user = this.users.find(u => u.id === this.currentUser.id && u.isActive);
                if (user) {
                    this.showApp();
                    return true;
                }
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
        return false;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if current user is admin
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    /**
     * Check if current user is staff
     */
    isStaff() {
        return this.currentUser && this.currentUser.role === 'staff';
    }

    /**
     * Clear login form
     */
    clearLoginForm() {
        document.getElementById('login-form').reset();
        this.clearErrors();
    }

    /**
     * Clear signup form
     */
    clearSignupForm() {
        document.getElementById('signup-form').reset();
        this.clearErrors();
    }

    /**
     * Clear all error messages
     */
    clearErrors() {
        this.hideError('login-error');
        this.hideError('signup-error');
    }

    /**
     * Show error message
     */
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    /**
     * Hide error message
     */
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-lg z-50';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get all users (admin only)
     */
    getAllUsers() {
        return this.users.filter(u => u.isActive);
    }

    /**
     * Get users by role
     */
    getUsersByRole(role) {
        return this.users.filter(u => u.role === role && u.isActive);
    }

    /**
     * Update user (admin only)
     */
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
            return true;
        }
        return false;
    }

    /**
     * Deactivate user (admin only)
     */
    deactivateUser(userId) {
        return this.updateUser(userId, { isActive: false });
    }
}

// Create global instance
window.authManager = new AuthManager();
