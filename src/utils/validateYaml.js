import { parseYaml } from './yaml.js';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';

const OSI_SCHEMA_URL = 'https://raw.githubusercontent.com/open-semantic-interchange/OSI/refs/heads/main/core-spec/osi-schema.json';

let cachedSchema = null;
let ajvInstance = null;
let validateFn = null;

async function getSchema() {
  if (cachedSchema) return cachedSchema;
  try {
    const response = await fetch(OSI_SCHEMA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status}`);
    }
    cachedSchema = await response.json();
    return cachedSchema;
  } catch (e) {
    console.warn('Failed to fetch OSI schema:', e.message);
    return null;
  }
}

async function getValidator() {
  if (validateFn) return validateFn;
  const schema = await getSchema();
  if (!schema) return null;

  ajvInstance = new Ajv2019({
    allErrors: true,
    strict: false,
    validateFormats: false,
  });
  addFormats(ajvInstance);

  try {
    validateFn = ajvInstance.compile(schema);
    return validateFn;
  } catch (e) {
    console.warn('Failed to compile OSI schema:', e.message);
    return null;
  }
}

export async function validateYaml(yamlString) {
  const errors = [];
  let parsed;
  try {
    parsed = parseYaml(yamlString);
  } catch (e) {
    return {
      isValid: false,
      errors: [{
        type: 'syntax',
        severity: 'error',
        message: `YAML syntax error: ${e.message}`,
        line: e.linePos?.[0]?.line,
      }],
      parsed: null,
    };
  }

  const validate = await getValidator();
  if (validate && parsed) {
    const valid = validate(parsed);
    if (!valid && validate.errors) {
      for (const err of validate.errors) {
        const message = formatAjvError(err);
        if (message) {
          errors.push({
            type: 'schema',
            severity: 'error',
            message,
            path: err.instancePath,
            keyword: err.keyword,
          });
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors, parsed };
}

function formatAjvError(err) {
  const path = err.instancePath || 'root';
  switch (err.keyword) {
    case 'required':
      return `${path}: missing required field '${err.params.missingProperty}'`;
    case 'type':
      return `${path}: expected ${err.params.type}`;
    case 'enum':
      return `${path}: must be one of ${err.params.allowedValues?.join(', ')}`;
    case 'additionalProperties':
      return `${path}: unknown field '${err.params.additionalProperty}'`;
    case 'if':
      return null;
    default:
      return `${path}: ${err.message}`;
  }
}
