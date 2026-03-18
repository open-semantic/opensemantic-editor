import { useEditorStore } from '../store.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';
import { useShallow } from "zustand/react/shallow";

const Overview = () => {
    const version = useEditorStore(useShallow((state) => state.getValue('version')));
    const name = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].name')));
    const description = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].description')));
    const aiContext = useEditorStore(useShallow((state) => state.getValue('semantic_model[0].ai_context')));

    const setValue = useEditorStore((state) => state.setValue);

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Overview</h3>
                        <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
                            Core metadata for the semantic model, including version, name, and description.
                        </p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <ValidatedInput
                                    name="version"
                                    label="OSI Version"
                                    value={version || ''}
                                    onChange={(e) => setValue('version', e.target.value)}
                                    required={true}
                                    tooltip="The OSI specification version"
                                    placeholder="0.1.1"
                                />
                                <ValidatedInput
                                    name="name"
                                    label="Model Name"
                                    value={name || ''}
                                    onChange={(e) => setValue('semantic_model[0].name', e.target.value)}
                                    required={true}
                                    tooltip="The name of the semantic model"
                                    placeholder="my_model"
                                />
                                <div className="sm:col-span-2">
                                    <ValidatedTextarea
                                        name="description"
                                        label="Description"
                                        value={description || ''}
                                        onChange={(e) => setValue('semantic_model[0].description', e.target.value || undefined)}
                                        tooltip="A description of the semantic model"
                                        placeholder="Describe the semantic model..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <AIContextEditor
                            label="AI Context"
                            value={aiContext || {}}
                            onChange={(val) => setValue('semantic_model[0].ai_context', val)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
