import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import ValidatedInput from './ValidatedInput.jsx';
import ValidatedTextarea from './ValidatedTextarea.jsx';
import ExpressionEditor from './ExpressionEditor.jsx';
import AIContextEditor from './AIContextEditor.jsx';

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 0.8;

const FieldDetailsDrawer = forwardRef(({ field, fieldPath, setValue, open, onClose, onDelete }, ref) => {
    const [width, setWidth] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const internalRef = useRef(null);
    const drawerRef = ref || internalRef;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
        setWidth(Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth));
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    if (!field) {
        return <div ref={drawerRef} className="hidden" />;
    }

    return (
        <div
            ref={drawerRef}
            style={width ? { width: `${width}px` } : undefined}
            className={`fixed inset-y-0 right-0 z-40 ${
                width ? '' : 'w-screen max-w-[calc(100vw-3rem)] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg'
            } transform transition-transform ${isResizing ? '' : 'duration-300'} ease-in-out ${
                open ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            {/* Resize handle */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-10"
                title="Drag to resize"
            />

            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                {/* Header */}
                <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 truncate">
                            {field.name ? `Edit Field: ${field.name}` : 'Edit Field'}
                        </h2>
                        <div className="ml-2 flex h-6 items-center gap-1">
                            <button
                                type="button"
                                onClick={onDelete}
                                className="relative rounded-md bg-gray-50 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Delete field"
                            >
                                <span className="sr-only">Delete field</span>
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="relative rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <span className="sr-only">Close panel</span>
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" strokeWidth="2" />
                                    <path d="m6 6 12 12" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative flex-1 px-3 py-3 overflow-y-auto space-y-4">
                    <ValidatedInput
                        name="drawer-field-name"
                        label="Name"
                        value={field.name || ''}
                        onChange={(e) => setValue(`${fieldPath}.name`, e.target.value)}
                        required={true}
                        placeholder="field_name"
                    />
                    <ValidatedInput
                        name="drawer-field-label"
                        label="Label"
                        value={field.label || ''}
                        onChange={(e) => setValue(`${fieldPath}.label`, e.target.value || undefined)}
                        placeholder="Display label"
                    />
                    <ValidatedTextarea
                        name="drawer-field-desc"
                        label="Description"
                        value={field.description || ''}
                        onChange={(e) => setValue(`${fieldPath}.description`, e.target.value || undefined)}
                        placeholder="Field description..."
                        rows={2}
                    />

                    <ExpressionEditor
                        label="Expression"
                        value={field.expression}
                        onChange={(val) => setValue(`${fieldPath}.expression`, val)}
                    />

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

                    <AIContextEditor
                        label="AI Context"
                        value={field.ai_context || {}}
                        onChange={(val) => setValue(`${fieldPath}.ai_context`, val)}
                    />

                </div>
            </div>
        </div>
    );
});

FieldDetailsDrawer.displayName = 'FieldDetailsDrawer';

export default FieldDetailsDrawer;
