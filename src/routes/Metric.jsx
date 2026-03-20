import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import ExpressionEditor from '../components/ui/ExpressionEditor.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';

const Metric = () => {
    const { metricId } = useParams();
    const navigate = useNavigate();
    const index = parseInt(metricId, 10);
    const basePath = `semantic_model[0].metrics[${index}]`;

    const metric = useEditorStore(useShallow((state) => state.getValue(basePath)));
    const setValue = useEditorStore((state) => state.setValue);

    if (!metric) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900">Metric not found</h3>
                    <button onClick={() => navigate('/metrics')} className="mt-2 btn--secondary">Back to Metrics</button>
                </div>
            </div>
        );
    }

    const handleRemove = () => {
        const allMetrics = useEditorStore.getState().getValue('semantic_model[0].metrics') || [];
        const updated = allMetrics.filter((_, i) => i !== index);
        setValue('semantic_model[0].metrics', updated.length > 0 ? updated : undefined);
        navigate('/metrics');
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/metrics')} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Metric: {metric.name || `Metric ${index + 1}`}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <ValidatedInput
                            name="metric-name" label="Name" value={metric.name || ''}
                            onChange={(e) => setValue(`${basePath}.name`, e.target.value)}
                            required={true} placeholder="metric_name"
                        />
                        <div className="sm:col-span-2">
                            <ValidatedTextarea
                                name="metric-desc" label="Description" value={metric.description || ''}
                                onChange={(e) => setValue(`${basePath}.description`, e.target.value || undefined)}
                                placeholder="Describe the metric..." rows={2}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <ExpressionEditor
                                label="Expression" value={metric.expression}
                                onChange={(val) => setValue(`${basePath}.expression`, val)}
                            />
                        </div>
                    </div>

                    <AIContextEditor
                        label="AI Context" value={metric.ai_context || {}}
                        onChange={(val) => setValue(`${basePath}.ai_context`, val)}
                    />

                    <div className="pt-4 border-t border-gray-200">
                        <button onClick={handleRemove} className="px-2 py-1 text-xs text-red-600 bg-white border border-red-600 rounded hover:bg-red-50 transition-colors flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Metric
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Metric;
