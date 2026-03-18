import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";

const Datasets = () => {
    const navigate = useNavigate();
    const datasets = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].datasets'))) || [];
    const setValue = useEditorStore((state) => state.setValue);

    const handleAdd = () => {
        const newDatasets = [...datasets, { name: `dataset_${datasets.length + 1}`, source: '', fields: [] }];
        setValue('semantic_model[0].datasets', newDatasets);
    };

    const handleRemove = (index) => {
        const updated = datasets.filter((_, i) => i !== index);
        setValue('semantic_model[0].datasets', updated);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Datasets</h3>
                        <p className="mt-1 text-xs leading-4 text-gray-500">
                            Define the datasets in your semantic model. Each dataset represents a table or view.
                        </p>
                    </div>
                    <button onClick={handleAdd} className="btn--primary">+ Add Dataset</button>
                </div>

                {datasets.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a dataset.</p>
                        <button onClick={handleAdd} className="mt-4 btn--primary">+ Add Dataset</button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {datasets.map((dataset, index) => (
                            <div key={index}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/datasets/${index}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{dataset.name || `Dataset ${index + 1}`}</p>
                                        <p className="text-xs text-gray-500">
                                            {dataset.source && `Source: ${dataset.source}`}
                                            {dataset.fields?.length > 0 && ` | ${dataset.fields.length} field(s)`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                                    >
                                        Remove
                                    </button>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Datasets;
