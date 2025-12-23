// Admin functionality
class Admin {
    constructor() {
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentOrders();
        this.loadStock();
        this.setupEventListeners();
    }

    loadStats() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        
        // Calculate totals
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalUsers = users.length;
        const lowStock = products.products?.filter(p => p.stock < 10).length || 0;
        
        // Update DOM
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-revenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('low-stock').textContent = lowStock;
    }

    loadRecentOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        const container = document.getElementById('recent-orders');
        if (!container) return;
        
        // Get last 5 orders
        const recentOrders = orders.slice(-5).reverse();
        
        let html = '';
        
        recentOrders.forEach(order => {
            const user = users.find(u => u.id === order.userId) || { username: 'Guest' };
            const statusClass = order.status === 'completed' ? 'status-completed' : 
                              order.status === 'pending' ? 'status-pending' : 'status-cancelled';
            
            html += `
                <tr>
                    <td class="order-id">${order.id}</td>
                    <td>${user.username}</td>
                    <td class="order-amount">Rp ${order.total?.toLocaleString() || '0'}</td>
                    <td>
                        <span class="order-status ${statusClass}">
                            ${order.status}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        if (recentOrders.length === 0) {
            html = `
                <tr>
                    <td colspan="4" class="no-orders">
                        <i class="fas fa-shopping-bag"></i>
                        <p>No orders yet</p>
                    </td>
                </tr>
            `;
        }
        
        container.innerHTML = html;
    }

    loadStock() {
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        const container = document.getElementById('stock-list');
        
        if (!container) return;
        
        let html = '';
        
        products.products?.forEach(product => {
            const stockClass = product.stock > 10 ? 'stock-ok' : 
                             product.stock > 0 ? 'stock-low' : 'stock-out';
            
            html += `
                <div class="stock-item">
                    <div class="stock-info">
                        <h4>${product.name}</h4>
                        <p>Stock: <span class="${stockClass}">${product.stock}</span></p>
                    </div>
                    <div class="stock-actions">
                        <button class="btn-small" onclick="admin.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-small btn-danger" onclick="admin.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        if (products.products?.length === 0) {
            html = `
                <div class="no-stock">
                    <i class="fas fa-box-open"></i>
                    <p>No products found</p>
                    <button class="btn btn-primary" onclick="addProduct()">
                        <i class="fas fa-plus"></i>
                        Add First Product
                    </button>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    editProduct(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        const product = products.products.find(p => p.id === productId);
        
        if (!product) return;
        
        // Fill form
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-desc').value = product.description || '';
        document.getElementById('product-features').value = product.features?.join(', ') || '';
        
        // Show modal
        this.showProductModal(productId);
    }

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        products.products = products.products.filter(p => p.id !== productId);
        
        localStorage.setItem('products', JSON.stringify(products));
        
        // Reload data
        this.loadStats();
        this.loadStock();
        
        alert('Product deleted successfully!');
    }

    showProductModal(editId = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = modal.querySelector('h2');
        
        if (editId) {
            title.textContent = 'Edit Product';
            form.dataset.editId = editId;
        } else {
            title.textContent = 'Add Product';
            delete form.dataset.editId;
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    hideProductModal() {
        document.getElementById('product-modal').style.display = 'none';
    }

    saveProduct(formData) {
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        
        if (formData.editId) {
            // Edit existing product
            const index = products.products.findIndex(p => p.id === formData.editId);
            if (index !== -1) {
                products.products[index] = {
                    ...products.products[index],
                    ...formData
                };
            }
        } else {
            // Add new product
            const newProduct = {
                id: `prod-${Date.now()}`,
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f),
                createdAt: new Date().toISOString()
            };
            
            products.products.push(newProduct);
        }
        
        localStorage.setItem('products', JSON.stringify(products));
        
        // Reload data
        this.loadStats();
        this.loadStock();
        
        this.hideProductModal();
        alert('Product saved successfully!');
    }

    setupEventListeners() {
        // Product form submit
        const form = document.getElementById('product-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = {
                    name: document.getElementById('product-name').value,
                    price: parseInt(document.getElementById('product-price').value),
                    stock: parseInt(document.getElementById('product-stock').value),
                    description: document.getElementById('product-desc').value,
                    features: document.getElementById('product-features').value
                };
                
                if (form.dataset.editId) {
                    formData.editId = form.dataset.editId;
                }
                
                this.saveProduct(formData);
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideProductModal();
            });
        });
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('product-modal');
            if (e.target === modal) {
                this.hideProductModal();
            }
        });
    }

    // Admin actions
    restockProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        
        products.products.forEach(product => {
            if (product.stock < 10) {
                product.stock += 50;
            }
        });
        
        localStorage.setItem('products', JSON.stringify(products));
        
        this.loadStats();
        this.loadStock();
        
        alert('Products restocked successfully!');
    }

    generateReport() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || { products: [] };
        
        const report = {
            generatedAt: new Date().toISOString(),
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
            totalUsers: users.length,
            totalProducts: products.products?.length || 0,
            lowStockProducts: products.products?.filter(p => p.stock < 10).length || 0,
            recentOrders: orders.slice(-10)
        };
        
        // Create downloadable JSON file
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `loukys-report-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Report generated and downloaded!');
    }

    backupData() {
        const backup = {
            timestamp: new Date().toISOString(),
            users: JSON.parse(localStorage.getItem('users')) || [],
            products: JSON.parse(localStorage.getItem('products')) || { products: [] },
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            cart: JSON.parse(localStorage.getItem('cart')) || []
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `loukys-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Data backup downloaded successfully!');
    }

    clearOrders() {
        if (!confirm('This will delete all orders older than 30 days. Continue?')) return;
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date || order.createdAt);
            return orderDate > thirtyDaysAgo;
        });
        
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        
        this.loadStats();
        this.loadRecentOrders();
        
        alert(`Cleared ${orders.length - filteredOrders.length} old orders.`);
    }
}

// Initialize admin
const admin = new Admin();

// Global functions for onclick handlers
function addProduct() {
    admin.showProductModal();
                                               }
