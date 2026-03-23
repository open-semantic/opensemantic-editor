import { useEditorStore } from '../store.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';
import Combobox from '../components/ui/Combobox.jsx';
import { useShallow } from "zustand/react/shallow";

const VERSION_OPTIONS = ['0.1.1'];

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
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Overview</h3>
                            <div className="w-32">
                                <Combobox
                                    options={VERSION_OPTIONS}
                                    value={version || ''}
                                    onChange={(val) => setValue('version', val)}
                                    placeholder="Version"
                                    acceptAnyInput={true}
                                />
                            </div>
                        </div>
                        <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
                            Core metadata for the semantic model, including version, name, and description.
                        </p>

                        <div className="space-y-4">
                            <ValidatedInput
                                name="name"
                                label="Model Name"
                                value={name || ''}
                                onChange={(e) => setValue('semantic_model[0].name', e.target.value)}
                                required={true}
                                tooltip="The name of the semantic model"
                                placeholder="my_model"
                            />
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
