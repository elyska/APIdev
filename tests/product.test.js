
const request = require('supertest')
const app = require('../app.js')

describe('Get all products', () => {
  it('should return all products', async ()=> {
    const response = await request(app.callback()).
      get('/api/v1/products');

    const expected = [ {"ID": 1, "description": "description", "image": "url", "price": 12.99, "title": "Product 1"}, 
                       {"ID": 2, "description": "description", "image": "url", "price": 10.99, "title": "Product 2"} ];
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining(expected));
  });
});

describe('Get a product by id', () => {
  it('should return product details', async ()=> {
    const response = await request(app.callback()).
      get('/api/v1/products/1');

    const expected = {"ID": 1, "description": "description", "image": "url", "price": 12.99, "title": "Product 1"};
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expected);
  });

  it('should return error message if product is not found', async ()=> {
    const response = await request(app.callback()).
      get('/api/v1/products/100');

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'Product does not exist');
  });
});

describe('Add a new product', () => {
  it('should add a product if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add product
    const response = await request(app.callback()).
      post('/api/v1/products').
      set('Authorization', accessToken).
      send({
        "title": "New Product",
        "description": "description",
        "image": "https://pixabay.com/photos/tree-sunset-clouds-sky-silhouette-736885/",
        "price": 12.99
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('title', "New Product");
    expect(response.body).toHaveProperty('description', "description");
    expect(response.body).toHaveProperty('image', "https://pixabay.com/photos/tree-sunset-clouds-sky-silhouette-736885/");
    expect(response.body).toHaveProperty('price', 12.99);
  });

  it('should not add a product if required properties are missing', async ()=> {
    // log in as aa admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add product
    const response = await request(app.callback()).
      post('/api/v1/products').
      set('Authorization', accessToken).
      send({
        "title": "New Product",
        "description": "description",
        "image": "https://pixabay.com/photos/tree-sunset-clouds-sky-silhouette-736885/"
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property \"price\"');
  });

  it('should not add a product if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add product
    const response = await request(app.callback()).
      post('/api/v1/products').
      set('Authorization', accessToken).
      send({
        "title": "New Product",
        "description": "description",
        "image": "https://pixabay.com/photos/tree-sunset-clouds-sky-silhouette-736885/",
        "price": 12.99
      });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Update a product', () => {
  it('should update a product if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // update a product
    const response = await request(app.callback()).
      put('/api/v1/products/1').
      set('Authorization', accessToken).
      send({
        "title": "Updated Product",
        "price": 5
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('message', '1 product updated');
  });

  it('should not update a product if the properties are not different from the existing ones', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    const accessToken = loginResponse.body.accessToken;
    // update a product
    const response = await request(app.callback()).
      put('/api/v1/products/2').
      set('Authorization', accessToken).
      send({
        "title": "Product 2"
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Product was not updated');
  });

  it('should not update a product if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add product
    const response = await request(app.callback()).
      put('/api/v1/products/1').
      set('Authorization', accessToken).
      send({
        "title": "Product"
      });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Delete a product', () => {
  it('should be deleted if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete a product
    const response = await request(app.callback()).
      del('/api/v1/products/5').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('message', '1 product deleted');
  });

  it('should not delete a product if it does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete a product
    const response = await request(app.callback()).
      del('/api/v1/products/100').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Product was not deleted');
  });

  it('should not delete a product if a non-admin user is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete a product
    const response = await request(app.callback()).
      del('/api/v1/products/1').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});