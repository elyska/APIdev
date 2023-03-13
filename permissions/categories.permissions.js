const AccessControl = require('role-acl')
const ac = new AccessControl();

// user can view category
ac.grant('user').execute('read').on('category');

// admin can add a category
ac.grant('admin').execute('create').on('category');
// admin can delete a category
ac.grant('admin').execute('delete').on('category');

exports.create = (requester) =>
  ac.can(requester.role).execute('create').sync().on('category');

exports.delete = (requester) =>
  ac.can(requester.role).execute('delete').sync().on('category');
