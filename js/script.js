
/* =========================================
   TASTES OF AFRICA
   SHARED JAVASCRIPT
========================================= */

/* 1. DARK / LIGHT MODE */
const themeToggle = document.getElementById("theme-toggle");
const rootElement = document.documentElement;

function applyTheme(theme) {
    rootElement.setAttribute("data-theme", theme);

    if (themeToggle) {
        const isDark = theme === "dark";

        themeToggle.textContent = isDark ? "☀" : "☾";

        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeToggle.setAttribute(
            "title",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }
}

// Restore the previously selected theme
const savedTheme = localStorage.getItem("tasteOfAfricaTheme");

applyTheme(savedTheme || "light");

// Change theme when the button is clicked
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = rootElement.getAttribute("data-theme");

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);

        localStorage.setItem("tasteOfAfricaTheme", newTheme);
    });
}

/* 2. MOBILE NAVIGATION */
const menuToggle = document.getElementById("menu-toggle");
const navigation = document.getElementById("primary-navigation");

function closeNavigation() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

    menuToggle.textContent = "☰";
}

if (menuToggle && navigation) {

    menuToggle.addEventListener("click", () => {

        const isOpen = navigation.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";

    });

    // Close menu after selecting a navigation link
    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", closeNavigation);

    });

    // Close menu when Escape is pressed
    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeNavigation();
        }

    });

    // Close menu when clicking outside it
    document.addEventListener("click", event => {

        if (
            navigation.classList.contains("is-open") &&
            !navigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeNavigation();
        }

    });

}

/* 3. AUTOMATIC COPYRIGHT YEAR */
const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

/* 4. NEWSLETTER FORM FEEDBACK */
const newsletterForm = document.getElementById("newsletter-form");
const newsletterFeedback = document.getElementById("newsletter-feedback");

if (newsletterForm && newsletterFeedback) {

    newsletterForm.addEventListener("submit", event => {

        event.preventDefault();

        const emailInput = document.getElementById("newsletter-email");

        if (!emailInput || !emailInput.checkValidity()) {
            emailInput?.reportValidity();
            return;
        }

        newsletterFeedback.textContent =
            "Thank you for your interest! Newsletter registration will be available soon.";

        newsletterForm.reset();

    });

}

/* =========================================
   5. RECIPE SEARCH AND REGIONAL FILTERS
========================================= */

const recipeSearch = document.getElementById("recipe-search");
const recipeCards = document.querySelectorAll(".recipe-card");
const filterButtons = document.querySelectorAll(".filter-button");
const recipeCount = document.getElementById("recipe-results-count");
const noRecipes = document.getElementById("no-recipes");

let activeRegion = "all";

function filterRecipes() {
    if (!recipeSearch || recipeCards.length === 0) return;

    const searchTerm = recipeSearch.value.toLowerCase().trim();

    let visibleCount = 0;

    recipeCards.forEach(card => {
        const region = card.dataset.region;
        const searchableContent = card.dataset.search.toLowerCase();

        const matchesRegion =
            activeRegion === "all" || region === activeRegion;

        const matchesSearch =
            searchableContent.includes(searchTerm);

        const shouldDisplay = matchesRegion && matchesSearch;

        card.hidden = !shouldDisplay;

        if (shouldDisplay) {
            visibleCount++;
        }
    });

    if (recipeCount) {
        recipeCount.textContent =
            `Showing ${visibleCount} ${visibleCount === 1 ? "recipe" : "recipes"}`;
    }

    if (noRecipes) {
        noRecipes.hidden = visibleCount !== 0;
    }
}


// Search recipes as the visitor types
if (recipeSearch) {
    recipeSearch.addEventListener("input", filterRecipes);
}


// Filter recipes by region
filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        activeRegion = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;

            filterButton.classList.toggle("is-active", isActive);

            filterButton.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        filterRecipes();

    });
});


/* =========================================
   6. RECIPE FAVORITES
========================================= */

const favoriteButtons = document.querySelectorAll(".favorite-button");

let savedFavorites = JSON.parse(
    localStorage.getItem("tasteOfAfricaFavorites") || "[]"
);


