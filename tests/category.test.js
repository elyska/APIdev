
const request = require('supertest')
const app = require('../app.js')

describe('Get all categories', () => {
  it('should return all categories', async ()=> {
    const response = await request(app.callback()).
      get('/api/v1/categories');

    const expected = [
      {
        "ID": 1,
        "title": "Category 1"
      },
      {
        "ID": 2,
        "title": "Category 2"
      }
    ];
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining(expected));
  });
});

describe('Add a new category', () => {
  it('should add a category if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add category
    const response = await request(app.callback()).
      post('/api/v1/categories').
      set('Authorization', accessToken).
      send({
        "title": "New category"
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('ID');
    expect(response.body).toHaveProperty('title', "New category");
  });

  it('should not add a category if validation fails', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add category
    const response = await request(app.callback()).
      post('/api/v1/categories').
      set('Authorization', accessToken).
      send({
        "incorrectProperty": "New category"
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property \"title\"');
  });

  it('should not add a category if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add category
    const response = await request(app.callback()).
      post('/api/v1/categories').
      set('Authorization', accessToken).
      send({
        "title": "New category"
      });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Add a product to a category', () => {
  it('should add a product to the category if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add to category
    const response = await request(app.callback()).
      post('/api/v1/categories/1/product/3').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('ID');
    expect(response.body).toHaveProperty('productId', '3');
    expect(response.body).toHaveProperty('categoryId', '1');
  });

  it('should not add a product to the category if it was already added', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add to category
    const response = await request(app.callback()).
      post('/api/v1/categories/1/product/3').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', "Duplicate entry '3-1' for key 'categoryItems_categoryId_productId_unique'");
  });

  it('should not add a product to the category if product does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add to category
    const response = await request(app.callback()).
      post('/api/v1/categories/1/product/100').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual(expect.stringContaining("Cannot add or update a child row"));
  });

  it('should not add a product to the category if category does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add to category
    const response = await request(app.callback()).
      post('/api/v1/categories/100/product/3').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual(expect.stringContaining("Cannot add or update a child row"));
  });

  it('should not add a product to the category if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // add to category
    const response = await request(app.callback()).
      post('/api/v1/categories/1/product/5').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Delete a product from a category', () => {
  it('should delete a product from the category if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete from category
    const response = await request(app.callback()).
      del('/api/v1/categories/1/product/3').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('message', '1 product deleted from category 1');
  });

  it('should not delete a product from the category if it was not added or product/category do not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete from category
    const response = await request(app.callback()).
      del('/api/v1/categories/1/product/6').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', "Product was not deleted");
  });

  it('should not delete a product from the category if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete from category
    const response = await request(app.callback()).
      post('/api/v1/categories/1/product/5').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Get all products in a category', () => {
  it('should return all products in a category', async ()=> {
    const response = await request(app.callback()).
      get('/api/v1/categories/1');

    const expected = [
      {
        "ID": 1,
        "title": "Product 1",
        "description": "description",
        "image": "url",
        "price": 12.99,
        "categoryItems": {
          "ID": 1,
          "productId": 1,
          "categoryId": 1
        }
      }
    ];
                       
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining(expected));
  });
});

describe('Delete a category by id', () => {
  it('should delete a category if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete category
    const response = await request(app.callback()).
      del('/api/v1/categories/4').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('message', "1 category deleted");
  });

  it('should not delete a category if it does not exist', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete category
    const response = await request(app.callback()).
      del('/api/v1/categories/100').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Category was not deleted');
  });

  it('should not delete a category if non-admin is logged in', async ()=> {
    // log in as a user
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // delete category
    const response = await request(app.callback()).
      del('/api/v1/categories/1').
      set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});
