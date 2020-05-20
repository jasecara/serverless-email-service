const Joi = require("@hapi/joi");

const validationSchema = (schema) => {
  return Joi.object(schema);
};

const rules = {
  EMAIL: Joi.string().email(),
  STRING: Joi.string(),
  ARRAY: Joi.array(),
  OBJECT: Joi.object,
  ANY: Joi.any(),
};

module.exports = {
  Joi,
  validationSchema,
  rules,
};