// Restore saved favorites
function updateFavoriteButton(button) {

    const recipeId = button.dataset.favorite;
    const isFavorite = savedFavorites.includes(recipeId);

    button.classList.toggle("is-favorite", isFavorite);

    button.textContent = isFavorite ? "♥" : "♡";

    button.setAttribute("aria-pressed", String(isFavorite));

    button.setAttribute(
        "aria-label",
        `${isFavorite ? "Remove" : "Save"} ${
            recipeId.replaceAll("-", " ")
        } ${isFavorite ? "from" : "to"} favorites`
    );
}


// Initialize favorite buttons
favoriteButtons.forEach(button => {

    updateFavoriteButton(button);

    button.addEventListener("click", () => {

        const recipeId = button.dataset.favorite;

        if (savedFavorites.includes(recipeId)) {

            savedFavorites = savedFavorites.filter(
                favorite => favorite !== recipeId
            );

        } else {

            savedFavorites.push(recipeId);

        }

        localStorage.setItem(
            "tasteOfAfricaFavorites",
            JSON.stringify(savedFavorites)
        );

        updateFavoriteButton(button);

    });

});

// ==========================================
// RECIPE INGREDIENT SCALING
// ==========================================

const servingsOutput = document.getElementById("servings");
const decreaseButton = document.getElementById("servings-decrease");
const increaseButton = document.getElementById("servings-increase");
const ingredientQuantities = document.querySelectorAll(".ingredient-quantity");

if (servingsOutput && decreaseButton && increaseButton && ingredientQuantities.length > 0) {
    const baseServings = 4;
    const minimumServings = 1;
    const maximumServings = 12;

    let currentServings = baseServings;

    function formatQuantity(quantity) {
        const wholeNumber = Math.floor(quantity);
        const decimal = Number((quantity - wholeNumber).toFixed(2));

        const fractions = {
            0.25: "¼",
            0.33: "⅓",
            0.5: "½",
            0.67: "⅔",
            0.75: "¾"
        };

        const fraction = fractions[decimal];

        if (!fraction) {
            return Number(quantity.toFixed(2)).toString();
        }

        return wholeNumber > 0
            ? `${wholeNumber}${fraction}`
            : fraction;
    }

    function updateIngredients() {
        servingsOutput.textContent = currentServings;

        ingredientQuantities.forEach((ingredient) => {
            const baseQuantity = Number(ingredient.dataset.baseQuantity);
            const unit = ingredient.dataset.unit;

            const newQuantity = baseQuantity * currentServings / baseServings;

            ingredient.textContent = `${formatQuantity(newQuantity)} ${unit}`;
        });

        decreaseButton.disabled = currentServings <= minimumServings;
        increaseButton.disabled = currentServings >= maximumServings;
    }

    decreaseButton.addEventListener("click", () => {
        if (currentServings > minimumServings) {
            currentServings--;
            updateIngredients();
        }
    });

    increaseButton.addEventListener("click", () => {
        if (currentServings < maximumServings) {
            currentServings++;
            updateIngredients();
        }
    });

    updateIngredients();
}

/* =========================================
   CONTACT FORM
========================================= */

const contactForm = document.getElementById("contact-form");
const contactSuccess = document.getElementById("contact-success");
const contactSuccessMessage = document.getElementById("contact-success-message");
const contactReset = document.getElementById("contact-reset");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (message.length <= 20) {
            document.getElementById("contact-message").setCustomValidity(
                "Please enter a message longer than 20 characters."
            );

            document.getElementById("contact-message").reportValidity();
            return;
        }

        document.getElementById("contact-message").setCustomValidity("");

        contactSuccessMessage.textContent =
            `Thank you, ${name}! Your message has been received in this demonstration. We appreciate you taking the time to connect with Tastes of Africa.`;

        contactForm.hidden = true;
        contactSuccess.hidden = false;

        contactSuccess.focus();
    });
}

const contactMessageField = document.getElementById("contact-message");

if (contactMessageField) {
    contactMessageField.addEventListener("input", function () {
        contactMessageField.setCustomValidity("");
    });
}

if (contactReset) {
    contactReset.addEventListener("click", function () {
        contactForm.reset();
        contactForm.hidden = false;
        contactSuccess.hidden = true;
        document.getElementById("contact-name").focus();
    });
}
