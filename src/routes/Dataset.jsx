import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';
import ArrayInput from '../components/ui/ArrayInput.jsx';
import ExpressionEditor from '../components/ui/ExpressionEditor.jsx';

const Dataset = () => {
    const { datasetId } = useParams();
    const navigate = useNavigate();
    const index = parseInt(datasetId, 10);
    const basePath = `semantic_model[0].datasets[${index}]`;

    const dataset = useEditorStore(useShallow((state) => state.getValue(basePath)));
    const setValue = useEditorStore((state) => state.setValue);

    if (!dataset) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900">Dataset not found</h3>
                    <button onClick={() => navigate('/datasets')} className="mt-2 btn--secondary">Back to Datasets</button>
                </div>
            </div>
        );
    }

    const fields = dataset.fields || [];

    const handleAddField = () => {
        const newFields = [...fields, { name: `field_${fields.length + 1}`, expression: { dialects: [] } }];
        setValue(`${basePath}.fields`, newFields);
    };

    const handleRemoveField = (fieldIndex) => {
        const updated = fields.filter((_, i) => i !== fieldIndex);
        setValue(`${basePath}.fields`, updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/datasets')} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Dataset: {dataset.name || `Dataset ${index + 1}`}
                        </h3>
                    </div>

                    {/* Basic fields */}
                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <ValidatedInput
                            name="dataset-name" label="Name" value={dataset.name || ''}
                            onChange={(e) => setValue(`${basePath}.name`, e.target.value)}
                            required={true} tooltip="Dataset name" placeholder="my_dataset"
                        />
                        <ValidatedInput
                            name="dataset-source" label="Source" value={dataset.source || ''}
                            onChange={(e) => setValue(`${basePath}.source`, e.target.value)}
                            required={true} tooltip="Source table or view" placeholder="schema.table"
                        />
                        <div className="sm:col-span-2">
                            <ValidatedTextarea
                                name="dataset-description" label="Description" value={dataset.description || ''}
                                onChange={(e) => setValue(`${basePath}.description`, e.target.value || undefined)}
                                placeholder="Describe the dataset..." rows={2}
                            />
                        </div>
                        <ArrayInput
                            label="Primary Key" value={dataset.primary_key || []}
                            onChange={(val) => setValue(`${basePath}.primary_key`, val)}
                            placeholder="Add column..."
                        />
                    </div>

                    {/* AI Context */}
                    <AIContextEditor
                        label="AI Context" value={dataset.ai_context || {}}
                        onChange={(val) => setValue(`${basePath}.ai_context`, val)}
                    />

                    {/* Fields */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">Fields</h4>
                            <button onClick={handleAddField} className="btn--primary text-xs">+ Add Field</button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">No fields defined. Add a field to get started.</p>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field, fi) => {
                                    const fieldPath = `${basePath}.fields[${fi}]`;
                                    return (
                                        <div key={fi} className="border border-gray-200 rounded-lg p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-700">Field {fi + 1}</span>
                                                <button onClick={() => handleRemoveField(fi)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <ValidatedInput
                                                    name={`field-name-${fi}`} label="Name" value={field.name || ''}
                                                    onChange={(e) => setValue(`${fieldPath}.name`, e.target.value)}
                                                    required={true} placeholder="field_name"
                                                />
                                                <ValidatedInput
                                                    name={`field-label-${fi}`} label="Label" value={field.label || ''}
                                                    onChange={(e) => setValue(`${fieldPath}.label`, e.target.value || undefined)}
                                                    placeholder="Display label"
                                                />
                                                <div className="sm:col-span-2">
                                                    <ValidatedTextarea
                                                        name={`field-desc-${fi}`} label="Description" value={field.description || ''}
                                                        onChange={(e) => setValue(`${fieldPath}.description`, e.target.value || undefined)}
                                                        placeholder="Field description..." rows={1}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <ExpressionEditor
                                                        label="Expression" value={field.expression}
                                                        onChange={(val) => setValue(`${fieldPath}.expression`, val)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-900">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.dimension?.is_time || false}
                                                            onChange={(e) => setValue(`${fieldPath}.dimension`, e.target.checked ? { is_time: true } : undefined)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                        />
                                                        Is Time Dimension
                                                    </label>
                                                </div>
                                            </div>
                                            <AIContextEditor
                                                label="Field AI Context" value={field.ai_context || {}}
                                                onChange={(val) => setValue(`${fieldPath}.ai_context`, val)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dataset;
