// ========================================
// NIFEMZY — BEYOND EXPECTATIONS
// E-commerce JavaScript
// ========================================


// 1. PRODUCT DATA
const products = [
    {
        id: 1,
        name: "Essential Black Hoodie",
        category: "Hoodies",
        price: 45000,
        rating: 4.9,
        tag: "BESTSELLER",
        image: "photo-1556821840-3a63f95609a7"
    },
    {
        id: 2,
        name: "Oversized Graphic Tee",
        category: "T-Shirts",
        price: 18000,
        rating: 4.8,
        tag: "NEW",
        image: "photo-1521572163474-6864f9cf17ab"
    },
    {
        id: 3,
        name: "Classic Street Cap",
        category: "Caps",
        price: 12000,
        rating: 4.7,
        tag: "POPULAR",
        image: "photo-1588850561407-ed78c282e89b"
    },
    {
        id: 4,
        name: "Minimal White Hoodie",
        category: "Hoodies",
        price: 42000,
        rating: 4.8,
        tag: "",
        image: "photo-1578681994506-b8f463449011"
    },
    {
        id: 5,
        name: "Urban Everyday Tee",
        category: "T-Shirts",
        price: 16000,
        rating: 4.6,
        tag: "",
        image: "photo-1503341504253-dff4815485f1"
    },
    {
        id: 6,
        name: "Statement Accessories",
        category: "Accessories",
        price: 9000,
        rating: 4.7,
        tag: "LIMITED",
        image: "photo-1523275335684-37898b6baf30"
    },
    {
        id: 7,
        name: "Premium Street Hoodie",
        category: "Hoodies",
        price: 50000,
        rating: 5.0,
        tag: "PREMIUM",
        image: "photo-1551488831-00ddcb6c6bd3"
    },
    {
        id: 8,
        name: "Everyday Urban Cap",
        category: "Caps",
        price: 10000,
        rating: 4.5,
        tag: "",
        image: "photo-1534215754734-18e55d13e346"
    }
];


// 2. SELECT HTML ELEMENTS
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartHeadingCount = document.getElementById("cartHeadingCount");

const checkoutButton = document.getElementById("checkoutButton");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

const newsletterForm = document.getElementById("newsletterForm");
const emailInput = document.getElementById("emailInput");
const newsletterMessage = document.getElementById("newsletterMessage");

const year = document.getElementById("year");
const toast = document.getElementById("toast");


// 3. APPLICATION STATE
let selectedCategory = "All";
let cart = loadCart();
let wishlist = new Set();
let toastTimeout;


// 4. FORMAT PRICES
function formatPrice(price) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(price);
}


// 5. CREATE PRODUCT IMAGE URL
function imageUrl(photoId) {
    return (
        "https://images.unsplash.com/" +
        photoId +
        "?auto=format&fit=crop&w=900&q=85"
    );
}


