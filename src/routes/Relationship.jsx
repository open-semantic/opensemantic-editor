import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ArrayInput from '../components/ui/ArrayInput.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';

const Relationship = () => {
    const { relationshipId } = useParams();
    const navigate = useNavigate();
    const index = parseInt(relationshipId, 10);
    const basePath = `semantic_model[0].relationships[${index}]`;

    const { rel, datasets } = useEditorStore(useShallow((state) => ({
        rel: state.getValue(basePath),
        datasets: state.getValue('semantic_model[0].datasets') || [],
    })));
    const setValue = useEditorStore((state) => state.setValue);

    if (!rel) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900">Relationship not found</h3>
                    <button onClick={() => navigate('/relationships')} className="mt-2 btn--secondary">Back to Relationships</button>
                </div>
            </div>
        );
    }

    const datasetNames = datasets.map(d => d?.name).filter(Boolean);
    const fromDataset = datasets.find(d => d?.name === rel.from);
    const toDataset = datasets.find(d => d?.name === rel.to);
    const fromFieldNames = (fromDataset?.fields || []).map(f => f?.name).filter(Boolean);
    const toFieldNames = (toDataset?.fields || []).map(f => f?.name).filter(Boolean);

    const handleRemove = () => {
        const allRels = useEditorStore.getState().getValue('semantic_model[0].relationships') || [];
        const updated = allRels.filter((_, i) => i !== index);
        setValue('semantic_model[0].relationships', updated.length > 0 ? updated : undefined);
        navigate('/relationships');
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/relationships')} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Relationship: {rel.name || `Relationship ${index + 1}`}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <ValidatedInput
                            name="rel-name" label="Name" value={rel.name || ''}
                            onChange={(e) => setValue(`${basePath}.name`, e.target.value)}
                            required={true} placeholder="relationship_name"
                        />
                        <div>{/* spacer */}</div>
                        <div>
                            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">From Dataset</label>
                            <select
                                value={rel.from || ''}
                                onChange={(e) => setValue(`${basePath}.from`, e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
                            >
                                <option value="">Select dataset...</option>
                                {datasetNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">To Dataset</label>
                            <select
                                value={rel.to || ''}
                                onChange={(e) => setValue(`${basePath}.to`, e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
                            >
                                <option value="">Select dataset...</option>
                                {datasetNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <ArrayInput
                            label="From Columns" value={rel.from_columns || []}
                            onChange={(val) => setValue(`${basePath}.from_columns`, val)}
                            placeholder="Select column..."
                            options={fromFieldNames}
                        />
                        <ArrayInput
                            label="To Columns" value={rel.to_columns || []}
                            onChange={(val) => setValue(`${basePath}.to_columns`, val)}
                            placeholder="Select column..."
                            options={toFieldNames}
                        />
                    </div>

                    <AIContextEditor
                        label="AI Context" value={rel.ai_context || {}}
                        onChange={(val) => setValue(`${basePath}.ai_context`, val)}
                    />

                    <div className="pt-4 border-t border-gray-200">
                        <button onClick={handleRemove} className="px-2 py-1 text-xs text-red-600 bg-white border border-red-600 rounded hover:bg-red-50 transition-colors flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Relationship
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Relationship;
