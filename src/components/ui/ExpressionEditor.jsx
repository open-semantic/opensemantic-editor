import { useState } from 'react';

const DIALECT_OPTIONS = [
  { id: 'ANSI_SQL', name: 'ANSI SQL' },
  { id: 'trino', name: 'Trino' },
  { id: 'spark', name: 'Spark' },
  { id: 'bigquery', name: 'BigQuery' },
  { id: 'snowflake', name: 'Snowflake' },
  { id: 'redshift', name: 'Redshift' },
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mysql', name: 'MySQL' },
  { id: 'mssql', name: 'MS SQL Server' },
  { id: 'duckdb', name: 'DuckDB' },
  { id: 'clickhouse', name: 'ClickHouse' },
  { id: 'databricks', name: 'Databricks' },
];

/**
 * ExpressionEditor handles the OSI expression structure:
 * { dialects: [{ dialect: "ANSI_SQL", expression: "..." }, ...] }
 *
 * `value` is the expression object (or undefined/null).
 * `onChange` receives the updated expression object (or undefined to clear).
 */
const ExpressionEditor = ({ value, onChange, label = "Expression" }) => {
  const [newDialect, setNewDialect] = useState('');

  const dialects = value?.dialects || [];

  const handleDialectChange = (index, field, newValue) => {
    const updated = [...dialects];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange({ ...value, dialects: updated });
  };

  const handleAdd = () => {
    const dialect = newDialect.trim();
    if (!dialect) return;
    const updated = [...dialects, { dialect, expression: '' }];
    onChange({ ...(value || {}), dialects: updated });
    setNewDialect('');
  };

  const handleRemove = (index) => {
    const updated = dialects.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? { ...value, dialects: updated } : undefined);
  };

  return (
    <div>
      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">{label}</label>
      <div className="space-y-2">
        {dialects.map((expr, index) => (
          <div key={index} className="flex gap-2 items-start">
            <select
              value={expr.dialect || ''}
              onChange={(e) => handleDialectChange(index, 'dialect', e.target.value)}
              className="rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
            >
              <option value="">Select dialect...</option>
              {DIALECT_OPTIONS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={expr.expression || ''}
              onChange={(e) => handleDialectChange(index, 'expression', e.target.value)}
              placeholder="SQL expression..."
              className="flex-1 rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 font-mono"
            />
            <button type="button" onClick={() => handleRemove(index)}
              className="px-2 py-1.5 text-red-600 hover:text-red-800 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <select value={newDialect} onChange={(e) => setNewDialect(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
          >
            <option value="">Select dialect...</option>
            {DIALECT_OPTIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAdd} disabled={!newDialect.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-300 transition-colors"
          >
            Add Dialect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpressionEditor;
