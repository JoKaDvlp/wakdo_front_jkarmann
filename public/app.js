/*

Table of contents :
    *1* : Objects
    *2* : Fetching data
    *3* : Sending data
    *4* : DOM construction function for fetch
    *5* : Event listener
    *6* : Dialog management
    *7* : Menus management
    *8* : Beverage management
    *9* : Other categories management
    *10* : functions

*/


let cart = {}
let articleToAdd = {}

//OBJETS METIER *1*
class Order {
    order_id=0;
    order=1;
    choix_lieu="";
    item={};
    service="";
    currentKey=0;
    constructor(choix_lieu, order, order_id){
        this.choix_lieu=choix_lieu
        this.order = order
        this.order_id = order_id
    }

    /**
     * Increment a unique key to add id on item added to cart
     * @returns incremented key
     */
    generateUniqueKey(){
        return this.currentKey++
    }
    /**
     * Add item to cart
     * @param {object} item an item to add to cart
     */
    addItem(item){
        this.item[this.generateUniqueKey()]=item
    }
    /**
     * delete item from cart
     * @param {integer} itemId 
     */
    removeItem(itemId){
        delete this.item[itemId]
    }
}

class Menus {
    category = "menus";
    article = 0;
    size = "Menu Maxi Best Of";
    side = "frites";
    beverage="";
    sauce="";
}

class Boissons {
    category= "boissons";
    article=0;
    size="";
    qty=1;
}

class Other {
    category= "";
    article=0;
    qty=1;
    constructor(category){
        this.category=category
    }
}

const classes = {
    Order,
    Menus,
    Boissons,
    Other,
}

// DATA COLLECT *2*
fetch('http://exam-back.jkarmann.mywebecom.ovh/api/get-categories')
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        buildCategoriesList(data)
    })
/**
 * Fetch products list depending on category to build products list
 */
function fetchProduct(category) {
    fetch('http://exam-back.jkarmann.mywebecom.ovh/api/get-products')
        .then(res=>{
            return res.json()
        })
        .then(data=>{
            buildProductsList(data[category], category)
        })
}
/**
 * Fetch products to build and display menu's components
 * @param {string} menuSize the size of the menus to display the correct picture of sides
 */
function fetchProductForMenus(menuSize){
    fetch('http://exam-back.jkarmann.mywebecom.ovh/api/get-products')
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        //List of beverage for menus
        buildProductsListForMenus([data["boissons"]],"beverage-choice-container")
        // List of sides for menus including fries and salads
        let sides = []
        if (menuSize === "1") {
            sides = filterSidesForMenu(data,[24,26],"frites")
        } else {
            sides = filterSidesForMenu(data,[22,25],"frites")
        }
        let salads = filterSidesForMenu(data,[60], "salades")
        
        buildProductsListForMenus([sides,salads], "side-choice-container")
        buildProductsListForMenus([data["sauces"]], "sauce-choice-container")
    })
}

/**
 * Fetch product to build and display the list of products added in the cart
 */
function fetchProductForCart(){
    fetch('http://exam-back.jkarmann.mywebecom.ovh/api/get-products')
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        buildCartList(data)
    })
}

// SEND DATA *3*

function sendData(cartData){
    console.log(cartData);
    
    try {
        fetch ("http://exam-back.jkarmann.mywebecom.ovh/api/add-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartData),
        })
        .then (response=>{
            return response.json();
        })
        .then (data => {
            console.log(data);
            
        })
    } catch (error) {
        console.error(error);
    }
}

// CONSTRUCTION DOM *4*
/**
 * Build a category list
 * @param {array} data list of category
 */
function buildCategoriesList(data){
    let categoriesList = document.querySelector(".container-categories ul")
    let html=""
    data.forEach(category => {
        html+=`
        <li class="category-card flex justify-center align-center" data-category="${category.title}" data-id="${category.id}">
            <div>
                <img class="img-responsive" src="./public/images${category.image}" alt="Photo de la catégorie ${category.title}">
            </div>
            <p>${category.title}</p>
        </li>
        `
        categoriesList.innerHTML = html
    });
}
/**
 * Build products list to display
 * @param {array} productsList an array of objects
 * @param {string} category name of the category
 */
