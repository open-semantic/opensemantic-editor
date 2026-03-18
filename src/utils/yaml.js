import * as YAML from 'yaml';

const defaultOptions = {
  lineWidth: 0,
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN',
  doubleQuotedAsJSON: true,
};

let yamlFormatConfig = { removeTrailingWhitespace: true, addFinalNewline: true };

export function setYamlFormatConfig(config) {
  yamlFormatConfig = { ...yamlFormatConfig, ...config };
}

export function applyYamlFormat(str) {
  if (!str) return str;
  if (yamlFormatConfig.removeTrailingWhitespace !== false) {
    str = str.replace(/[ \t]+$/gm, '');
  }
  if (yamlFormatConfig.addFinalNewline !== false) {
    if (!str.endsWith('\n')) str += '\n';
  } else {
    str = str.replace(/\n+$/, '');
  }
  return str;
}

export function stringifyYaml(value, options = {}) {
  const doc = new YAML.Document(value);
  YAML.visit(doc, {
    Scalar(key, node) {
      if (typeof node.value === "string" && node.value.includes("\n")) {
        node.type = "BLOCK_LITERAL";
      }
    },
  });
  const raw = doc.toString({ ...defaultOptions, ...options });
  return applyYamlFormat(raw);
}

export function parseYaml(yaml) {
  return YAML.parse(yaml);
}

export { YAML };
