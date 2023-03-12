
// get line items for stripe payment
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
