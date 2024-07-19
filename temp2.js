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
    // implement your logic for Model
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

        get inventory() {
            return this.#inventory;
        }

        set cart(newCart) {
            this.#cart = newCart;
            // this.#onChange(this.#cart);
            this.#onChange();
        }
        set inventory(newInventory) {
            this.#inventory = newInventory;
            // this.#onChange(this.#inventory);
            this.#onChange();
        }

        subscribe(cb) {
            this.#onChange = cb;
        }
    }
    const {
        getCart,
        updateCart,
        getInventory,
        addToCart,
        deleteFromCart,
        checkout,
    } = API;

    // const state = new State();

    // getInventory().then((data) => {
    //   state.inventory = data;
    // });

    // getCart().then((data) => {
    //   state.cart = data;
    // });

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
    // implement your logic for View
    const inventoryEl = document.querySelector(".inventory");
    const cartEl = document.querySelector(".cart");
    const checkoutBtnEl = document.querySelect(".checkout-btn");

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

        inventoryEl.innerHTML = inventoryTemp;
    };

    // const renderInventory = (inventory) => {
    //   let inventoryTemp = "";

    //   inventory.forEach((item) => {
    //     const inventoryItemTemp = `<li id=${item.id}>
    //     <button class="item__minus-btn">minus</button>
    //     <span>${item.content}</span>
    //     <button class="item__plus-btn">plus</button>
    //     <button class="item__add-btn">add</button>
    //   </li>`;
    //     inventoryTemp += inventoryItemTemp;
    //   });
    //   inventoryEl.innerHTML = inventoryTemp;
    // }

    const renderCart = (cart) => {
        let cartTemp = "";

        cart.forEach((item) => {
            const cartItemTemp = `<li id=${item.id}>
        <span>${item.content} ${item.quantity}</span>
        <button class="item__delete-btn">delete</button>
      </li>`;
            cartTemp += cartItemTemp;
        });
        cartEl.innerHTML = cartTemp;
    }

    return {
        renderInventory,
        renderCart,
        inventoryEl,
        cartEl,
        checkoutBtnEl,
    };
})();


const Controller = ((model, view) => {
    // implement your logic for Controller
    const state = new model.State();

    const init = () => {
        state.subscribe(() => {
            view.renderInventory(state.inventory);
            view.renderCart(state.cart);
        });

        // model.getInventory().then((data) => {
        //   state.inventory = data;
        // });

        // model.getCart().then((data) => {
        //   state.cart = data;
        // });

        // view.inventoryListEl.addEventListener("click", (event) => {
        //   const element = event.target;
        //   const id = element.getAttribute("data-id");

        //   if (element.classList.contains("add-btn")) {
        //     updateAmount(id, 1);
        //   } else if (element.classList.contains("subtract-btn")) {
        //     updateAmount(id, -1);
        //   } else if (element.classList.contains("add-to-cart-btn")) {
        //     addToCart(id);
        //   }
        // });

        // view.cartListEl.addEventListener("click", (event) => {
        //   const element = event.target;
        //   const id = element.getAttribute("data-id");

        //   if (element.classList.contains("delete-btn")) {
        //     deleteFromCart(id);
        //   }
        // });
        // view.cartListEl.parentElement.querySelector(".checkout-btn").addEventListener("click", () => {
        //   checkout();
        // });

    };
    const handleUpdateAmount = () => { };

    const handleAddToCart = () => { };

    const handleDelete = () => { };

    const handleCheckout = () => { };
    const bootstrap = () => { };
    return {
        init,
    };
})(Model, View);

Controller.init();