function buildProductsList(productsList, category){
    buildIntroProducts(category)
    let articlesListArea = document.querySelector(".container-articles ul")
    let html=""
    productsList.forEach(product => {
        html += `
        <li class="article-card" data-image="${product.image}" data-category="${category}" data-id="${product.id}">
            <div>
                <img class="img-responsive" src="${product.image}" alt="Photo de ${product.nom}">
            </div>
            <p>${product.nom}</p>
            <p>${product.prix.toFixed(2)}€</p>
        </li>
        `
        articlesListArea.innerHTML = html
    });
}
/**
 * Build products list for menus dialog tag
 * @param {array} tabOfListOfProducts an array of list of products
 * @param {string} container the class name of a container where to display the list
 */
function buildProductsListForMenus(tabOfListOfProducts, container){
    let listArea = document.querySelector(`.${container}`)
    let html=""
    tabOfListOfProducts.forEach(listOfProducts => {
        listOfProducts.forEach(article => {
        html +=`
        <div class="btn-article-choice flex justify-center" data-id="${article.id}">
            <img src="${article.image}" alt="Photo de ${article.nom}">
            <p class="font-26 bold width-100">${article.nom}</p>
        </div>
        `
        listArea.innerHTML = html
    })});
    // 1st beverage by default
    document.querySelectorAll(`.${container} .btn-article-choice`)[0].classList.add("selected", "default-choice")
}
/**
 * Build the cart list to display
 * @param {object} data a list of products indexed by categories
 */
function buildCartList(data){
    document.querySelector(".order-summary-main").innerHTML=""
    let html = ""
    let total = 0
    for (let [key, article] of Object.entries(cart.item)) {
        let sideToFind = {}
        for (let [key, category] of Object.entries(data)) {
            let sideSearched = category.find(articleSearched => articleSearched.id == article.side)
            if (sideSearched != undefined) {
                sideToFind = sideSearched
            }
        }
        console.log(data);
        console.log(cart);
        
        
        let articleToFind = data[article.category].find(articleSearched => articleSearched.id == article.article)
        let beverageToFind = data["boissons"].find(beverageSearched => beverageSearched.id == article.beverage)
        let sauceToFind = data["sauces"].find(sauceSearched => sauceSearched.id == article.sauce)
        
        
        if (article.category == "menus") {
            total += articleToFind.prix
            
            if (article.size === "Menu Maxi Best Of") {
                total+=0.50
            }
            articleToFind.nom = eraseMenu(articleToFind.nom)
            let size = "";
            if (article.size == 1) {
                size = "Maxi Best Of"
            } else {
                size = "Best Of"
            }
            html +=`
            <li class="order-card">
                <div class="flex justify-between align-center">
                    <p class="bold">1 ${size} ${articleToFind.nom}</p>
                    <button class="trash" data-id="${key}">
                        <img src="./public/images/images/trash.png" alt="image du bouton de suppression de suppression">
                    </button>
                </div>
                <ul class="font-14">
                    <li>${sideToFind.nom}</li>
                    <li>Sauce ${sauceToFind.nom}</li>
                    <li>${beverageToFind.nom}</li>
                </ul>
            </li>
            `
        } else if (article.category == "boissons") {
            total += articleToFind.prix * article.qty
            let size = ""
            if (article.size == 2) {
                total+=0.50
                size = "50cl"
            } else {
                size = "30cl"
            }
            html +=`
            <li class="order-card">
                <div class="flex justify-between align-center">
                    <p class="bold">${article.qty} ${articleToFind.nom} ${size}</p>
                    <button class="trash" data-id="${key}">
                        <img src="./public/images/images/trash.png" alt="image du bouton de suppression">
                    </button>
                </div>
            </li>
            `
        } else {
            total += articleToFind.prix * article.qty
            html +=`
            <li class="order-card">
                <div class="flex justify-between align-center">
                    <p class="bold">${article.qty} ${articleToFind.nom}</p>
                    <button class="trash" data-id="${key}">
                        <img src="./public/images/images/trash.png" alt="image du bouton de suppression">
                    </button>
                </div>
            </li>
            `
        }
    }
    document.querySelector(".order-summary-main").innerHTML = html
    document.querySelector(".total-price").innerHTML = total.toFixed(2) + "€"
}

