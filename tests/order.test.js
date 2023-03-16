
const request = require('supertest')
const app = require('../app.js')


describe('Place an order', () => {
  it('should add an order', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/orders').
      send({
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "products": [
          {
            "productId": 1,
            "quantity": 5
          }
        ]
      });

    const expectedProduct = [
      {
        "ID": 1,
        "productId": 1,
        "quantity": 5,
        "orderId": 1
      }
    ];

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('userId', 2);
    expect(response.body).toHaveProperty('address', 'Coventry, CV1 5AB');
    expect(response.body).toHaveProperty('paid', false);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
    expect(response.body).toHaveProperty('products');
    expect(response.body.products).toEqual(expect.arrayContaining(expectedProduct));
  });

  it('should not add an order if validation fails', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/orders').
      send({
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "products": [
          {
            "productId": 1
          }
        ]
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property \"quantity\"');
  });
});

describe('Get all orders', () => {
  it('should return all orders if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get orders
    const response = await request(app.callback()).
      get('/api/v1/orders').
      set('Authorization', accessToken);

    const expected = {
        "ID": 1,
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "paid": false,
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "products": [{
          "ID": 1,
          "title": "Product 1",
          "description": "description",
          "image": "url",
          "price": 12.99,
          "orderItems": {
            "ID": 1,
            "productId": 1,
            "quantity": 5,
            "orderId": 1
          }
        }]
      };
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining(expected)
    ]));
  });
});

describe('Get an order by id', () => {
  it('should return order details if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get order
    const response = await request(app.callback()).
      get('/api/v1/orders/1').
      set('Authorization', accessToken);

    const expected = {
        "ID": 1,
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "paid": false,
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "products": [{
          "ID": 1,
          "title": "Product 1",
          "description": "description",
          "image": "url",
          "price": 12.99,
          "orderItems": {
            "ID": 1,
            "productId": 1,
            "quantity": 5,
            "orderId": 1
          }
        }]
      };
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.objectContaining(expected));
  });

  it('should return order details if owner of the order is logged in', async ()=> {
    // log in as an owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get order
    const response = await request(app.callback()).
      get('/api/v1/orders/1').
      set('Authorization', accessToken);

    const expected = {
        "ID": 1,
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "paid": false,
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "products": [{
          "ID": 1,
          "title": "Product 1",
          "description": "description",
          "image": "url",
          "price": 12.99,
          "orderItems": {
            "ID": 1,
            "productId": 1,
            "quantity": 5,
            "orderId": 1
          }
        }]
      };
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.objectContaining(expected));
  });

  it('should not return order details if a non-admin and non-owner user is logged in', async ()=> {
    // log in as a user (not owner)
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user2@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get order
    const response = await request(app.callback()).
      get('/api/v1/orders/1').
      set('Authorization', accessToken);
                       
    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should return an error message if order does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get order
    const response = await request(app.callback()).
      get('/api/v1/orders/100').
      set('Authorization', accessToken);
                       
    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'Order not found');
  });
});

describe('Get all orders by user id', () => {
  it('should return all orders of a user if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get order
    const response = await request(app.callback()).
      get('/api/v1/orders/user/2').
      set('Authorization', accessToken);

    const expected = {
        "ID": 1,
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "paid": false,
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "products": [{
          "ID": 1,
          "title": "Product 1",
          "description": "description",
          "image": "url",
          "price": 12.99,
          "orderItems": {
            "ID": 1,
            "productId": 1,
            "quantity": 5,
            "orderId": 1
          }
        }]
      };
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining(expected)
    ]));
  });

  it('should return orders of a user if the user is the owner of the orders', async ()=> {
    // log in as an owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    
    // get orders
    const response = await request(app.callback()).
      get('/api/v1/orders/user/2').
      set('Authorization', accessToken);

    const expected = {
        "ID": 1,
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "paid": false,
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "products": [{
          "ID": 1,
          "title": "Product 1",
          "description": "description",
          "image": "url",
          "price": 12.99,
          "orderItems": {
            "ID": 1,
            "productId": 1,
            "quantity": 5,
            "orderId": 1
          }
        }]
      };
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining(expected)
    ]));
  });

  it('should not return order details if a non-admin and non-owner user is logged in', async ()=> {
    // log in as a user (not owner)
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user2@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get orders
    const response = await request(app.callback()).
      get('/api/v1/orders/user/2').
      set('Authorization', accessToken);
                       
    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should return an error message if user does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // get orders
    const response = await request(app.callback()).
      get('/api/v1/orders/user/100').
      set('Authorization', accessToken);
                       
    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});

describe('Pay for an order', () => {
  it('should pay for an order', async ()=> {
    // log in as the owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // pay
    const response = await request(app.callback()).
      post('/api/v1/orders/1/payment').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('payment', expect.any(String));
  });

  it('should not pay for an order if owner is not logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user2@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // pay
    const response = await request(app.callback()).
      post('/api/v1/orders/1/payment').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
  
  it('should pay for an order if it does not exist', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // pay
    const response = await request(app.callback()).
      post('/api/v1/orders/100/payment').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'Order not found');
  });
  
  it('should not pay for an order if it was already paid', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // add new order
    const orderResponse = await request(app.callback()).
      post('/api/v1/orders').
      send({
        "userId": 2,
        "address": "Coventry, CV1 5AB",
        "products": [
          {
            "productId": 2,
            "quantity": 1
          }
        ]
      });

    // complete payment
    await request(app.callback()).
      post(`/api/v1/orders/${orderResponse.body.ID}/payment-completed`).
      set('Authorization', accessToken);

    // pay
    const response = await request(app.callback()).
      post(`/api/v1/orders/${orderResponse.body.ID}/payment`).
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Order is already paid for');
  });
});


describe('Complete payment', () => {
  it('should not complete payment if owner is not logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user2@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // complete payment
    const response = await request(app.callback()).
      post('/api/v1/orders/1/payment-completed').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should complete payment', async ()=> {
    // log in as the owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // complete payment
    const response = await request(app.callback()).
      post('/api/v1/orders/1/payment-completed').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('message', "Payment completed");
  });
  
  it('should not complete payment if order does not exist', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // complete payment
    const response = await request(app.callback()).
      post('/api/v1/orders/100/payment-completed').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'Order not found');
  });
  
  it('should not complete payment if order was already paid', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;

    // complete payment
    const response = await request(app.callback()).
      post('/api/v1/orders/1/payment-completed').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Order is already paid for');
  });
});
