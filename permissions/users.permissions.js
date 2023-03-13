// adapted from https://livecoventryac-my.sharepoint.com/:w:/g/personal/ab5169_coventry_ac_uk/EWzkIubzgypGrJ_c8Z7G7N0BnYxTve6MJl7Qa5_acln0WQ?e=aLAJyW

const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can view their own account
ac.grant('user').condition({Fn: 'EQUALS', args: {'requester':'$.owner'}}).execute('read')
  .on('user', ['dataValues.ID', 'dataValues.name', 'dataValues.email', 'dataValues.role']);
// user can delete their own account
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('delete')
  .on('user');

// admin can view a user
ac.grant('admin').execute('read').on('user', ['dataValues.ID', 'dataValues.name', 'dataValues.email', 'dataValues.role']);
// admin can view all users
ac.grant('admin').execute('read').on('users');
// admin can delete other accounts except their own
ac.grant('admin').condition({Fn:'NOT_EQUALS', args:
{'requester':'$.owner'}}).execute('delete').on('user');

exports.readAll = (requester) =>
ac.can(requester.role).execute('read').sync().on('users');

exports.read = (requester, data) =>
ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('read').sync().on('user');

exports.delete = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('delete').sync().on('user');
