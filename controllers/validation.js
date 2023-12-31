// adapted from https://livecoventryac-my.sharepoint.com/:w:/g/personal/ab5169_coventry_ac_uk/EaUULlg7ZJhAjdnQ7FJINzoBwU5Feh5C7AF2IIErYO2TIA?e=ocVhuP and https://livecoventryac-my.sharepoint.com/:w:/r/personal/ab5169_coventry_ac_uk/_layouts/15/Doc.aspx?sourcedoc=%7B1cbd2ea0-07df-4c8a-9b6d-dc21797b38b7%7D&action=view&wdAccPdf=0&wdparaid=51FDED3B

/**
 * A module to run JSON Schema based validation on request/response data.
 * @module controllers/validation
 * @see schemas/* for JSON Schema definition files
 */

const {Validator, ValidationError} = require('jsonschema');

const productSchema = require('../schemas/product.json').definitions.productCreate;
const productUpdateSchema = require('../schemas/product.json').definitions.productUpdate;
const userSchema = require('../schemas/user.json').definitions.userCreate;
const userLoginSchema = require('../schemas/user.json').definitions.userLogin;
const orderSchema = require('../schemas/order.json').definitions.addOrder;
const categorySchema = require('../schemas/category.json').definitions.categoryCreate;

/**
 * Wrapper that returns a Koa middleware validator for a given schema.
 * @param {object} schema - The JSON schema definition of the resource
 * @param {string} resource - The name of the resource e.g. 'article'
 * @returns {function} - A Koa middleware handler taking (ctx, next) params
 */

const makeKoaValidator = (schema, resource) => {

  const v = new Validator();
  const validationOptions = {
    throwError: true,
    propertyName: resource
  };

  /**
   * Koa middleware handler function to do validation
   * @param {object} ctx - The Koa request/response context object
   * @param {function} next - The Koa next callback
   * @throws {ValidationError} a jsonschema library exception
   */
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

/** Validate data against product schema */
exports.validateProduct = makeKoaValidator(productSchema, 'product');
/** Validate data against productUpdate schema */
exports.validateProductUpdate = makeKoaValidator(productUpdateSchema, 'productUpdate');
/** Validate data against userCreate schema */
exports.validateUser = makeKoaValidator(userSchema, 'user');
/** Validate data against userLogin schema */
exports.validateUserLogin = makeKoaValidator(userLoginSchema, 'validateUserLogin');
/** Validate data against addOrder schema */
exports.validateOrder = makeKoaValidator(orderSchema, 'order');
/** Validate data against categoryCreate schema */
exports.validateCategory = makeKoaValidator(categorySchema, 'category');