// ACTIONS *5*
// Event listener on placeToEatChoice
document.querySelectorAll(".btn-choice").forEach(btn => {
    btn.addEventListener("click", ()=>{
        fetch(`http://exam-back.jkarmann.mywebecom.ovh/api/prepare-order`)
            .then(response=>{
                return response.json();
            })
            .then(data=>{
                cart = new Order(btn.dataset.choice, data.order_number, data.order_id)
                document.getElementById("to-go-or-not").innerHTML = btn.dataset.choice
                document.getElementById("order-number").innerHTML = cart.order
                changePage("choice-area","order-area")
            })
    })
})
// Event listener on categories cards
document.querySelector(".container-categories ul").addEventListener("click", function(event){
    let categoryCard = event.target.closest(".category-card");
    if (categoryCard) {
        let articlesListArea = document.querySelector(".container-articles ul")
        articlesListArea.innerHTML = ""
        fetchProduct(categoryCard.dataset.category)
    }
})
// Event listener on products to display dialog and start adding products
document.querySelector(".container-articles ul").addEventListener("click", function(event){
    let productCard = event.target.closest(".article-card");
    if (productCard) {        
        let dataCategory = (productCard.dataset.category === "menus" || productCard.dataset.category === "boissons") ? productCard.dataset.category : "other"
        // New object instantiation depend on category
        if (dataCategory === "other") {
            document.querySelector(".img-other-choice").innerHTML =`<img src="${productCard.dataset.image}" alt="Photo du produit">`
            let className = camelize(dataCategory);
            articleToAdd = new classes[className](productCard.dataset.category)
        } else if (dataCategory === "boissons"){
            document.querySelector(".small-beverage").src =`${productCard.dataset.image}`
            document.querySelector(".big-beverage").src =`${productCard.dataset.image}`
            let className = camelize(dataCategory);
            articleToAdd = new classes[className]
        } else {
            let className = camelize(dataCategory);
            articleToAdd = new classes[className]
        }
        // Open modal
        document.getElementById(`${dataCategory}-choice`).showModal()

        articleToAdd.article = productCard.dataset.id
    }
})
// Event listener on closeBtn to undisplay dialog
document.querySelectorAll('dialog .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('dialog').close();
        resetDialog()
        articleToAdd={}
    });
});
// Event listener to delete an item from cart
document.querySelector(".order-summary-main").addEventListener("click", function(event){
    let deleteItem = event.target.closest(".trash");
    if (deleteItem) {
        cart.removeItem(deleteItem.dataset.id)
        fetchProductForCart()
    }
})
// Event listener to abandon the order
document.querySelector(".abandon-order").addEventListener("click", ()=>{
    changePage("order-area","choice-area")
    resetOrder()
})
// Event listener to validate the order
document.querySelector(".validate-order").addEventListener("click", ()=>{
    if (Object.keys(cart.item).length>0 && cart.choix_lieu === "Sur place") {
        changePage("order-area","table-choice-area")
        document.getElementById("num-1").focus()
    } else if (Object.keys(cart.item).length>0){
        changePage("order-area","thanks-area");
        sendData(cart);
        console.log(JSON.stringify(cart));
    }
})
// Event listener to switch automatically from an input to another
let inputs = document.querySelectorAll("#num-1,#num-2,#num-3")
inputs[0].focus()

