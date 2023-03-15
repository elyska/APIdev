
/**
 * A module to create permissions for the Category resource.
 * @module permissions/categories
 */

const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can view category
ac.grant('user').execute('read').on('category');

// admin can add a category
ac.grant('admin').execute('create').on('category');
// admin can delete a category
ac.grant('admin').execute('delete').on('category');

/**
 * Wrapper that creates permissions to create new categories.
 * @param {object} requester - Details of the user requesting permission
 */
exports.create = (requester) =>
  ac.can(requester.role).execute('create').sync().on('category');

/**
 * Wrapper that creates permissions to delete new categories.
 * @param {object} requester - Details of the user requesting permission
 */
exports.delete = (requester) =>
  ac.can(requester.role).execute('delete').sync().on('category');
