//Responsive Navbar
const icons = document.querySelector('.fa-bars')
const navMenu = document.querySelector('.nav-links')
icons.addEventListener('click', ()=>{
  navMenu.classList.toggle('active')
  icons.classList.toggle('active')
})

//Variables

const cartBtn = document.querySelector(".cart-btn");
const closecartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartoverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartCotent = document.querySelector(".cart-content");
const productDom = document.querySelector(".product-center");

//cart
let cart = [];
let buttonsDom = [];
//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
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

//display product
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
   <article class="product">
  <div class="img-container">
    <img src= ${product.image} alt="" class="product-img" />
    <button class="bag-btn" data-id=${product.id}>
      <i class="fas fa-shopping-cart"></i>
      add to bag
    </button>
  </div>
  <h4>${product.title}</h4>
  <h5>${product.price}</h5>
</article>
  `;
    });
    productDom.innerHTML = result;
  }

  getBagButton() {
    const buttons = [...document.querySelectorAll(".bag-btn")]
    buttonsDom = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id)
      if (inCart) {
        button.innerText = "In Cart"
        button.disabled = true
      }

      button.addEventListener('click', (event) => {
        event.target.innerText = "In Cart"
        event.target.disabled = true;

        //get Product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };

        //Add product to cart
        cart = [...cart, cartItem];

        //save cart in local storage
        Storage.saveCart(cart)

        //set cart values
        this.setCartvalues(cart);

        //display cart item
        this.addCartItem(cart)
        //show cart
        this.showcart();

      })


    })

  }
  setCartvalues(cart) {
    let temptotal = 0;
    let itemTotal = 0;
    cart.map(item => {
      temptotal += item.price * item.amount;
      itemTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(temptotal.toFixed(2))
    cartItems.innerHTML = itemTotal

  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
`;
    cartCotent.appendChild(div);

  }
  showcart() {
    cartoverlay.classList.add('transparentBcg')
    cartDom.classList.add('showCart')
  }

  setupAPP() {
    cart = Storage.getcart();
    this.setCartvalues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showcart);
    closecartBtn.addEventListener('click', this.hidecart);

  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hidecart() {
    cartoverlay.classList.remove('transparentBcg')
    cartDom.classList.remove('showCart')
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    });
    //cart Functionality
    cartCotent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartCotent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id);
        // Storage.saveCart(cart)
      }
      else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartvalues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount
      }
      else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartvalues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartCotent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id);
        }
      }

    })
  }
  clearCart() {
    let cartItems = cart.map(item => item.id)
    cartItems.forEach(id => this.removeItem(id))
    console.log(cartCotent.children)
    while (cartCotent.children.length > 0) {
      cartCotent.removeChild(cartCotent.children[0])
    }
    this.hidecart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartvalues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDom.find(button => button.dataset.id === id)
  }

}
//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getcart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app

  ui.setupAPP()

  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButton();
      ui.cartLogic()
    });
});
