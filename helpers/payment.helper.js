
/**
 * A helper module for Stripe payments.
 * @module helpers/payment
 */

/**
 * An object containing product details
 * @typedef {Object} Product
 * @property {string} title - name of the product
 * @property {integer} price - price of the product
 * @property {string} description - multiline description of the product
 * @property {string} image - URL of the product image
 * @property {OrderItem} orderItems - order item details
 */

/**
 * An object containing order item details
 * @typedef {Object} OrderItem
 * @property {integer} ID - ID of the order item
 * @property {integer} productId - ID of the ordered product
 * @property {integer} quantity - Quantity of the ordered product
 * @property {integer} orderId - ID of the order
 */

/**
 * An object containing line item details
 * @typedef {Object} LineItem
 * @property {string} name - name of the product
 * @property {string} currency - currency for the price
 * @property {integer} amount - price of the product
 * @property {integer} quantity - number of products
 */

/**
 * A function to create line items from order items for Stripe payments.
 * @param {Product} products - Ordered product details
 * @returns {LineItem} - The line items
 */
exports.getLineItems = function getLineItems(products) {
  let lineItems = []
  for (let i = 0; i < products.length; i++) {
    let item = {
        name: products[i].title,
        currency: 'gbp',
        amount: products[i].price * 100, // amount in pence
        quantity: products[i].orderItems.quantity,
    }
    lineItems.push(item);
  }

  return lineItems;
}
