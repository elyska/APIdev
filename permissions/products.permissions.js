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

exports.create = (requester) =>
  ac.can(requester.role).execute('create').sync().on('product');

exports.update = (requester) =>
  ac.can(requester.role).execute('update').sync().on('product');

exports.delete = (requester) =>
  ac.can(requester.role).execute('delete').sync().on('product');