inputs.forEach((input, pos) => {
    input.addEventListener("input", ()=>{
        if (input.value.length>0){
            if (pos<2) {
                inputs[pos+1].focus()
            }
        }
        if (input.value.length<1) {
            if (pos>0) {
                inputs[pos-1].focus()
            }
        }
    })
});
// Event listener to validate table choice and finalize the order
document.querySelector(".table-choice-form").addEventListener("submit", (e)=>{
    e.preventDefault()
    cart.service=""
    inputs.forEach(input =>{
        cart.service += input.value
    })
    if (tableChoiceIsValid()){
        sendData(cart);
        changePage("table-choice-area", "thanks-area")
        console.log(JSON.stringify(cart));
    }
})
// Event listener to start a new order after adding an order
document.querySelector(".new-order").addEventListener("click", ()=>{
    changePage("thanks-area", "choice-area")
    resetOrder()
    orderNumber++
})
// Event listener to scroll with arrow
const containers = document.querySelectorAll(".container-categories, .side-choice-container, .sauce-choice-container, .beverage-choice-container")
const scrollAmount = 300;

containers.forEach(container => {
    container.parentElement.querySelector(".arrow-left").addEventListener("click", ()=>{
        console.log("coucou gauche");
        
        container.scrollBy({
            top:0,
            left: -scrollAmount,
            behavior: "smooth"
        })
    })
    container.parentElement.querySelector(".arrow-right").addEventListener("click", ()=>{
        console.log("coucou droite");
        
        container.scrollBy({
            top:0,
            left: scrollAmount,
            behavior: "smooth"
        })
    })
});

// DIALOG MANAGEMENT *6*
// Menu dialog
let choiceSteps = document.querySelectorAll("#menus-choice>div")
let btnsNextStep = document.querySelectorAll("#menus-choice .next-step")
let btnsStepBack = document.querySelectorAll("#menus-choice .step-back")

btnsNextStep.forEach((btn, pos) => {
    btn.addEventListener("click", ()=>{
        choiceSteps.forEach(step => {
            step.classList.add("d-none")
        });
        if (pos + 1 < choiceSteps.length) {
            choiceSteps[pos + 1].classList.remove("d-none");
        }
    })
})

btnsStepBack.forEach((btn, pos) => {
    btn.addEventListener("click", ()=>{
        choiceSteps.forEach(step => {
            step.classList.add("d-none")
        });
        if (pos >= 0) {
            choiceSteps[pos].classList.remove("d-none");
        }
    })
})

// MENU MANAGEMENT *7*
// menu size choice
let btnsSizeChoice = document.querySelectorAll("#menu-size-choice .btn-size-choice")
btnsSizeChoice.forEach(btn => {
    btn.addEventListener("click", ()=>{
        btnsSizeChoice.forEach(btn => {
            btn.classList.remove("selected")
        });
        btn.classList.add("selected")
    })
});
let validateSize = document.querySelector("#menu-size-choice .next-step")
validateSize.addEventListener("click",()=>{
    articleToAdd.size = document.querySelector("#menu-size-choice div[class~='selected']").dataset.size
    fetchProductForMenus(articleToAdd.size)
})
// menu side choice
document.querySelector(".side-choice-container").addEventListener("click", function(event){
    document.querySelectorAll(".side-choice-container .btn-article-choice").forEach(btn=>{
        btn.classList.remove("selected")
    })
    let menuSideChoice = event.target.closest(".side-choice-container .btn-article-choice")
    if (menuSideChoice) {
        menuSideChoice.classList.add("selected")
    }
})
let nextStep1 = document.querySelector("#menu-side-choice .next-step")
nextStep1.addEventListener("click", ()=>{
    articleToAdd.side = document.querySelector("#menu-side-choice div[class~='selected']").dataset.id
})
// menu side choice
document.querySelector(".sauce-choice-container").addEventListener("click", function(event){
    document.querySelectorAll(".sauce-choice-container .btn-article-choice").forEach(btn=>{
        btn.classList.remove("selected")
    })
    let menuSideChoice = event.target.closest(".sauce-choice-container .btn-article-choice")
    if (menuSideChoice) {
        menuSideChoice.classList.add("selected")
    }
})
let nextStep2 = document.querySelector("#menu-sauce-choice .next-step")
nextStep2.addEventListener("click", ()=>{
    articleToAdd.sauce = document.querySelector("#menu-sauce-choice div[class~='selected']").dataset.id
})
// menu beverage choice
document.querySelector(".beverage-choice-container").addEventListener("click", function(event){
    document.querySelectorAll(".beverage-choice-container .btn-article-choice").forEach(btn=>{
        btn.classList.remove("selected")
    })
    let menuBeverageChoice = event.target.closest(".beverage-choice-container .btn-article-choice")
    if (menuBeverageChoice) {
        menuBeverageChoice.classList.add("selected")
    }
})
let validateMenu = document.querySelector("#menu-beverage-choice .add-choice")
validateMenu.addEventListener("click", ()=>{
    articleToAdd.beverage = document.querySelector("#menu-beverage-choice div[class~='selected']").dataset.id
    document.getElementById("menus-choice").close()
    addToCart(articleToAdd)
})

