
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

exports.readAll = (requester) =>
  ac.can(requester.role).execute('read').sync().on('orders');

exports.read = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('read').sync().on('order');

exports.pay = (requester, data) =>
  ac.can(requester.role).context({requester:requester.email, owner:data.email}).execute('pay').sync().on('order');