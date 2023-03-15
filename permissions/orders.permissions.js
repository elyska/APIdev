
/**
 * A module to create permissions for the Order resource.
 * @module permissions/orders
 */

const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can pay their own order
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('pay')
  .on('order');
// user can view their own order
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('read')
  .on('order');

// admin can view all orders
ac.grant('admin').execute('read').on('orders');
// admin can view any order
ac.grant('admin').execute('read').on('order');

/**
 * Wrapper that creates permissions to read all orders details.
 * @param {object} requester - Details of the user requesting permission
 */
exports.readAll = (requester) =>
  ac.can(requester.role).execute('read').sync().on('orders');

/**
 * Wrapper that creates permissions to read details of an order.
 * @param {object} requester - Details of the user requesting permission
 * @param {object} data - Details of the owner of the order
 */
exports.read = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('read').sync().on('order');

/**
 * Wrapper that creates permissions to pay for an order.
 * @param {object} requester - Details of the user requesting permission
 * @param {object} data - Details of the owner of the order
 */
exports.pay = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('pay').sync().on('order');