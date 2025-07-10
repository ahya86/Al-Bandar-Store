/**
 * Unified Cart Management System for Bandar Store
 * Provides consistent cart functionality across all pages
 */

class BandarCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('bandarStoreCart')) || [];
        this.isArabic = true;
        this.baseDeliveryFee = 2;
        this.freeShippingThreshold = 5; // Free shipping when 5+ items
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.updateCartBadge();
        this.attachEventListeners();
        this.ensureCartClosed(); // Ensure cart is closed on page load
    }

    attachEventListeners() {
        // Cart icon click handlers
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            // Remove any existing listeners first
            cartIcon.removeEventListener('click', this.cartIconClickHandler);
            // Create bound handler
            this.cartIconClickHandler = (e) => {
                e.stopPropagation();
                this.toggleCart();
            };
            cartIcon.addEventListener('click', this.cartIconClickHandler);
        }

        // Close cart handlers
        const closeCartBtn = document.getElementById('closeCartBtn') || document.getElementById('closeCart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.closeCart();
            });
        }

        // Backdrop/overlay handlers
        const backdrop = document.getElementById('cartBackdrop') || document.getElementById('overlay');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeCart());
        }

        // Clear cart button removed

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartContainer = document.querySelector('.cart-container');
            const cartDropdown = document.getElementById('cartDropdown');
            const cartModal = document.getElementById('cartModal');

            // Check if click is outside cart AND not on cart-related elements
            const isOutsideCart = cartContainer && !cartContainer.contains(e.target);
            const isOutsideDropdown = cartDropdown && !cartDropdown.contains(e.target);
            const isOutsideModal = cartModal && !cartModal.contains(e.target);

            // Don't close if clicking on quantity buttons or cart controls
            const isCartControl = e.target.closest('.quantity-btn, .cart-qty-btn, .remove-item-btn, .remove-item, .cart-item-controls, .cart-item-actions');

            if (isOutsideCart && isOutsideDropdown && isOutsideModal && !isCartControl) {
                if (cartDropdown && cartDropdown.classList.contains('show')) {
                    cartDropdown.classList.remove('show');
                    this.closeCart();
                }
                if (cartModal && cartModal.classList.contains('active')) {
                    cartModal.classList.remove('active');
                    this.closeCart();
                }
            }
        });
    }

    toggleCart() {
        const cartDropdown = document.getElementById('cartDropdown');
        const cartModal = document.getElementById('cartModal');
        const backdrop = document.getElementById('cartBackdrop') || document.getElementById('overlay');

        if (cartDropdown) {
            cartDropdown.classList.toggle('show');
            if (backdrop) backdrop.classList.toggle('show');
            if (cartDropdown.classList.contains('show')) {
                document.body.classList.add('cart-open');
                document.body.style.overflow = 'hidden';
            } else {
                document.body.classList.remove('cart-open');
                document.body.style.overflow = 'auto';
            }
        } else if (cartModal) {
            cartModal.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartDropdown = document.getElementById('cartDropdown');
        const cartModal = document.getElementById('cartModal');
        const backdrop = document.getElementById('cartBackdrop') || document.getElementById('overlay');

        if (cartDropdown) {
            cartDropdown.classList.remove('show');
        }
        if (cartModal) {
            cartModal.classList.remove('active');
        }
        if (backdrop) {
            backdrop.classList.remove('show', 'active');
        }
        document.body.classList.remove('cart-open');
        document.body.style.overflow = 'auto';
    }

    ensureCartClosed() {
        // Force close cart on page load to prevent auto-opening issues
        const cartDropdown = document.getElementById('cartDropdown');
        const cartModal = document.getElementById('cartModal');
        const backdrop = document.getElementById('cartBackdrop') || document.getElementById('overlay');

        if (cartDropdown) {
            cartDropdown.classList.remove('show');
            cartDropdown.style.display = 'flex'; // Ensure proper display
        }
        if (cartModal) {
            cartModal.classList.remove('active');
        }
        if (backdrop) {
            backdrop.classList.remove('show', 'active');
            backdrop.style.display = 'none';
        }
        document.body.classList.remove('cart-open');
        document.body.style.overflow = 'auto';
    }

    addToCart(productData) {
        const product = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            originalPrice: productData.originalPrice || productData.price,
            image: productData.image,
            quantity: productData.quantity || 1
        };

        const existingItemIndex = this.cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            this.cart[existingItemIndex].quantity += product.quantity;
        } else {
            this.cart.push(product);
        }

        this.saveCart();
        this.updateCartDisplay();
        this.updateCartBadge();
        this.showToast(this.isArabic ? 'تم إضافة المنتج للسلة بنجاح!' : 'Product added to cart successfully!');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id != productId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartBadge();
        this.showToast(this.isArabic ? 'تم حذف المنتج من السلة' : 'Product removed from cart');
    }

    updateQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id == productId);
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
            }
            this.saveCart();
            this.updateCartDisplay();
            this.updateCartBadge();
        }
    }

    // clearCart method removed

    saveCart() {
        localStorage.setItem('bandarStoreCart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge') || document.querySelector('.cart-count');
        if (cartBadge) {
            const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Free shipping helper methods
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    isEligibleForFreeShipping() {
        return this.getTotalItems() >= this.freeShippingThreshold;
    }

    getCurrentDeliveryFee() {
        return this.isEligibleForFreeShipping() ? 0 : this.baseDeliveryFee;
    }

    getItemsNeededForFreeShipping() {
        const totalItems = this.getTotalItems();
        return Math.max(0, this.freeShippingThreshold - totalItems);
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        const cartFooter = document.getElementById('cartFooter');

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>${this.isArabic ? 'سلة التسوق فارغة' : 'Shopping cart is empty'}</p>
                    <small>${this.isArabic ? 'ابدأ بإضافة المنتجات التي تعجبك' : 'Start adding products you like'}</small>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        // Determine which cart structure we're using
        const isDropdownCart = document.getElementById('cartDropdown');
        const isModalCart = document.getElementById('cartModal');

        if (isDropdownCart) {
            this.renderDropdownCart(cartItems);
        } else if (isModalCart) {
            this.renderModalCart(cartItems);
        }

        this.updateCartTotals();
        if (cartFooter) cartFooter.style.display = 'block';
    }

    renderDropdownCart(cartItems) {
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image" style="background-image: url('${item.image}');"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ${this.isArabic ? 'ريال' : 'SAR'}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="event.stopPropagation(); bandarCart.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="event.stopPropagation(); bandarCart.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="event.stopPropagation(); bandarCart.removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderModalCart(cartItems) {
        cartItems.innerHTML = '';
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ر.ع × ${item.quantity}</div>
                    <div class="cart-item-actions">
                        <div class="cart-item-qty">
                            <button class="cart-qty-btn" onclick="event.stopPropagation(); bandarCart.updateQuantity('${item.id}', -1)">-</button>
                            <span class="cart-qty-input">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="event.stopPropagation(); bandarCart.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="event.stopPropagation(); bandarCart.removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.getCurrentDeliveryFee();
        const total = subtotal + deliveryFee;
        const isFreeShipping = this.isEligibleForFreeShipping();

        // Update various total elements that might exist
        const cartTotal = document.getElementById('cartTotal');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartDeliveryAmount = document.getElementById('cartDelivery') || document.getElementById('cartDeliveryAmount');
        const cartDeliveryLabel = document.getElementById('cartDeliveryLabel');

        if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} ${this.isArabic ? 'ريال' : 'SAR'}`;
        if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toFixed(2)} ${this.isArabic ? 'ريال' : 'SAR'}`;

        // Update delivery fee display
        if (cartDeliveryAmount) {
            if (isFreeShipping) {
                cartDeliveryAmount.textContent = this.isArabic ? 'مجاني' : 'Free';
                cartDeliveryAmount.style.color = '#28a745';
                cartDeliveryAmount.style.fontWeight = 'bold';
            } else {
                cartDeliveryAmount.textContent = `${deliveryFee.toFixed(2)} ${this.isArabic ? 'ريال' : 'SAR'}`;
                cartDeliveryAmount.style.color = '';
                cartDeliveryAmount.style.fontWeight = '';
            }
        }

        if (cartDeliveryLabel) cartDeliveryLabel.textContent = this.isArabic ? 'التوصيل:' : 'Delivery:';

        // Update free shipping promotion display
        this.updateFreeShippingPromotion();
    }

    updateFreeShippingPromotion() {
        // Create or update free shipping promotion element
        let promoElement = document.getElementById('freeShippingPromo');
        const cartItems = document.getElementById('cartItems');

        if (!cartItems) return;

        const totalItems = this.getTotalItems();
        const itemsNeeded = this.getItemsNeededForFreeShipping();
        const isFreeShipping = this.isEligibleForFreeShipping();

        // Remove existing promo element if it exists
        if (promoElement) {
            promoElement.remove();
        }

        // Only show promotion if there are items in cart
        if (totalItems === 0) return;

        // Create new promotion element
        promoElement = document.createElement('div');
        promoElement.id = 'freeShippingPromo';
        promoElement.style.cssText = `
            margin: 15px 20px;
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            font-size: 0.9rem;
            line-height: 1.4;
            transition: all 0.3s ease;
            animation: slideInFromTop 0.5s ease-out;
        `;

        // Add CSS animation keyframes if not already added
        if (!document.getElementById('freeShippingAnimations')) {
            const style = document.createElement('style');
            style.id = 'freeShippingAnimations';
            style.textContent = `
                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }

        if (isFreeShipping) {
            // Free shipping achieved
            promoElement.innerHTML = `
                <div style="color: #28a745; background: #d4edda; border: 1px solid #c3e6cb; padding: 12px; border-radius: 8px; animation: pulse 2s infinite;">
                    <i class="fas fa-shipping-fast" style="margin-left: 8px; font-size: 1.1rem;"></i>
                    ${this.isArabic ? '🎉 تهانينا! شحن مجاني على طلبك' : '🎉 Congratulations! Free shipping on your order'}
                </div>
            `;
        } else {
            // Progress towards free shipping
            const progressPercentage = Math.min((totalItems / this.freeShippingThreshold) * 100, 100);
            promoElement.innerHTML = `
                <div style="color: #856404; background: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; border-radius: 8px;">
                    <div style="margin-bottom: 8px;">
                        <i class="fas fa-truck" style="margin-left: 8px;"></i>
                        ${this.isArabic ?
                            `أضف ${itemsNeeded} منتج${itemsNeeded > 1 ? 'ات' : ''} أخرى للحصول على شحن مجاني!` :
                            `Add ${itemsNeeded} more item${itemsNeeded > 1 ? 's' : ''} for free shipping!`
                        }
                    </div>
                    <div style="background: #f8f9fa; border-radius: 10px; height: 6px; overflow: hidden; margin-top: 8px;">
                        <div style="background: linear-gradient(90deg, #4ECDC4, #44A08D); height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
                    </div>
                    <small style="color: #6c757d; margin-top: 4px; display: block;">
                        ${this.isArabic ? `${totalItems} من ${this.freeShippingThreshold} منتجات` : `${totalItems} of ${this.freeShippingThreshold} items`}
                    </small>
                </div>
            `;
        }

        // Insert promotion at the top of cart items
        cartItems.insertBefore(promoElement, cartItems.firstChild);
    }

    checkout() {
        if (this.cart.length === 0) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.getCurrentDeliveryFee();
        const total = subtotal + deliveryFee;
        let message = `${this.isArabic ? 'السلام عليكم، أريد طلب المنتجات التالية:' : 'Hello, I want to order the following products:'}\n\n`;
        
        this.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   ${this.isArabic ? 'الكمية:' : 'Quantity:'} ${item.quantity}\n`;
            message += `   ${this.isArabic ? 'السعر:' : 'Price:'} ${item.price} ${this.isArabic ? 'ريال' : 'SAR'}\n\n`;
        });

        // Add delivery information
        if (this.isEligibleForFreeShipping()) {
            message += `${this.isArabic ? 'التوصيل: مجاني 🎉' : 'Delivery: Free 🎉'}\n`;
        } else {
            message += `${this.isArabic ? 'التوصيل:' : 'Delivery:'} ${deliveryFee.toFixed(2)} ${this.isArabic ? 'ريال' : 'SAR'}\n`;
        }

        message += `${this.isArabic ? 'المجموع الكلي:' : 'Total:'} ${total.toFixed(2)} ${this.isArabic ? 'ريال' : 'SAR'}`;

        const whatsappUrl = `https://wa.me/96891800885?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    setLanguage(isArabic) {
        this.isArabic = isArabic;
        this.updateCartDisplay();
    }
}

// Global cart instance
let bandarCart;

// Initialize cart function
function initializeBandarCart() {
    if (!bandarCart) {
        bandarCart = new BandarCart();
    }
}

// Initialize cart when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBandarCart);
} else {
    // DOM is already loaded
    initializeBandarCart();
}

// Global functions for backward compatibility
function addToCart(button) {
    const productCard = button.closest('.product-card');
    if (!productCard) return;

    const productData = {
        id: productCard.dataset.id,
        name: productCard.dataset.name,
        price: parseFloat(productCard.querySelector('.discounted-price')?.textContent.replace(/[^\d.]/g, '')) || parseFloat(productCard.dataset.price),
        originalPrice: parseFloat(productCard.querySelector('.original-price')?.textContent.replace(/[^\d.]/g, '')) || parseFloat(productCard.dataset.originalPrice),
        image: productCard.dataset.image,
        quantity: 1
    };

    bandarCart.addToCart(productData);

    // Visual feedback
    button.classList.add('added');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> تم الإضافة';
    
    setTimeout(() => {
        button.classList.remove('added');
        button.innerHTML = originalText;
    }, 1500);
}

// Legacy function aliases for compatibility
function increaseQuantity(event, productId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    bandarCart.updateQuantity(productId, 1);
}

function decreaseQuantity(event, productId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    bandarCart.updateQuantity(productId, -1);
}

function removeFromCart(event, productId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    bandarCart.removeFromCart(productId);
}

function updateCartItem(id, change) {
    bandarCart.updateQuantity(id, change);
}

function removeCartItem(id) {
    bandarCart.removeFromCart(id);
}
