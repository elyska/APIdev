// adapted from https://livecoventryac-my.sharepoint.com/:w:/g/personal/ab5169_coventry_ac_uk/EaUULlg7ZJhAjdnQ7FJINzoBwU5Feh5C7AF2IIErYO2TIA?e=ocVhuP
const {Validator, ValidationError} = require('jsonschema');

const productSchema = require('../schemas/product.json').definitions.product;
const userSchema = require('../schemas/user.json').definitions.user;

const makeKoaValidator = (schema, resource) => {

  const v = new Validator();
  const validationOptions = {
    throwError: true,
    propertyName: resource
  };
  
  const handler = async (ctx, next) => {

    const body = ctx.request.body;

    try {
      v.validate(body, schema, validationOptions);
      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(error);
        ctx.status = 400
        ctx.body = { "message": error.message };
      } else {
        throw error;
      }
    }
  }
  return handler;
}

exports.validateProduct = makeKoaValidator(productSchema, 'product');
exports.validateProductUpdate = makeKoaValidator(productSchema, 'product'); // TODO: schema - properties not required
exports.validateUser = makeKoaValidator(userSchema, 'user');