// BEVERAGE MANAGEMENT *8*
// Size choice
let sizeChoice = document.querySelectorAll("#boissons-choice .btn-article-choice")
sizeChoice.forEach(size =>{
    size.addEventListener("click", ()=>{
        sizeChoice.forEach(size=>{
            size.classList.remove("selected")
        })
        size.classList.add("selected")
    })
})
// Quantity choice
let beverageIncrement = document.querySelector("#boissons-choice .increment")
let beverageDecrement = document.querySelector("#boissons-choice .decrement")

beverageIncrement.addEventListener("click", ()=>{
    let beverageQty = document.querySelector(".beverage-qty")
    beverageQty.innerHTML++
})

beverageDecrement.addEventListener("click", ()=>{
    let beverageQty = document.querySelector(".beverage-qty")    
    if (beverageQty.innerHTML>1) {
        beverageQty.innerHTML--
    }
})
// beverage choice
let addBeverageChoice = document.querySelector("#boissons-choice .add-choice")

addBeverageChoice.addEventListener("click", ()=>{
    let beverageSize = document.querySelector("#boissons-choice div[class~='selected']").dataset.size
    let qty = document.querySelector("#boissons-choice .beverage-qty").innerHTML
    articleToAdd.size = beverageSize
    articleToAdd.qty = qty
    addToCart(articleToAdd)
    document.getElementById("boissons-choice").close()
    articleToAdd = {}
})

// OTHER CATEGORY MANAGEMENT *9*
let increment = document.querySelector("#other-choice .increment")
let decrement = document.querySelector("#other-choice .decrement")

increment.addEventListener("click", ()=>{
    let qty = document.querySelector(".qty")
    qty.innerHTML++
})

decrement.addEventListener("click", ()=>{
    let qty = document.querySelector(".qty")    
    if (qty.innerHTML>1) {
        qty.innerHTML--
    }
})
// beverage choice
let addOtherChoice = document.querySelector("#other-choice .add-choice")

addOtherChoice.addEventListener("click", ()=>{
    let qty = document.querySelector("#other-choice .qty").innerHTML
    articleToAdd.qty = qty
    addToCart(articleToAdd)
    document.getElementById("other-choice").close()
    articleToAdd = {}
})

// FUNCTIONS *10*
/**
 * Display title-list-articles depending on the category
 * @param {string} category name of a category
 */
