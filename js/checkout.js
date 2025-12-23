// Checkout functionality
class Checkout {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentStep = 1;
        this.paymentMethod = 'qris';
        this.orderId = null;
        this.timer = 900; // 15 minutes
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.loadCartItems();
        this.setupEventListeners();
    }

    loadCartItems() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to continue</p>
                    <a href="products.html" class="btn btn-primary">Shop Now</a>
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
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Rp ${item.price.toLocaleString()} × ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button onclick="checkout.decreaseQuantity('${item.id}')">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="checkout.increaseQuantity('${item.id}')">+</button>
                        </div>
                        <span class="cart-item-total">Rp ${itemTotal.toLocaleString()}</span>
                        <button class="remove-item" onclick="checkout.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        
        // Update totals
        document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
        document.getElementById('total').textContent = `Rp ${subtotal.toLocaleString()}`;
    }

    increaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.saveCart();
            this.loadCartItems();
        }
    }

    decreaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            this.saveCart();
            this.loadCartItems();
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.loadCartItems();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        cart.updateCartCount();
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                this.paymentMethod = method.querySelector('h3').textContent.toLowerCase();
            });
        });

        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('qr-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    processPayment() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Check if user is logged in
        const auth = new Auth();
        if (!auth.isLoggedIn()) {
            if (confirm('You need to login to continue. Go to login page?')) {
                window.location.href = 'login.html?redirect=checkout.html';
            }
            return;
        }

        // Generate order ID
        this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Calculate total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Generate QR code
        this.generateQRCode(total);
        
        // Show modal
        this.showModal(total);
        
        // Start timer
        this.startTimer();
        
        // Simulate payment processing
        this.simulatePayment();
    }

    generateQRCode(amount) {
        const qrCanvas = document.getElementById('qr-code');
        if (!qrCanvas) return;

        // Create QR code with payment info
        const qrData = `LoukysStore:${this.orderId}:${amount}:${Date.now()}`;
        
        // Use QRious library
        const qr = new QRious({
            element: qrCanvas,
            value: qrData,
            size: 200,
            background: 'white',
            foreground: 'black',
            level: 'H'
        });
    }

    showModal(amount) {
        const modal = document.getElementById('qr-modal');
        const orderIdElem = document.getElementById('order-id');
        const amountElem = document.getElementById('payment-amount');

        if (orderIdElem) orderIdElem.textContent = this.orderId;
        if (amountElem) amountElem.textContent = `Rp ${amount.toLocaleString()}`;

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('qr-modal');
        modal.style.display = 'none';
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    startTimer() {
        this.timer = 900; // Reset to 15 minutes
        const timerElem = document.getElementById('timer');
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            
            if (timerElem) {
                timerElem.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timerElem.className = this.timer < 60 ? 'timer warning' : 'timer';
            }
            
            if (this.timer <= 0) {
                this.paymentExpired();
            }
        }, 1000);
    }

    simulatePayment() {
        // Simulate payment verification
        setTimeout(() => {
            // Random success (80% success rate for demo)
            if (Math.random() > 0.2) {
                this.paymentSuccess();
            }
        }, 5000);
    }

    paymentSuccess() {
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Create order
        this.createOrder();
        
        // Show success message
        alert('Payment successful! Your code has been delivered. Check your dashboard.');
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        
        // Close modal
        this.closeModal();
        
        // Redirect to success page
        window.location.href = 'dashboard.html?success=true';
    }

    paymentExpired() {
        alert('Payment session expired. Please try again.');
        this.closeModal();
    }

    createOrder() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const user = JSON.parse(localStorage.getItem('currentUser'));
        
        const order = {
            id: this.orderId,
            userId: user?.id || 'guest',
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            paymentMethod: this.paymentMethod,
            status: 'completed',
            date: new Date().toISOString(),
            code: this.generateCode()
        };
        
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Update product stock
        this.updateStock();
    }

    generateCode() {
        // Generate random code (in real app, use actual codes from database)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    updateStock() {
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        
        this.cart.forEach(cartItem => {
            const product = products.products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
                if (product.stock < 0) product.stock = 0;
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Initialize checkout
const checkout = new Checkout();

// Global functions for onclick handlers
function processPayment() {
    checkout.processPayment();
                                         }
