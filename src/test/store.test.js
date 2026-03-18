import { describe, it, expect } from 'vitest';
import { getValueWithPath, setValueWithPath } from '../store.js';
import { parseYaml, stringifyYaml } from '../utils/yaml.js';
import exampleYaml from '../example.yaml?raw';

describe('YAML parsing', () => {
  it('should parse the TPC-DS example without errors', () => {
    const parsed = parseYaml(exampleYaml);
    expect(parsed).toBeDefined();
    expect(parsed.version).toBe('0.1.1');
  });

  it('should roundtrip the example YAML', () => {
    const parsed = parseYaml(exampleYaml);
    const reserialized = stringifyYaml(parsed);
    const reparsed = parseYaml(reserialized);
    expect(reparsed.version).toBe(parsed.version);
    expect(reparsed.semantic_model[0].name).toBe(parsed.semantic_model[0].name);
    expect(reparsed.semantic_model[0].datasets.length).toBe(parsed.semantic_model[0].datasets.length);
  });
});

describe('getValueWithPath', () => {
  const parsed = parseYaml(exampleYaml);

  it('should get root-level version', () => {
    expect(getValueWithPath(parsed, 'version')).toBe('0.1.1');
  });

  it('should get model name via array index', () => {
    expect(getValueWithPath(parsed, 'semantic_model[0].name')).toBe('tpcds_retail_model');
  });

  it('should get model description', () => {
    expect(getValueWithPath(parsed, 'semantic_model[0].description')).toContain('TPC-DS retail');
  });

  it('should get ai_context.instructions', () => {
    const instructions = getValueWithPath(parsed, 'semantic_model[0].ai_context.instructions');
    expect(instructions).toContain('retail analytics');
  });

  it('should get all 5 datasets', () => {
    const datasets = getValueWithPath(parsed, 'semantic_model[0].datasets');
    expect(datasets).toHaveLength(5);
    expect(datasets[0].name).toBe('store_sales');
    expect(datasets[1].name).toBe('date_dim');
    expect(datasets[2].name).toBe('customer');
    expect(datasets[3].name).toBe('item');
    expect(datasets[4].name).toBe('store');
  });

  it('should get store_sales fields', () => {
    const fields = getValueWithPath(parsed, 'semantic_model[0].datasets[0].fields');
    expect(fields).toHaveLength(8);
    expect(fields[0].name).toBe('ss_sold_date_sk');
  });

  it('should get primary_key as array', () => {
    const pk = getValueWithPath(parsed, 'semantic_model[0].datasets[0].primary_key');
    expect(pk).toEqual(['ss_item_sk', 'ss_ticket_number']);
  });

  it('should get expression with nested dialects structure', () => {
    const expr = getValueWithPath(parsed, 'semantic_model[0].datasets[0].fields[0].expression');
    expect(expr).toBeDefined();
    expect(expr.dialects).toHaveLength(1);
    expect(expr.dialects[0].dialect).toBe('ANSI_SQL');
    expect(expr.dialects[0].expression).toBe('ss_sold_date_sk');
  });

  it('should get computed field expression', () => {
    const expr = getValueWithPath(parsed, 'semantic_model[0].datasets[2].fields[4].expression');
    expect(expr.dialects[0].expression).toBe("c_first_name || ' ' || c_last_name");
  });

  it('should get dimension.is_time', () => {
    const dim = getValueWithPath(parsed, 'semantic_model[0].datasets[0].fields[0].dimension');
    expect(dim.is_time).toBe(false);

    const timeDim = getValueWithPath(parsed, 'semantic_model[0].datasets[1].fields[1].dimension');
    expect(timeDim.is_time).toBe(true);
  });

  it('should get ai_context.synonyms on fields', () => {
    const synonyms = getValueWithPath(parsed, 'semantic_model[0].datasets[0].fields[0].ai_context.synonyms');
    expect(synonyms).toContain('sale date');
    expect(synonyms).toContain('transaction date');
  });

  it('should get all 4 relationships', () => {
    const rels = getValueWithPath(parsed, 'semantic_model[0].relationships');
    expect(rels).toHaveLength(4);
    expect(rels[0].name).toBe('store_sales_to_date');
    expect(rels[0].from).toBe('store_sales');
    expect(rels[0].to).toBe('date_dim');
    expect(rels[0].from_columns).toEqual(['ss_sold_date_sk']);
    expect(rels[0].to_columns).toEqual(['d_date_sk']);
  });

  it('should get all 5 metrics', () => {
    const metrics = getValueWithPath(parsed, 'semantic_model[0].metrics');
    expect(metrics).toHaveLength(5);
    expect(metrics[0].name).toBe('total_sales');
    expect(metrics[0].expression.dialects[0].dialect).toBe('ANSI_SQL');
    expect(metrics[0].expression.dialects[0].expression).toBe('SUM(store_sales.ss_ext_sales_price)');
  });

  it('should get all 2 custom_extensions', () => {
    const exts = getValueWithPath(parsed, 'semantic_model[0].custom_extensions');
    expect(exts).toHaveLength(2);
    expect(exts[0].vendor_name).toBe('SALESFORCE');
    expect(exts[1].vendor_name).toBe('DBT');
  });

  it('should return undefined for missing paths', () => {
    expect(getValueWithPath(parsed, 'nonexistent')).toBeUndefined();
    expect(getValueWithPath(parsed, 'semantic_model[0].nonexistent')).toBeUndefined();
  });

  it('should return default value for missing paths', () => {
    expect(getValueWithPath(parsed, 'nonexistent', 'default')).toBe('default');
  });
});

describe('setValueWithPath', () => {
  it('should set a nested value', () => {
    const parsed = parseYaml(exampleYaml);
    const updated = setValueWithPath(parsed, 'semantic_model[0].name', 'new_name');
    expect(updated.semantic_model[0].name).toBe('new_name');
    // Original should be unchanged
    expect(parsed.semantic_model[0].name).toBe('tpcds_retail_model');
  });

  it('should set a deeply nested field value', () => {
    const parsed = parseYaml(exampleYaml);
    const updated = setValueWithPath(parsed, 'semantic_model[0].datasets[0].fields[0].label', 'Sale Date');
    expect(updated.semantic_model[0].datasets[0].fields[0].label).toBe('Sale Date');
  });

  it('should create intermediate objects', () => {
    const obj = {};
    const updated = setValueWithPath(obj, 'a.b.c', 'value');
    expect(updated.a.b.c).toBe('value');
  });

  it('should set version at root level', () => {
    const parsed = parseYaml(exampleYaml);
    const updated = setValueWithPath(parsed, 'version', '0.2.0');
    expect(updated.version).toBe('0.2.0');
  });
});
