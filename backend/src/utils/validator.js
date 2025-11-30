const Joi = require('joi');
const formSchema = require('../data/formSchema');

function buildJoiSchema() {
  const joiSchemaMap = {};

  formSchema.fields.forEach(field => {
    let baseSchema;

    switch (field.type) {
      case 'text':
      case 'textarea':
        baseSchema = Joi.string();
        if (field.validations?.minLength) baseSchema = baseSchema.min(field.validations.minLength);
        if (field.validations?.maxLength) baseSchema = baseSchema.max(field.validations.maxLength);
        if (field.validations?.regex) baseSchema = baseSchema.regex(new RegExp(field.validations.regex));
        break;
      case 'number':
        baseSchema = Joi.number();
        if (field.validations?.min) baseSchema = baseSchema.min(field.validations.min);
        if (field.validations?.max) baseSchema = baseSchema.max(field.validations.max);
        break;
      case 'select':
      case 'date':
        baseSchema = Joi.string();
        break;
      case 'multi-select':
        baseSchema = Joi.array().items(Joi.string());
        if (field.validations?.minSelected) baseSchema = baseSchema.min(field.validations.minSelected);
        if (field.validations?.maxSelected) baseSchema = baseSchema.max(field.validations.maxSelected);
        break;
      case 'switch':
        baseSchema = Joi.boolean();
        break;
      default:
        baseSchema = Joi.any();
    }

    if (field.required) {
      baseSchema = baseSchema.required();
    } else {
      baseSchema = baseSchema.optional();
    }

    joiSchemaMap[field.name] = baseSchema;
  });

  return Joi.object(joiSchemaMap).unknown(false);
}

const joiFormSchema = buildJoiSchema();

function validateSubmission(data) {
  return joiFormSchema.validate(data, { abortEarly: false });
}

module.exports = { validateSubmission };