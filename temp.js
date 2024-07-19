const API = (() => {
    const URL = "http://localhost:3000";
    const getCart = () => {
        // define your method to get cart data
        return fetch(`${URL}/cart`).then((res) => res.json());
    };

    const getInventory = () => {
        // define your method to get inventory data
        return fetch(`${URL}/inventory`).then((res) => res.json());
    };

    const addToCart = (inventoryItem) => {
        // define your method to add an item to cart
        return fetch(`${URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inventoryItem),
        }).then((res) => res.json());
    };

    const updateCart = (id, newAmount) => {
        // define your method to update an item in cart
        return fetch('${URL}/cart/${id}', {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: newAmount }),
        }).then((res) => res.json());
    };

    const deleteFromCart = (id) => {
        // define your method to delete an item in cart
        return fetch(`${URL}/cart/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());

    };

    const checkout = () => {
        // you don't need to add anything here
        return getCart().then((data) =>
            Promise.all(data.map((item) => deleteFromCart(item.id)))
        );
    };

    return {
        getCart,
        updateCart,
        getInventory,
        addToCart,
        deleteFromCart,
        checkout,
    };
})();

const Model = (() => {
    class State {
        #onChange;
        #inventory;
        #cart;
        constructor() {
            this.#inventory = [];
            this.#cart = [];
        }

        get cart() {
            return this.#cart;
        }

        set cart(newCart) {
            this.#cart = newCart;
            this.#onChange();
        }

        get inventory() {
            return this.#inventory;
        }

        set inventory(newInventory) {
            this.#inventory = newInventory;
            this.#onChange();
        }

        subscribe(cb) {
            this.#onChange = cb;
        }
    }

    const { getCart, updateCart, getInventory, addToCart, deleteFromCart, checkout } = API;

    return {
        State,
        getCart,
        updateCart,
        getInventory,
        addToCart,
        deleteFromCart,
        checkout,
    };
})();

const View = (() => {
    const inventoryListEl = document.querySelector(".inventory");
    const cartListEl = document.querySelector(".cart");

    const renderInventory = (inventory) => {
        let inventoryTemp = "";

        inventory.forEach((item) => {
            const inventoryItemTemp = `
          <li id="inventory-${item.id}">
            ${item.content}
            <button class="add-btn" data-id="${item.id}">+</button>
            <button class="subtract-btn" data-id="${item.id}">-</button>
            <span class="amount">0</span>
            <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
          </li>
        `;
            inventoryTemp += inventoryItemTemp;
        });

        inventoryListEl.innerHTML = inventoryTemp;
    };

    const renderCart = (cart) => {
        let cartTemp = "";

        cart.forEach((item) => {
            const cartItemTemp = `
          <li id="cart-${item.id}">
            ${item.content} - ${item.amount}
            <button class="delete-btn" data-id="${item.id}">Delete</button>
          </li>
        `;
            cartTemp += cartItemTemp;
        });

        cartListEl.innerHTML = cartTemp;
    };

    return {
        renderInventory,
        renderCart,
        inventoryListEl,
        cartListEl,
    };
})();

const Controller = ((model, view) => {
    const state = new model.State();

    const init = () => {
        state.subscribe(() => {
            view.renderInventory(state.inventory);
            view.renderCart(state.cart);
        });

        model.getInventory().then((data) => {
            state.inventory = data;
        });

        model.getCart().then((data) => {
            state.cart = data;
        });

        view.inventoryListEl.addEventListener("click", (event) => {
            const element = event.target;
            const id = element.getAttribute("data-id");

            if (element.classList.contains("add-btn")) {
                updateAmount(id, 1);
            } else if (element.classList.contains("subtract-btn")) {
                updateAmount(id, -1);
            } else if (element.classList.contains("add-to-cart-btn")) {
                addToCart(id);
            }
        });

        view.cartListEl.addEventListener("click", (event) => {
            const element = event.target;
            const id = element.getAttribute("data-id");

            if (element.classList.contains("delete-btn")) {
                deleteFromCart(id);
            }
        });

        view.cartListEl.parentElement.querySelector(".checkout-btn").addEventListener("click", () => {
            checkout();
        });
    };

    const updateAmount = (id, amount) => {
        const item = state.inventory.find((item) => item.id === parseInt(id));
        if (item) {
            const newAmount = item.amount + amount;
            if (newAmount >= 0) {
                model.updateCart(item.id, newAmount)
                    .then(() => model.getCart())
                    .then((data) => {
                        state.cart = data;
                    });
            }
        }
    };

    const addToCart = (id) => {
        const item = state.inventory.find((item) => item.id === parseInt(id));
        if (item) {
            const existingCartItem = state.cart.find((item) => item.id === parseInt(id));
            if (existingCartItem) {
                const newAmount = existingCartItem.amount + 1;
                model.updateCart(existingCartItem.id, newAmount)
                    .then(() => model.getCart())
                    .then((data) => {
                        state.cart = data;
                    });
            } else {
                model.addToCart({ id: item.id, content: item.content, amount: 1 })
                    .then(() => model.getCart())
                    .then((data) => {
                        state.cart = data;
                    });
            }
        }
    };

    const deleteFromCart = (id) => {
        model.deleteFromCart(id)
            .then(() => model.getCart())
            .then((data) => {
                state.cart = data;
            });
    };

    const checkout = () => {
        model.checkout()
            .then(() => {
                state.cart = [];
            });
    };

    return {
        init,
    };
})(Model, View);

Controller.init();
