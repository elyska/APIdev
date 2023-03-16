
const request = require('supertest')
const app = require('../app.js')

it('Check if test_db is used', ()=> {
  expect(process.env.DB_DATABASE).toBe('test_db');
});

describe('Add a new user', () => {
  it('should add a new user', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 1',
        password: 'password',
        email: 'test_user_1@email.com'
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('email', 'test_user_1@email.com');
  });

  it('should not add a user if email is missing', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 2',
        password: 'password',
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property "email"');
  });

  it('should not add a user if name is missing', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        password: 'password',
        email: 'test_user_3@email.com'
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property "name"');
  });

  it('should not add a user if password is missing', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 2',
        email: 'test_user_3@email.com'
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'requires property "password"');
  });

  it('should not add a user if there is an additional property', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 2',
        password: 'password',
        email: 'test_user_3@email.com',
        role: 'admin'
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'is not allowed to have the additional property \"role\"');
  });

  it('should not add a user if email is not unique', async ()=> {
    await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 3',
        password: 'password',
        email: 'test_user_3@email.com'
      });
    const response = await request(app.callback()).
      post('/api/v1/users').
      send({
        name: 'test user 4',
        password: 'password',
        email: 'test_user_3@email.com'
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Validation error');
  });
});

describe('Login', () => {
  it('should log in if details are correct', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should not log in if details are incorrect', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'incorrect'
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Incorrect email or password');
  });
});

describe('Refresh', () => {
  it('should give new tokens if refresh token is valid', async ()=> {
    // log in to get a valid refresh token
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const refreshToken = loginResponse.body.refreshToken;
    // refresh to get new tokens
    const response = await request(app.callback()).
      post('/api/v1/users/refresh').
      send({
        refreshToken: refreshToken
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should return error if refresh token is invalid', async ()=> {
    const response = await request(app.callback()).
      post('/api/v1/users/refresh').
      send({
        refreshToken: 'invalid'
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('message', 'jwt malformed');
  });

  it('should return error if refresh token is valid but not in the database', async ()=> { 
    // log in to get a valid refresh token that will be saved in the database
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const refreshToken = loginResponse.body.refreshToken;
    // refresh to get new tokens and remove old refresh token from the database
    const refreshResponse = await request(app.callback()).
      post('/api/v1/users/refresh').
      send({
        refreshToken: refreshToken
      });
    // refresh again using the old refresh token that was removed
    const response = await request(app.callback()).
      post('/api/v1/users/refresh').
      send({
        refreshToken: refreshToken
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });
});

describe('Get all users', () => {
  it('should return all users if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/')
      .set('Authorization', accessToken);
    const expected = [ { ID: 1, name: 'admin', email: 'admin@admin.com', role: 'admin' }, { ID: 2, name: 'user1', email: 'user1@user.com', role: 'user' } ];
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expect.arrayContaining(expected));
  });

  it('should not return all users if non-admin user is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });
});

describe('Get a user by id', () => {
  it('should return user details if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/2')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('ID');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('role');
  });

  it('should return user details if owner of the account is logged in', async ()=> {
    // log in as the owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/2')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('ID');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('role');
  });

  it('should not return user details if a non-admin user tries to read details of an account they do not own', async ()=> {
    // log in as a user (not owner)
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/3')
      .set('Authorization', accessToken);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should return an error if the user is not found', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      get('/api/v1/users/100')
      .set('Authorization', accessToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'User does not exist');
  });
});


describe('Delete a user by id', () => {
  it('should delete a user if admin is logged in', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      del('/api/v1/users/5')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('message', 'User 5 deleted');
  });

  it('should not delete a user if admin is logged in and tries to delete their own account', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      del('/api/v1/users/1')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should not delete a user if non-admin user is logged in', async ()=> {
    // log in as the owner
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'user1@user.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      del('/api/v1/users/4')
      .set('Authorization', accessToken);
      
    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Permission not granted');
  });

  it('should return an error if the user is not found', async ()=> {
    // log in as an admin
    const loginResponse = await request(app.callback()).
      post('/api/v1/users/login').
      send({
        email: 'admin@admin.com',
        password: 'asd'
    });
    const accessToken = loginResponse.body.accessToken;
    // get users
    const response = await request(app.callback()).
      del('/api/v1/users/100')
      .set('Authorization', accessToken);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty('message', 'User does not exist');
  });
});