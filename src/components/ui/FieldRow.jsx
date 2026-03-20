import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Tooltip from './Tooltip.jsx';

const FieldRow = ({ field, fieldIndex, isSelected, onSelect, primaryKey = [], setValue, basePath, autoEdit, onAutoEditComplete, sortableId }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef(null);

    const animateLayoutChanges = () => false;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: sortableId || `field-${fieldIndex}`,
        animateLayoutChanges,
    });

    const sortableStyle = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : 'none',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        position: 'relative',
    };

    const isPrimaryKey = primaryKey.includes(field.name);
    const isTimeDimension = field.dimension?.is_time;
    const firstDialect = field.expression?.dialects?.[0];
    const fieldPath = `${basePath}.fields[${fieldIndex}]`;

    useEffect(() => {
        if (autoEdit) {
            setEditing(true);
            setEditValue(field.name || '');
            onAutoEditComplete?.();
        }
    }, [autoEdit]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const onSelectProperty = () => onSelect(fieldIndex);

    const handleNameClick = (e) => {
        e.stopPropagation();
        onSelectProperty();
        setEditValue(field.name || '');
        setEditing(true);
    };

    const handleNameSave = () => {
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== field.name) {
            setValue(`${fieldPath}.name`, trimmed);
        }
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setValue(`${fieldPath}.name`, field.name || '');
            setEditing(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={sortableStyle}
            className={`border-t border-gray-100 first:border-t-0 group cursor-pointer ${
                isSelected ? 'bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200' : 'hover:bg-gray-50'
            } ${isDragging ? 'shadow-lg bg-white' : ''}`}
            onClick={() => onSelectProperty()}
        >
            <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {/* Field type icon - also drag handle */}
                    <span
                        {...attributes}
                        {...listeners}
                        className="flex-shrink-0 text-gray-500 cursor-grab active:cursor-grabbing touch-none"
                        onClick={(e) => e.stopPropagation()}
                        title="Drag to reorder"
                    >
                        {isTimeDimension ? (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </span>

                    {/* Name - inline editable */}
                    {editing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => {
                                setEditValue(e.target.value);
                                setValue(`${fieldPath}.name`, e.target.value);
                            }}
                            onBlur={() => setEditing(false)}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white px-1.5 py-0.5 text-sm font-medium text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500 min-w-32"
                            placeholder="field name"
                            autoFocus
                        />
                    ) : (
                        <span
                            className={`cursor-pointer text-sm font-medium hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200 min-w-32 flex-shrink-0 ${
                                !field.name || field.name.trim() === '' ? 'text-gray-400 italic' : 'text-gray-600'
                            }`}
                            onClick={handleNameClick}
                            title={field.name || "Click to edit"}
                        >
                            {!field.name || field.name.trim() === '' ? 'unnamed' : field.name}
                        </span>
                    )}

                    {/* Expression preview - like type selector in DC editor */}
                    {firstDialect?.expression && (
                        <span className="text-xs text-gray-400 font-mono flex-shrink-0 min-w-20" title={`${firstDialect.dialect || 'SQL'}: ${firstDialect.expression}`}>
                            {firstDialect.expression}
                        </span>
                    )}

                    {/* Indicator icons - fixed width for alignment */}
                    <div className="flex items-center gap-1 min-w-14 flex-shrink-0">
                        {isPrimaryKey && (
                            <Tooltip content="Primary Key">
                                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                </svg>
                            </Tooltip>
                        )}
                        {isTimeDimension && (
                            <Tooltip content="Time Dimension">
                                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </Tooltip>
                        )}
                    </div>

                    {/* Description preview */}
                    {field.description && (
                        <span className="text-xs text-gray-400 truncate flex-1" title={field.description}>
                            {field.description}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FieldRow;
