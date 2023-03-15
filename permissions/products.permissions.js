
/**
 * A module to create permissions for the Product resource.
 * @module permissions/products
 */

const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can view product
ac.grant('user').execute('read').on('product');

// admin can add a product
ac.grant('admin').execute('create').on('product');
// admin can update a product
ac.grant('admin').execute('update').on('product');
// admin can delete a product
ac.grant('admin').execute('delete').on('product');

/**
 * Wrapper that creates permissions to create new products.
 * @param {object} requester - Details of the user requesting permission
 */
exports.create = (requester) =>
  ac.can(requester.role).execute('create').sync().on('product');

/**
 * Wrapper that creates permissions to update a product.
 * @param {object} requester - Details of the user requesting permission
 */
exports.update = (requester) =>
  ac.can(requester.role).execute('update').sync().on('product');

/**
 * Wrapper that creates permissions to delete a product.
 * @param {object} requester - Details of the user requesting permission
 */
exports.delete = (requester) =>
  ac.can(requester.role).execute('delete').sync().on('product');
