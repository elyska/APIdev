// adapted from https://livecoventryac-my.sharepoint.com/:w:/g/personal/ab5169_coventry_ac_uk/EaUULlg7ZJhAjdnQ7FJINzoBwU5Feh5C7AF2IIErYO2TIA?e=ocVhuP
const {Validator, ValidationError} = require('jsonschema');

const productSchema = require('../schemas/product.json').definitions.product;
const productUpdateSchema = require('../schemas/product.json').definitions.productUpdate;
const userSchema = require('../schemas/user.json').definitions.user;
const orderSchema = require('../schemas/order.json').definitions.order;
const categorySchema = require('../schemas/category.json').definitions.category;

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
exports.validateProductUpdate = makeKoaValidator(productUpdateSchema, 'productUpdate');
exports.validateUser = makeKoaValidator(userSchema, 'user');
exports.validateOrder = makeKoaValidator(orderSchema, 'order');
exports.validateCategory = makeKoaValidator(categorySchema, 'category');