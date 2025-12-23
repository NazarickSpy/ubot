// Cart Management System
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || 'default.jpg',
                quantity: 1,
                stock: product.stock
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
        return true;
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.showNotification('Item removed from cart', 'info');
        return true;
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        
        if (!item) return false;
        
        if (quantity < 1) {
            return this.removeItem(productId);
        }
        
        if (item.stock && quantity > item.stock) {
            this.showNotification(`Only ${item.stock} items available`, 'error');
            return false;
        }
        
        item.quantity = quantity;
        this.saveCart();
        this.updateCartCount();
        return true;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        return true;
    }

    getCart() {
        return this.cart;
    }

    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.getItemCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    loadCartPage() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <a href="products.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i>
                        Browse Products
                    </a>
                </div>
            `;
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="assets/images/products/${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">Rp ${item.price.toLocaleString()} each</p>
                        
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn minus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="${item.stock || 99}" 
                                       onchange="cartManager.updateQuantity('${item.id}', this.value)">
                                <button class="quantity-btn plus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="cartManager.removeItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                                Remove
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <span>Rp ${itemTotal.toLocaleString()}</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Update summary
        const summaryHtml = `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>Rp ${subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Service Fee</span>
                    <span>Rp 0</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>Rp ${subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-actions">
                    <a href="products.html" class="btn btn-outline">
                        <i class="fas fa-arrow-left"></i>
                        Continue Shopping
                    </a>
                    <a href="checkout.html" class="btn btn-primary" ${this.cart.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        Proceed to Checkout
                    </a>
                </div>
            </div>
        `;
        
        const summaryContainer = document.getElementById('cart-summary-container');
        if (summaryContainer) {
            summaryContainer.innerHTML = summaryHtml;
        }
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
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });
    }

    setupEventListeners() {
        // Load cart page if on cart page
        if (window.location.pathname.includes('cart.html')) {
            this.loadCartPage();
        }
        
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const productId = button.dataset.id;
                
                // In real app, fetch product data
                const product = {
                    id: productId,
                    name: button.dataset.name,
                    price: parseInt(button.dataset.price),
                    stock: parseInt(button.dataset.stock)
                };
                
                this.addItem(product);
            }
        });
    }
}

// Initialize cart manager
const cartManager = new CartManager();