// 6. DISPLAY PRODUCTS
function renderProducts() {
    if (!productGrid) return;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    let filteredProducts = products.filter(function (product) {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    // Sort products
    if (sortSelect) {
        switch (sortSelect.value) {
            case "price-low":
                filteredProducts.sort((a, b) => a.price - b.price);
                break;

            case "price-high":
                filteredProducts.sort((a, b) => b.price - a.price);
                break;

            case "name":
                filteredProducts.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                break;
        }
    }

    // Show message if there are no matching products
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <h3>No products found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    // Generate product cards
    productGrid.innerHTML = filteredProducts.map(function (product) {
        const isWishlisted = wishlist.has(product.id);

        return `
            <article class="product-card">

                <div class="product-image">

                    <img
                        src="${imageUrl(product.image)}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    ${
                        product.tag
                            ? `<span class="product-tag">${product.tag}</span>`
                            : ""
                    }

                    <button
                        class="wishlist ${isWishlisted ? "active" : ""}"
                        type="button"
                        data-wishlist="${product.id}"
                        aria-label="Add ${product.name} to wishlist"
                        aria-pressed="${isWishlisted}"
                    >
                        ${isWishlisted ? "♥" : "♡"}
                    </button>

                    <button
                        class="add-button"
                        type="button"
                        data-add="${product.id}"
                    >
                        ADD TO CART +
                    </button>

                </div>

                <div class="product-info">

                    <p class="product-category">
                        ${product.category}
                    </p>

                    <h3>${product.name}</h3>

                    <div class="product-bottom">

                        <span class="product-price">
                            ${formatPrice(product.price)}
                        </span>

                        <span class="product-rating">
                            ★ ${product.rating.toFixed(1)}
                        </span>

                    </div>

                </div>

            </article>
        `;
    }).join("");
}


// 7. LOAD CART FROM LOCAL STORAGE
function loadCart() {
    try {
        const savedCart = localStorage.getItem("nifemzy-cart");

        if (!savedCart) return [];

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) return [];

        return parsedCart.filter(function (item) {
            return (
                products.some(product => product.id === item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        });
    } catch (error) {
        console.error("Could not load cart:", error);
        return [];
    }
}


// 8. SAVE CART
function saveCart() {
    try {
        localStorage.setItem("nifemzy-cart", JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save cart:", error);
        showToast("Your cart could not be saved on this device");
    }
}


// 9. ADD PRODUCT TO CART
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
    showToast(`${product.name} added to cart`);
}


// 10. CHANGE PRODUCT QUANTITY
function changeQuantity(productId, amount) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    renderCart();
}


// 11. REMOVE PRODUCT FROM CART
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    saveCart();
    renderCart();

    showToast("Product removed from cart");
}


// 12. DISPLAY CART
function renderCart() {
    const totalQuantity = cart.reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

    const subtotal = cart.reduce(function (total, item) {
        const product = products.find(p => p.id === item.id);

        return product
            ? total + product.price * item.quantity
            : total;
    }, 0);

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }

    if (cartHeadingCount) {
        cartHeadingCount.textContent = totalQuantity;
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Find something you love at NIFEMZY.</p>
            </div>
        `;

        return;
    }

    cartItems.innerHTML = cart.map(function (item) {
        const product = products.find(p => p.id === item.id);

        if (!product) return "";

        return `
            <div class="cart-item">

                <img
                    src="${imageUrl(product.image)}"
                    alt="${product.name}"
                >

                <div class="cart-item-info">

                    <h4>${product.name}</h4>

                    <p>${formatPrice(product.price)}</p>

                    <div class="quantity-controls">

                        <button
                            type="button"
                            data-decrease="${product.id}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            data-increase="${product.id}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>

                <button
                    class="remove-item"
                    type="button"
                    data-remove="${product.id}"
                    aria-label="Remove ${product.name}"
                >
                    ×
                </button>

            </div>
        `;
    }).join("");
}


// 13. OPEN CART
function openCart() {
    if (cartPanel) {
        cartPanel.classList.add("active");
        cartPanel.setAttribute("aria-hidden", "false");
    }

    if (overlay) {
        overlay.classList.add("active");
    }

    document.body.classList.add("cart-open");
}


// 14. CLOSE CART
function closeCart() {
    if (cartPanel) {
        cartPanel.classList.remove("active");
        cartPanel.setAttribute("aria-hidden", "true");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("cart-open");
}


// 15. SHOW TOAST NOTIFICATION
function showToast(message) {
    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove("show");
    }, 2800);
}


// 16. PRODUCT GRID BUTTONS
if (productGrid) {
    productGrid.addEventListener("click", function (event) {
        const addButton = event.target.closest("[data-add]");
        const wishlistButton = event.target.closest("[data-wishlist]");

        if (addButton) {
            const productId = Number(addButton.dataset.add);
            addToCart(productId);
        }

        if (wishlistButton) {
            const productId = Number(wishlistButton.dataset.wishlist);

            if (wishlist.has(productId)) {
                wishlist.delete(productId);
                showToast("Removed from wishlist");
            } else {
                wishlist.add(productId);
                showToast("Added to wishlist");
            }

            renderProducts();
        }
    });
}


// 17. CART BUTTONS
if (cartItems) {
    cartItems.addEventListener("click", function (event) {
        const increaseButton = event.target.closest("[data-increase]");
        const decreaseButton = event.target.closest("[data-decrease]");
        const removeButton = event.target.closest("[data-remove]");

        if (increaseButton) {
            changeQuantity(
                Number(increaseButton.dataset.increase),
                1
            );
        }

        if (decreaseButton) {
            changeQuantity(
                Number(decreaseButton.dataset.decrease),
                -1
            );
        }

        if (removeButton) {
            removeFromCart(Number(removeButton.dataset.remove));
        }
    });
}


// 18. CATEGORY FILTERS
const categoriesContainer = document.getElementById("categories");

if (categoriesContainer) {
    categoriesContainer.addEventListener("click", function (event) {
        const categoryButton = event.target.closest("[data-category]");

        if (!categoryButton) return;

        selectedCategory = categoryButton.dataset.category;

        categoriesContainer
            .querySelectorAll("[data-category]")
            .forEach(function (button) {
                button.classList.remove("active");
                button.setAttribute("aria-pressed", "false");
            });

        categoryButton.classList.add("active");
        categoryButton.setAttribute("aria-pressed", "true");

        renderProducts();
    });
}


// 19. SEARCH PRODUCTS
if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
}


// 20. SORT PRODUCTS
if (sortSelect) {
    sortSelect.addEventListener("change", renderProducts);
}


// 21. CART OPEN/CLOSE BUTTONS
document.addEventListener("click", function (event) {
    const openCartButton = event.target.closest(
        "#cartButton, #cartToggle, [data-open-cart]"
    );

    const closeCartButton = event.target.closest(
        "#closeCart, [data-close-cart]"
    );

    if (openCartButton) {
        openCart();
    }

    if (closeCartButton) {
        closeCart();
    }
});


if (overlay) {
    overlay.addEventListener("click", closeCart);
}


// 22. KEYBOARD ACCESSIBILITY
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeCart();

        if (nav) {
            nav.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }
});


// 23. DARK MODE TOGGLE
function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-pressed",
            theme === "dark" ? "true" : "false"
        );
    }
}

let savedTheme = "light";

try {
    savedTheme = localStorage.getItem("nifemzy-theme") || "light";
} catch (error) {
    console.warn("Theme preference could not be loaded.");
}

applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const isDark = document.body.classList.contains("dark-mode");
        const newTheme = isDark ? "light" : "dark";

        applyTheme(newTheme);

        try {
            localStorage.setItem("nifemzy-theme", newTheme);
        } catch (error) {
            console.warn("Theme preference could not be saved.");
        }
    });
}


// 24. MOBILE NAVIGATION
if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    });

    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


// 25. NEWSLETTER FORM
if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) {
            if (newsletterMessage) {
                newsletterMessage.textContent = "Please enter your email.";
            }

            return;
        }

        if (newsletterMessage) {
            newsletterMessage.textContent =
                "Thanks for joining the NIFEMZY community!";
        }

        newsletterForm.reset();
    });
}


// 26. CHECKOUT BUTTON
if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
        if (cart.length === 0) {
            showToast("Your cart is empty");
            return;
        }

        showToast("Checkout is not connected yet");

        // Connect a real payment provider here when you're ready.
    });
}


// 27. AUTOMATIC FOOTER YEAR
if (year) {
    year.textContent = new Date().getFullYear();
}


// 28. INITIALIZE WEBSITE
renderProducts();
renderCart();

console.log("NIFEMZY website is ready!");