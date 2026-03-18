import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import ExpressionEditor from '../components/ui/ExpressionEditor.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';

const Metrics = () => {
    const metrics = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].metrics'))) || [];
    const setValue = useEditorStore((state) => state.setValue);
    const basePath = 'semantic_model[0].metrics';

    const handleAdd = () => {
        const updated = [...metrics, { name: `metric_${metrics.length + 1}`, expression: { dialects: [] }, description: '' }];
        setValue(basePath, updated);
    };

    const handleRemove = (index) => {
        const updated = metrics.filter((_, i) => i !== index);
        setValue(basePath, updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Metrics</h3>
                        <p className="mt-1 text-xs leading-4 text-gray-500">Define computed metrics for the semantic model.</p>
                    </div>
                    <button onClick={handleAdd} className="btn--primary">+ Add Metric</button>
                </div>

                {metrics.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics</h3>
                        <p className="mt-1 text-sm text-gray-500">Add metrics to define computed values.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {metrics.map((metric, index) => {
                            const metricPath = `${basePath}[${index}]`;
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{metric.name || `Metric ${index + 1}`}</span>
                                        <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <ValidatedInput
                                            name={`metric-name-${index}`} label="Name" value={metric.name || ''}
                                            onChange={(e) => setValue(`${metricPath}.name`, e.target.value)}
                                            required={true} placeholder="metric_name"
                                        />
                                        <div className="sm:col-span-2">
                                            <ValidatedTextarea
                                                name={`metric-desc-${index}`} label="Description" value={metric.description || ''}
                                                onChange={(e) => setValue(`${metricPath}.description`, e.target.value || undefined)}
                                                placeholder="Describe the metric..." rows={2}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <ExpressionEditor
                                                label="Expression" value={metric.expression}
                                                onChange={(val) => setValue(`${metricPath}.expression`, val)}
                                            />
                                        </div>
                                    </div>
                                    <AIContextEditor
                                        label="AI Context" value={metric.ai_context || {}}
                                        onChange={(val) => setValue(`${metricPath}.ai_context`, val)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Metrics;
