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
  // Show ANSI_SQL row by default when no dialects exist
  const storedDialects = value?.dialects || [];
  const dialects = storedDialects.length > 0 ? storedDialects : [{ dialect: 'ANSI_SQL', expression: '' }];

  const persistDialects = (updated) => {
    // Filter out entries with empty expressions before saving
    const nonEmpty = updated.filter(d => d.expression?.trim());
    onChange(nonEmpty.length > 0 ? { ...value, dialects: nonEmpty } : undefined);
  };

  const handleDialectChange = (index, field, newValue) => {
    const updated = [...dialects];
    updated[index] = { ...updated[index], [field]: newValue };
    persistDialects(updated);
  };

  const handleRemove = (index) => {
    const updated = dialects.filter((_, i) => i !== index);
    persistDialects(updated);
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
            <textarea
              value={expr.expression || ''}
              onChange={(e) => {
                handleDialectChange(index, 'expression', e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="SQL expression..."
              rows={1}
              className="flex-1 rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 font-mono resize-none overflow-hidden"
            />
            <button type="button" onClick={() => handleRemove(index)}
              className="px-2 py-1.5 text-red-600 hover:text-red-800 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <select value="" onChange={(e) => {
              const dialect = e.target.value.trim();
              if (!dialect) return;
              const existing = dialects.filter(d => d.expression?.trim());
              const updated = [...existing, { dialect, expression: '' }];
              onChange({ ...(value || {}), dialects: updated });
            }}
            className="rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
          >
            <option value="">Add dialect...</option>
            {DIALECT_OPTIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ExpressionEditor;
