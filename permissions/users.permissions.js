// adapted from https://livecoventryac-my.sharepoint.com/:w:/g/personal/ab5169_coventry_ac_uk/EWzkIubzgypGrJ_c8Z7G7N0BnYxTve6MJl7Qa5_acln0WQ?e=aLAJyW

/**
 * A module to create permissions for the User resource.
 * @module permissions/users
 */

const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can view their own account
ac.grant('user').condition({Fn: 'EQUALS', args: {'requester':'$.owner'}}).execute('read')
  .on('user', ['*', '!dataValues.password']);
// user can delete their own account
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('delete')
  .on('user');

// admin can view a user
ac.grant('admin').execute('read').on('user', ['*', '!dataValues.password']);
// admin can view all users
ac.grant('admin').execute('read').on('users');
// admin can delete other accounts except their own
ac.grant('admin').condition({Fn:'NOT_EQUALS', args:{'requester':'$.owner'}}).execute('delete').on('user');

/**
 * Wrapper that creates permissions to read all users details.
 * @param {object} requester - Details of the user requesting permission
 */
exports.readAll = (requester) =>
  ac.can(requester.role).execute('read').sync().on('users');

/**
 * Wrapper that creates permissions to read details of a user.
 * @param {object} requester - Details of the user requesting permission
 * @param {object} data - Details of the owner of the user account
 */
exports.read = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('read').sync().on('user');

/**
 * Wrapper that creates permissions to delete a user.
 * @param {object} requester - Details of the user requesting permission
 * @param {object} data - Details of the owner of the user account
 */
exports.delete = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('delete').sync().on('user');
