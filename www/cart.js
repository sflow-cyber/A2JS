import { CartItem } from './cart-item.js';
import * as Frame from './frame.js';

/**
 * Adds a new item to the first position in the cart.
 *
 * @param cartItem An Item object
 */
export function add(cartItem) {
  if ("cart" in localStorage) {
    const data = JSON.parse(localStorage["cart"]);
    data.unshift(cartItem);
    localStorage["cart"] = JSON.stringify(data);
  } else {
    let data = [cartItem];
    localStorage["cart"] = JSON.stringify(data);
  }
}

/**
 * Removes an item from the cart
 *
 * @param position The position of the cart array.
 */
export function remove(position) {
  if ("cart" in localStorage) {
    const data = JSON.parse(localStorage["cart"]);
    data.splice(position, 1);
    localStorage["cart"] = JSON.stringify(data);
  }
}

/**
 * Get the Amount of items in the shopping cart in parantheses.
 *
 * @returns a String representation of the amount of items, e.g. "(2)" or "" if no items are in the cart.
 */
export function getAmountAsString() {
  const amount = JSON.parse(localStorage["cart"]).length;
  if (amount > 0) {
    return " (" + amount  + ")";
  } else {
    return "";
  }
}

/**
 * Get the Amount of items in the shopping cart as a number.
 *
 * @returns the amount of items as a number.
 */
export function getAmount() {
  const amount = JSON.parse(localStorage["cart"]).length;
  return amount;
}

/**
 * Get the items in the shopping cart as objects
 *
 * @returns an array of objects from the shopping cart
 */
export function getItems() {
  const items = JSON.parse(localStorage["cart"]);
  return items;
}

/**
 * draws all items from the shopping cart and links them to
 * their config page
 */
export async function drawAllItems() {
  let counter = 0;
  for (let item of getItems()) {
    let configUrl = "config.html?";
    configUrl += `objectID=${item.objectID}&`;
    configUrl += `printSize=${item.printSize}&`;
    configUrl += `frameStyle=${item.frameStyle}&`;
    configUrl += `frameWidth=${item.frameWidth}&`;
    configUrl += `matColor=${item.matColor}&`;
    configUrl += `matWidth=${item.matWidth}&`;

    const queryUrl = Frame.artworkUrl + item.objectID;
    var response;
    var artworks;
    try {
      response = await fetch(queryUrl, {method: 'GET'});
      artworks = await response.json();
    } catch(e) {
      continue;
    }
    if (typeof(response) == undefined || typeof(artworks) == undefined) {
      continue;
    }
    if (artworks.primaryImage.length == 0) {
      continue;
    }

    let itemHtml = `
      <div class="cart-item">
        <div class="cart-preview" id="preview-container-${counter}">
          <a href="">
            <img class="cart-thumb" src="${artworks.primaryImage}" id="preview-${counter}" alt="">
          </a>
        </div>
        <div class="museum-label">
          <div>
            <span class="artist">${artworks.artistDisplayName}</span>
            <span class="title">${artworks.title}</span>,
            <span class="date">${artworks.accessionYear}</span>
            <br><br>
            <span class="frame-description"></span>
          </div>
          <div class="cart-price">€ <span id="price-${counter}">0</span></div>
          <button type="button" class="cart-remove"></button>
        </div>
      </div>`;
    let cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = itemHtml + cartDiv.innerHTML;
    let img = document.getElementById("preview-" + counter);
    let div = document.getElementById("preview-container-" + counter);
    img.style.visibility = "hidden";
    img.onload = function() { 
      Frame.render(img, div, item.printSize, item.frameStyle, item.frameWidth, item.matColor, item.matWidth);
      img.style.visibility = "visible";
    }
    document.querySelector(`#preview-container-${counter++} > a`).href = configUrl;
  }
}