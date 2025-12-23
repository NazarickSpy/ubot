// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`);
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
                this.updateCartCount();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.getItemCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Load products
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        const container = document.getElementById('featured-products');
        if (container) {
            container.innerHTML = data.products.slice(0, 4).map(product => `
                <div class="product-card">
                    ${product.stock < 10 ? '<div class="product-badge">Low Stock!</div>' : ''}
                    <div class="product-image">
                        <i class="fas fa-gamepad"></i>
                    </div>
                    <div class="product-content">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-price">
                            <span class="price-current">Rp ${product.price.toLocaleString()}</span>
                            ${product.originalPrice ? `
                                <span class="price-original">Rp ${product.originalPrice.toLocaleString()}</span>
                            ` : ''}
                        </div>
                        
                        <div class="product-features">
                            ${product.features.map(feature => `
                                <div class="feature-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="product-stock">
                            <span class="stock-status ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}">
                                ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                            <span>Stock: ${product.stock}</span>
                        </div>
                        
                        <button 
                            class="add-to-cart"
                            onclick="cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})"
                            ${product.stock === 0 ? 'disabled' : ''}
                        >
                            <i class="fas fa-shopping-cart"></i>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// User authentication
class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.updateUserDisplay();
    }

    login(email, password) {
        // For demo purposes - in real app, verify against database
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUserDisplay();
            return true;
        }
        return false;
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        const newUser = {
            ...userData,
            id: Date.now().toString(),
            role: 'user',
            balance: 0,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.updateUserDisplay();
        
        return { success: true, user: newUser };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserDisplay();
    }

    updateUserDisplay() {
        const userBtn = document.querySelector('.user-btn span');
        if (userBtn) {
            if (this.currentUser) {
                userBtn.textContent = this.currentUser.username || 'User';
                
                // Show admin link if user is admin
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
                });
            } else {
                userBtn.textContent = 'Guest';
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
            }
        }
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    isLoggedIn() {
        return !!this.currentUser;
    }
}

const auth = new Auth();

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Load products
    loadProducts();
    
    // Check if user is admin and on admin page
    if (window.location.pathname.includes('admin.html') && !auth.isAdmin()) {
        window.location.href = 'login.html?redirect=admin.html';
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// Initialize demo data if not exists
function initializeDemoData() {
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            {
                id: '1',
                username: 'admin',
                email: 'admin@loukys.store',
                password: 'admin123', // In real app, hash this password
                role: 'admin',
                balance: 1000000,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
    
    if (!localStorage.getItem('products')) {
        const demoProducts = {
            products: [
                {
                    id: 'vip7d',
                    name: 'VIP 7 Days',
                    description: 'Redfinger VIP Code 7 Days Access',
                    price: 20000,
                    originalPrice: 25000,
                    stock: 150,
                    type: 'VIP7D',
                    features: ['Premium Access', 'No Ads', 'Priority Support', 'Auto-renewal']
                },
                {
                    id: 'vip30d',
                    name: 'VIP 30 Days',
                    description: 'Redfinger VIP Code 30 Days Access',
                    price: 60000,
                    originalPrice: 75000,
                    stock: 85,
                    type: 'VIP30D',
                    features: ['All VIP Features', '24/7 Support', 'Exclusive Content', 'Priority Queue']
                },
                {
                    id: 'vip90d',
                    name: 'VIP 90 Days',
                    description: 'Redfinger VIP Code 90 Days Access',
                    price: 150000,
                    originalPrice: 180000,
                    stock: 30,
                    type: 'VIP90D',
                    features: ['Best Value', 'All Features', 'Priority Everything', 'Dedicated Support']
                },
                {
                    id: 'vip365d',
                    name: 'VIP 365 Days',
                    description: 'Redfinger VIP Code 1 Year Access',
                    price: 500000,
                    originalPrice: 600000,
                    stock: 15,
                    type: 'VIP365D',
                    features: ['Ultimate Package', 'Lifetime Updates', 'VIP Badge', 'Custom Support']
                }
            ]
        };
        localStorage.setItem('products', JSON.stringify(demoProducts));
    }
}

// Call initialization
initializeDemoData();
