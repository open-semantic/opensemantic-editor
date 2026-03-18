import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ArrayInput from '../components/ui/ArrayInput.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';

const Relationships = () => {
    const relationships = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].relationships'))) || [];
    const datasets = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].datasets'))) || [];
    const setValue = useEditorStore((state) => state.setValue);
    const basePath = 'semantic_model[0].relationships';

    const datasetNames = datasets.map(d => d?.name).filter(Boolean);

    const handleAdd = () => {
        const updated = [...relationships, { name: `rel_${relationships.length + 1}`, from: '', to: '', from_columns: [], to_columns: [] }];
        setValue(basePath, updated);
    };

    const handleRemove = (index) => {
        const updated = relationships.filter((_, i) => i !== index);
        setValue(basePath, updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Relationships</h3>
                        <p className="mt-1 text-xs leading-4 text-gray-500">Define relationships between datasets.</p>
                    </div>
                    <button onClick={handleAdd} className="btn--primary">+ Add Relationship</button>
                </div>

                {relationships.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No relationships</h3>
                        <p className="mt-1 text-sm text-gray-500">Add relationships between datasets.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {relationships.map((rel, index) => {
                            const relPath = `${basePath}[${index}]`;
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{rel.name || `Relationship ${index + 1}`}</span>
                                        <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <ValidatedInput
                                            name={`rel-name-${index}`} label="Name" value={rel.name || ''}
                                            onChange={(e) => setValue(`${relPath}.name`, e.target.value)}
                                            required={true} placeholder="relationship_name"
                                        />
                                        <div>{/* spacer */}</div>
                                        <div>
                                            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">From Dataset</label>
                                            <select
                                                value={rel.from || ''}
                                                onChange={(e) => setValue(`${relPath}.from`, e.target.value)}
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
                                                onChange={(e) => setValue(`${relPath}.to`, e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 bg-white"
                                            >
                                                <option value="">Select dataset...</option>
                                                {datasetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        </div>
                                        <ArrayInput
                                            label="From Columns" value={rel.from_columns || []}
                                            onChange={(val) => setValue(`${relPath}.from_columns`, val)}
                                            placeholder="Add column..."
                                        />
                                        <ArrayInput
                                            label="To Columns" value={rel.to_columns || []}
                                            onChange={(val) => setValue(`${relPath}.to_columns`, val)}
                                            placeholder="Add column..."
                                        />
                                    </div>
                                    <AIContextEditor
                                        label="AI Context" value={rel.ai_context || {}}
                                        onChange={(val) => setValue(`${relPath}.ai_context`, val)}
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

export default Relationships;
