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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                                        className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                                        title="Remove dataset"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