function buildIntroProducts(category){
document.querySelector(".title-list-articles")
    let html = `<h2 class="regular font-28">Nos ${category}</h2>`
    switch (category) {
        case "menus":
            html +=`
            <p>Un sandwich, une friture ou une salade et une boisson </p>
            `
            break;
        case "boissons":
            html +=`
            <p>Une petite soif, sucrée, légère, rafraîchissante</p>
            `
            break;
        case "burgers":
            html +=`
            <p>Savourez l'excellence de nos burgers gourmands.</p>
            `
            break;
        case "frites":
            html +=`
            <p>Craquez pour nos frites ou potatoes croustillants à souhait.</p>
            `
            break;
        case "encas":
            html +=`
            <p>Des encas parfaits pour chaque petite faim.</p>
            `
            break;
        case "wraps":
            html +=`
            <p>Enveloppez-vous de saveurs avec nos wraps.</p>
            `
            break;
        case "salades":
            html +=`
            <p>Fraîcheur et légèreté dans chaque salade.</p>
            `
            break;
        case "desserts":
            html +=`
            <p>Un dessert, sucré, fondant, délicieux.</p>
            `
            break;
        case "sauces":
            html +=`
            <p>Pour accompagner vos frites, potatoes ou ce que vous voulez</p>
            `
            break;
    }
    document.querySelector(".title-list-articles").innerHTML = html
}
/**
 * Extract sides of the datalist of products
 * @param {object} data list of products from fetch
 * @param {*} tabIdOfSides the id of the sides to propose
 * @param {*} category the category where to find the side
 * @returns {array} an array of objects
 */
function filterSidesForMenu(data, tabIdOfSides, category){
    
    let tabOfSides = []
    tabIdOfSides.forEach(side=>{
        tabOfSides.push(data[category].find(sideToFind => sideToFind.id == side))        
    })
    console.log(tabOfSides);
    
    return tabOfSides;
}
/**
 * Add item to cart and reset articleToAdd, dialog and refresh the cart area
 * @param {object} articleToAdd the item to add to cart
 */
function addToCart(articleToAdd){
    cart.addItem(articleToAdd)
    articleToAdd={}    
    resetDialog()
    fetchProductForCart()
}
/**
 * Reset the dialog with default parameters
 */
function resetDialog(){
    document.querySelectorAll(".selected").forEach(selectedCard=>{
        selectedCard.classList.remove("selected")
    })
    document.querySelectorAll(".default-choice").forEach(defaultCard=>{
        defaultCard.classList.add("selected")
    })
    document.querySelectorAll(".beverage-qty").forEach(qty=>{
        qty.innerHTML = 1
    })
    document.querySelectorAll(".qty").forEach(qty=>{
        qty.innerHTML = 1
    })
    let steps = document.querySelectorAll("#menus-choice>div")
    steps.forEach(step=>{
        step.classList.add("d-none")
    })
    steps[0].classList.remove("d-none")
}
/**
 * Reset cart, articleToAdd, cart area of the DOM, the total price and the input.value for the table choice
 */
function resetOrder(){
    cart={}
    articleToAdd={}
    document.querySelector(".order-summary-main").innerHTML=""
    document.querySelector(".total-price").innerHTML = "0.00€"
    inputs.forEach(input=>{
        input.value=""
    })
}
/**
 * Undisplay the actual page and display the targetted page
 * @param {string} actualPageId the tag id of the actual page ("div")
 * @param {string} nextPageId the tag id of the targetted page ("div")
 */
function changePage(actualPageId, nextPageId){
    document.getElementById(`${actualPageId}`).classList.add("d-none")
    document.getElementById(`${nextPageId}`).classList.remove("d-none")
}
/**
 * Capîtalize the first letter of a string
 * @param {string} string a string where the first letter has to be capitalized
 * @returns a string with the first letter capitalized
 */
function camelize(string){
    let stringToCamelize = string.split('')
    stringToCamelize[0] = stringToCamelize[0].toUpperCase()
    stringToCamelize = stringToCamelize.join('')
    return stringToCamelize;
}
/**
 * Erase the word "menu" in the name of the item
 * @param {string} article the name of the article to process
 * @returns {string} the string modified
 */
function eraseMenu(article){
    article = article.split(' ')
    article.shift()
    article = article.join(' ')
    return article
}
/**
 * This function test if the input of table choice is correctly filled
 * @returns Boolean true if input is valid false otherwise
 */
function tableChoiceIsValid(){
    let reg = /^\d$/
    let isValid = true
    inputs.forEach(input=>{
        if (reg.test(input.value) == false) {
            isValid = false
        }
    })
    return isValid
}