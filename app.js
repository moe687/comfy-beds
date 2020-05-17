const productDom = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const closeCart = document.querySelector(".close-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".clear-cart");
const removeBtn = document.querySelector(".remove-item");
const buttons = document.querySelectorAll(".bag-btn");

var cart = [];
/// product class ////
class Product {
  async search() {
    try {
      let response = await fetch("data.json");
      let data = await response.json();

      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
///// class ui ///////
class UI {
  build(products) {
    let output = '<div class="card-columns">';
    products.forEach(post => {
      // Check for image
      output += `
      <article class="product">
          <div class="img-container">
            <img
              src="${post.image}"
              alt="product"
              class="product-img"
            /> 
            <button class="bag-btn" data-id=${post.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${post.title}</h3>
          <h4>$${post.price}</h4>
        </article> -->
      `;
    });
    output += "</div>";
    productDom.innerHTML = output;
  }
  getButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        button.innerText = "cart in";
        button.disable = true;
      } else {
        button.addEventListener("click", event => {
          event.target.innerText = "cart in";
          event.target.disabled = true;
          const cartItem = { ...Store.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Store.saveCart(cart);
          this.setCartValues(cart);
          this.cartDomElement(cartItem);
          this.showCartMeth(cart);
        });
      }
    });
  }

  setCartValues(cart) {
    let valueTotall = 0;
    let tempValue = 0;
    cart.map(cartData => {
      valueTotall += cartData.price * cartData.amount;
      tempValue += cartData.amount;
    });
    cartTotal.innerText = parseFloat(valueTotall.toFixed(2));
    cartItems.innerText = tempValue;
  }

  cartDomElement(cartItem) {
    const div = document.createElement("div");
    div.innerHTML = `
    <img src="${cartItem.image}" alt="product" />
            <div>
              <h4>${cartItem.title}</h4>
              <h5>$${cartItem.price}</h5>
          <span class="remove-item" data-id=${cartItem.id}>remove</span>

            <div>
              <i class="fas fa-chevron-up"></i>
              <p class="${cartItem.amount}">
                1
              </p>
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
    `;
    cartContent.appendChild(div);
  }

  wholeCart() {
    cart = Store.getCart();
    this.setCartValues(cart);
    closeCart.addEventListener("click", () => this.closeCartMeth(cart));

    this.populateCart(cart);
    this.showCartMeth(cart);
  }

  populateCart() {
    cart.forEach(item => this.cartDomElement(item));
  }

  showCartMeth() {
    cartBtn.addEventListener("click", () => {
      cartDom.classList.add("showCart");
      cartOverlay.classList.add("transparentBcg");
    });
  }

  closeCartMeth() {
    cartDom.classList.remove("showCart");
    cartOverlay.classList.remove("transparentBcg");
  }

  cartLogic() {
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Store.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);

        this.manageBtns();
      }
    });

    ///////
    clearCartBtn.addEventListener("click", () => {
      cart = [];
      this.setCartValues(cart);
      Store.saveCart(cart);
      this.manageBtns();
      this.clearCart(cart);
      this.closeCartMeth();
    });
  }

  clearCart() {
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  manageBtns() {
    const buttons = [...document.querySelectorAll(".bag-btn")];

    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
    });
  }
}

// Store Class: Handles storage (localStorage)
class Store {
  static saveProduct(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

/// DOM Loaded ///////////
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const product = new Product();
  ui.wholeCart();

  product
    .search()
    .then(products => {
      ui.build(products);
      Store.saveProduct(products);
    })
    .then(() => {
      ui.getButtons();
      ui.cartLogic();
    });
});
