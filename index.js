/**
  A module to start the Koa app and listen on a port.
  @module index
*/

const app = require('./app.js')

let port = process.env.PORT || 3000;

app.listen(3000, () => console.log('Listening on port ' + port));