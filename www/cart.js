import { CartItem } from './cart-item.js';

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
 * Get an item with specific objectID from the cart as object
 * 
 * @returns an object from the shopping cart or null
 */
export function getItem(objectID) {
  const items = JSON.parse(localStorage["cart"]);
  for (let item of items) {
    if (item.objectID == objectID) {
      return item;
    }
  }
  return null;
}