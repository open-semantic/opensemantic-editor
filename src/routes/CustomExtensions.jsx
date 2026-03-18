import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import ValidatedInput from '../components/ui/ValidatedInput.jsx';

const CustomExtensions = () => {
    const extensions = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].custom_extensions'))) || [];
    const setValue = useEditorStore((state) => state.setValue);
    const basePath = 'semantic_model[0].custom_extensions';

    const handleAdd = () => {
        const updated = [...extensions, { vendor_name: '', data: '{}' }];
        setValue(basePath, updated);
    };

    const handleRemove = (index) => {
        const updated = extensions.filter((_, i) => i !== index);
        setValue(basePath, updated.length > 0 ? updated : undefined);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Custom Extensions</h3>
                        <p className="mt-1 text-xs leading-4 text-gray-500">Vendor-specific extensions for the semantic model.</p>
                    </div>
                    <button onClick={handleAdd} className="btn--primary">+ Add Extension</button>
                </div>

                {extensions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No custom extensions</h3>
                        <p className="mt-1 text-sm text-gray-500">Add vendor-specific extensions.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {extensions.map((ext, index) => {
                            const extPath = `${basePath}[${index}]`;
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{ext.vendor_name || `Extension ${index + 1}`}</span>
                                        <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                    </div>
                                    <div className="space-y-3">
                                        <ValidatedInput
                                            name={`ext-vendor-${index}`} label="Vendor Name" value={ext.vendor_name || ''}
                                            onChange={(e) => setValue(`${extPath}.vendor_name`, e.target.value)}
                                            required={true} placeholder="vendor_name"
                                        />
                                        <div>
                                            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">Data (JSON)</label>
                                            <textarea
                                                value={ext.data || ''}
                                                onChange={(e) => setValue(`${extPath}.data`, e.target.value)}
                                                rows={4}
                                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 font-mono"
                                                placeholder='{"key": "value"}'
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomExtensions;
