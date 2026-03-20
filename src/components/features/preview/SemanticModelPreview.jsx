import { useEditorStore } from '../../../store.js';

/**
 * Check if all expressions across all fields use only a single dialect.
 * Returns the dialect name if uniform, or null if mixed/absent.
 */
function getUniformDialect(fields) {
    if (!fields?.length) return null;
    let dialect = null;
    for (const field of fields) {
        const dialects = field.expression?.dialects;
        if (!dialects?.length) continue;
        for (const d of dialects) {
            if (!dialect) {
                dialect = d.dialect;
            } else if (d.dialect !== dialect) {
                return null; // mixed dialects
            }
        }
    }
    return dialect;
}

function formatExpression(dialects, hideDialect) {
    if (!dialects?.length) return '-';
    if (hideDialect) {
        return dialects.map(e => e.expression).join(', ');
    }
    return dialects.map(e => `${e.dialect}: ${e.expression}`).join(', ');
}

const SemanticModelPreview = () => {
    const yamlParts = useEditorStore((state) => state.yamlParts);

    if (!yamlParts) {
        return <div className="text-sm text-gray-500">No data to preview.</div>;
    }

    const model = yamlParts.semantic_model?.[0];

    // Check if all metrics use a uniform dialect
    const metricsUniformDialect = (() => {
        const metrics = model?.metrics;
        if (!metrics?.length) return null;
        let dialect = null;
        for (const m of metrics) {
            const dialects = m.expression?.dialects;
            if (!dialects?.length) continue;
            for (const d of dialects) {
                if (!dialect) dialect = d.dialect;
                else if (d.dialect !== dialect) return null;
            }
        }
        return dialect;
    })();

    return (
        <div className="max-w-none">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Semantic Model</h2>

            {/* Version */}
            <div className="mb-4">
                <span className="text-xs font-medium text-gray-500">OSI Version: </span>
                <span className="text-xs text-gray-900">{yamlParts.version || 'N/A'}</span>
            </div>

            {model ? (
                <>
                    {/* Model Info */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{model.name || 'Untitled Model'}</h3>
                        {model.description && <p className="text-xs text-gray-600">{model.description}</p>}
                    </div>

                    {/* Datasets */}
                    {model.datasets?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Datasets ({model.datasets.length})
                            </h4>
                            {model.datasets.map((dataset, i) => {
                                const uniformDialect = getUniformDialect(dataset.fields);
                                return (
                                    <div key={i} className="mb-3 bg-white rounded border border-gray-200 overflow-hidden">
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-900">{dataset.name}</span>
                                                {dataset.source && <span className="text-xs text-gray-500">Source: {dataset.source}</span>}
                                            </div>
                                            {dataset.description && <p className="text-xs text-gray-500 mt-0.5">{dataset.description}</p>}
                                        </div>
                                        <div className="p-3">
                                        {dataset.fields?.length > 0 && (
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="text-left py-1 font-medium text-gray-600">Field</th>
                                                        <th className="text-left py-1 font-medium text-gray-600">Description</th>
                                                        <th className="text-left py-1 font-medium text-gray-600">Expression</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataset.fields.map((field, fi) => (
                                                        <tr key={fi} className="border-b border-gray-50">
                                                            <td className="py-1 text-gray-900">
                                                                {field.label ? (
                                                                    <><span>{field.label}</span> <span className="text-gray-400 font-mono">({field.name})</span></>
                                                                ) : (
                                                                    <span className="font-mono">{field.name}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-1 text-gray-600">{field.description || '-'}</td>
                                                            <td className="py-1 text-gray-500 font-mono">
                                                                {formatExpression(field.expression?.dialects, !!uniformDialect)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Relationships */}
                    {model.relationships?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Relationships ({model.relationships.length})
                            </h4>
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                                            <th className="text-left px-3 py-2 font-medium text-gray-600">From</th>
                                            <th className="text-left px-3 py-2 font-medium text-gray-600">To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {model.relationships.map((rel, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="px-3 py-1.5 font-medium text-gray-900">{rel.name}</td>
                                                <td className="px-3 py-1.5 font-mono text-gray-700">
                                                    {rel.from}
                                                    {rel.from_columns?.length === 1 && (
                                                        <span className="text-gray-400">.{rel.from_columns[0]}</span>
                                                    )}
                                                    {rel.from_columns?.length > 1 && (
                                                        <span className="text-gray-400">({rel.from_columns.join(', ')})</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 font-mono text-gray-700">
                                                    {rel.to}
                                                    {rel.to_columns?.length === 1 && (
                                                        <span className="text-gray-400">.{rel.to_columns[0]}</span>
                                                    )}
                                                    {rel.to_columns?.length > 1 && (
                                                        <span className="text-gray-400">({rel.to_columns.join(', ')})</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Metrics */}
                    {model.metrics?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Metrics ({model.metrics.length})
                            </h4>
                            <div className="space-y-2">
                                {model.metrics.map((metric, i) => (
                                    <div key={i} className="bg-white rounded border border-gray-200 overflow-hidden">
                                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                            <span className="text-xs font-semibold text-gray-900">{metric.name}</span>
                                        </div>
                                        <div className="px-3 py-2 space-y-1">
                                            {metric.description && <p className="text-xs text-gray-600">{metric.description}</p>}
                                            {metric.expression?.dialects?.length > 0 && (
                                                <pre className="text-xs text-gray-700 font-mono bg-gray-50 rounded px-2 py-1.5 overflow-x-auto">
                                                    {metric.expression.dialects.map(e =>
                                                        metricsUniformDialect ? e.expression : `${e.dialect}: ${e.expression}`
                                                    ).join('\n')}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-xs text-gray-500">No semantic model defined yet.</p>
            )}
        </div>
    );
};

export default SemanticModelPreview;
