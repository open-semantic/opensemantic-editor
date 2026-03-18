import { useEditorStore } from '../../../store.js';

const SemanticModelPreview = () => {
    const yamlParts = useEditorStore((state) => state.yamlParts);

    if (!yamlParts) {
        return <div className="text-sm text-gray-500">No data to preview.</div>;
    }

    const model = yamlParts.semantic_model?.[0];

    return (
        <div className="prose prose-sm max-w-none">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Semantic Model Preview</h2>

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
                            {model.datasets.map((dataset, i) => (
                                <div key={i} className="mb-3 bg-white rounded border border-gray-200 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-900">{dataset.name}</span>
                                        {dataset.source && <span className="text-xs text-gray-500">Source: {dataset.source}</span>}
                                    </div>
                                    {dataset.description && <p className="text-xs text-gray-600 mb-1">{dataset.description}</p>}
                                    {dataset.fields?.length > 0 && (
                                        <table className="w-full text-xs mt-2">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-1 font-medium text-gray-600">Field</th>
                                                    <th className="text-left py-1 font-medium text-gray-600">Label</th>
                                                    <th className="text-left py-1 font-medium text-gray-600">Expression</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataset.fields.map((field, fi) => (
                                                    <tr key={fi} className="border-b border-gray-50">
                                                        <td className="py-1 font-mono text-indigo-600">{field.name}</td>
                                                        <td className="py-1 text-gray-600">{field.label || '-'}</td>
                                                        <td className="py-1 text-gray-500 font-mono">
                                                            {field.expression?.dialects?.map(e => `${e.dialect}: ${e.expression}`).join(', ') || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Relationships */}
                    {model.relationships?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Relationships ({model.relationships.length})
                            </h4>
                            {model.relationships.map((rel, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                                    <span className="font-medium text-gray-900">{rel.name}:</span>
                                    <span className="text-indigo-600">{rel.from}</span>
                                    <span className="text-gray-400">&rarr;</span>
                                    <span className="text-indigo-600">{rel.to}</span>
                                    <span className="text-gray-500">
                                        ({rel.from_columns?.join(', ')}) &rarr; ({rel.to_columns?.join(', ')})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Metrics */}
                    {model.metrics?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Metrics ({model.metrics.length})
                            </h4>
                            {model.metrics.map((metric, i) => (
                                <div key={i} className="mb-2">
                                    <span className="text-xs font-medium text-gray-900">{metric.name}</span>
                                    {metric.description && <p className="text-xs text-gray-600">{metric.description}</p>}
                                    {metric.expression?.dialects?.map((e, ei) => (
                                        <span key={ei} className="text-xs text-gray-500 font-mono block">
                                            {e.dialect}: {e.expression}
                                        </span>
                                    ))}
                                </div>
                            ))}
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
