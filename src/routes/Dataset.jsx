import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store.js';
import { useShallow } from "zustand/react/shallow";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
import AIContextEditor from '../components/ui/AIContextEditor.jsx';
import ArrayInput from '../components/ui/ArrayInput.jsx';
import FieldRow from '../components/ui/FieldRow.jsx';
import FieldDetailsDrawer from '../components/ui/FieldDetailsDrawer.jsx';

const Dataset = () => {
    const { datasetId } = useParams();
    const navigate = useNavigate();
    const index = parseInt(datasetId, 10);
    const basePath = `semantic_model[0].datasets[${index}]`;

    const dataset = useEditorStore(useShallow((state) => state.getValue(basePath)));
    const setValue = useEditorStore((state) => state.setValue);

    const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
    const [autoEditIndex, setAutoEditIndex] = useState(null);

    const fieldsContainerRef = useRef(null);
    const drawerRef = useRef(null);

    // Drag-and-drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const fromIndex = parseInt(active.id.toString().replace('field-', ''), 10);
        const toIndex = parseInt(over.id.toString().replace('field-', ''), 10);
        if (isNaN(fromIndex) || isNaN(toIndex)) return;
        const currentFields = useEditorStore.getState().getValue(`${basePath}.fields`) || [];
        const reordered = [...currentFields];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        setValue(`${basePath}.fields`, reordered);
        // Update selected index to follow the moved field
        if (selectedFieldIndex === fromIndex) {
            setSelectedFieldIndex(toIndex);
        } else if (selectedFieldIndex !== null) {
            if (fromIndex < selectedFieldIndex && toIndex >= selectedFieldIndex) {
                setSelectedFieldIndex(selectedFieldIndex - 1);
            } else if (fromIndex > selectedFieldIndex && toIndex <= selectedFieldIndex) {
                setSelectedFieldIndex(selectedFieldIndex + 1);
            }
        }
    }, [basePath, setValue, selectedFieldIndex]);

    // Close drawer on outside click (same pattern as DC editor)
    useEffect(() => {
        if (selectedFieldIndex === null) return;

        const handleClickOutside = (e) => {
            const inFields = fieldsContainerRef.current?.contains(e.target);
            const inDrawer = drawerRef.current?.contains(e.target);
            if (!inFields && !inDrawer) {
                setSelectedFieldIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedFieldIndex]);

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
    const selectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null;
    const selectedFieldPath = selectedFieldIndex !== null ? `${basePath}.fields[${selectedFieldIndex}]` : null;

    const handleAddField = () => {
        const newIndex = fields.length;
        const newFields = [...fields, { name: '', expression: { dialects: [] } }];
        setValue(`${basePath}.fields`, newFields);
        setAutoEditIndex(newIndex);
        setSelectedFieldIndex(null);
    };

    const handleRemoveField = (fieldIndex) => {
        const updated = fields.filter((_, i) => i !== fieldIndex);
        setValue(`${basePath}.fields`, updated.length > 0 ? updated : undefined);
        setSelectedFieldIndex(null);
    };

    const handleSelectField = (fi) => {
        setSelectedFieldIndex(fi === selectedFieldIndex ? null : fi);
    };

    const handleCloseDrawer = useCallback(() => {
        setSelectedFieldIndex(null);
    }, []);

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

                    {/* Fields Section */}
                    <div ref={fieldsContainerRef}>
                        <div className="border border-gray-200 rounded-md">
                            {/* Header Row */}
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-md">
                                <span className="text-sm font-medium text-gray-700">Fields</span>
                                <button
                                    onClick={handleAddField}
                                    className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                                    title="Add field"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Fields List with Drag-and-Drop */}
                            {fields.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                                >
                                    <SortableContext
                                        items={fields.map((_, idx) => `field-${idx}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="rounded-b-md">
                                            {fields.map((field, fi) => (
                                                <FieldRow
                                                    key={`field-${fi}`}
                                                    field={field}
                                                    fieldIndex={fi}
                                                    basePath={basePath}
                                                    isSelected={fi === selectedFieldIndex}
                                                    onSelect={handleSelectField}
                                                    primaryKey={dataset.primary_key || []}
                                                    setValue={setValue}
                                                    autoEdit={fi === autoEditIndex}
                                                    onAutoEditComplete={() => setAutoEditIndex(null)}
                                                    sortableId={`field-${fi}`}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div
                                    className="px-4 py-8 text-center rounded-b-md cursor-pointer hover:bg-gray-50"
                                    onClick={handleAddField}
                                >
                                    <p className="text-sm text-gray-400 mb-2">No fields defined</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAddField(); }}
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add field
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Field Details Drawer - fixed overlay like DC editor */}
            <FieldDetailsDrawer
                ref={drawerRef}
                field={selectedField}
                fieldPath={selectedFieldPath}
                setValue={setValue}
                open={selectedFieldIndex !== null}
                onClose={handleCloseDrawer}
                onDelete={() => handleRemoveField(selectedFieldIndex)}
            />
        </div>
    );
};

export default Dataset;
