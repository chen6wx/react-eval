const API = (() => {
  const URL = "http://localhost:3000";

  const getCart = () => {
    return fetch(`${URL}/cart`).then((res) => res.json());
  };

  const getInventory = () => {
    return fetch(`${URL}/inventory`).then((res) => res.json());
  };

  const addToCart = (inventoryItem) => {
    return fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
  };

  const updateCart = (id, newAmount) => {
    return fetch(`${URL}/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: newAmount }),
    }).then((res) => res.json());
  };

  const deleteFromCart = (id) => {
    return fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  const checkout = () => {
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
  const inventorylistEl = document.querySelector(".inventory__list");
  const cartlistEl = document.querySelector(".cart__list");


  const renderInventory = (inventory) => {
    let inventoryTemp = "";

    inventory.forEach((item) => {
      const inventoryItemTemp = `
          <li id="inventory-${item.id}">
            ${item.content}
            <button class="subtract-btn" data-id="${item.id}">-</button>
            <span class="amount">0</span>
            <button class="add-btn" data-id="${item.id}">+</button>
            <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
          </li>
        `;
      inventoryTemp += inventoryItemTemp;
    });

    inventorylistEl.innerHTML = inventoryTemp;
  };

  const renderCart = (cart) => {
    let cartTemp = "";

    cart.forEach((item) => {
      const cartItemTemp = `
          <li id="cart-${item.id}">
            ${item.content} x ${item.amount}
            <button class="delete-btn" data-id="${item.id}">Delete</button>
          </li>
        `;
      cartTemp += cartItemTemp;
    });

    cartlistEl.innerHTML = cartTemp;
  };

  return {
    renderInventory,
    renderCart,
    inventorylistEl,
    cartlistEl,
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

    view.inventorylistEl.addEventListener("click", (event) => {
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

    view.cartlistEl.addEventListener("click", (event) => {
      const element = event.target;
      const id = element.getAttribute("data-id");

      if (element.classList.contains("delete-btn")) {
        deleteFromCart(id);
      }
    });

    view.cartlistEl.parentElement.querySelector(".checkout-btn").addEventListener("click", () => {
      checkout();
    });
  };

  const handleUpdateAmount = (id, amount) => {
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

