// Authentication System
class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.updateUserDisplay();
        this.setupEventListeners();
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUserDisplay();
            this.showNotification('Login successful!', 'success');
            return true;
        }
        
        this.showNotification('Invalid email or password', 'error');
        return false;
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Validation
        if (!userData.username || !userData.email || !userData.password) {
            this.showNotification('Please fill all fields', 'error');
            return false;
        }
        
        if (users.some(u => u.email === userData.email)) {
            this.showNotification('Email already registered', 'error');
            return false;
        }
        
        if (userData.password !== userData.confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }
        
        if (userData.password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }
        
        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: 'user',
            balance: 0,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        this.updateUserDisplay();
        this.showNotification('Registration successful!', 'success');
        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserDisplay();
        this.showNotification('Logged out successfully', 'success');
        return true;
    }

    updateUserDisplay() {
        const userBtn = document.querySelector('.user-btn span');
        const userMenu = document.querySelector('.user-dropdown');
        
        if (userBtn && userMenu) {
            if (this.currentUser) {
                userBtn.textContent = this.currentUser.username;
                
                // Update menu
                const menuHtml = `
                    <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="dashboard.html?tab=orders"><i class="fas fa-shopping-bag"></i> My Orders</a>
                    <a href="dashboard.html?tab=profile"><i class="fas fa-user"></i> Profile</a>
                    ${this.currentUser.role === 'admin' ? 
                        '<a href="admin.html" class="admin-only"><i class="fas fa-crown"></i> Admin Panel</a>' : ''}
                    <hr>
                    <a href="#" onclick="auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                `;
                
                userMenu.querySelector('.dropdown-menu').innerHTML = menuHtml;
            } else {
                userBtn.textContent = 'Guest';
                const menuHtml = `
                    <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
                    <a href="register.html"><i class="fas fa-user-plus"></i> Register</a>
                `;
                userMenu.querySelector('.dropdown-menu').innerHTML = menuHtml;
            }
        }
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('[name="email"]').value;
                const password = loginForm.querySelector('[name="password"]').value;
                
                if (this.login(email, password)) {
                    const redirect = new URLSearchParams(window.location.search).get('redirect');
                    setTimeout(() => {
                        window.location.href = redirect || 'dashboard.html';
                    }, 1000);
                }
            });
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    username: registerForm.querySelector('[name="username"]').value,
                    email: registerForm.querySelector('[name="email"]').value,
                    password: registerForm.querySelector('[name="password"]').value,
                    confirmPassword: registerForm.querySelector('[name="confirmPassword"]').value
                };
                
                if (this.register(formData)) {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            });
        }
        
        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = toggle.previousElementSibling;
                const icon = toggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }
}

// Initialize auth
const auth = new Auth();
