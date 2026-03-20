import { memo, useState, useEffect, useRef, Fragment, useCallback } from 'react';
import { Handle, Position, NodeToolbar, useReactFlow } from '@xyflow/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

// Disable layout animation to prevent visual glitch on drop
const animateLayoutChanges = () => false;

// Sortable field row wrapper component
const SortableFieldRow = ({ id: fieldId, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: fieldId,
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : 'none',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  );
};

const DatasetNode = ({ data, id }) => {
  const { getNode } = useReactFlow();
  const [isEditingDatasetName, setIsEditingDatasetName] = useState(false);
  const [editedDatasetName, setEditedDatasetName] = useState('');
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editedFieldName, setEditedFieldName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const contextMenuRef = useRef(null);
  const shouldEditNextField = useRef(false);
  const previousFieldCount = useRef(data.dataset.fields?.length || 0);
  const isSavingRef = useRef(false);
  const hoverTimeoutRef = useRef(null);
  const openFieldDetails = data.openFieldDetails;

  // Drag-and-drop sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for field reordering
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = parseInt(active.id.toString().replace('field-', ''), 10);
    const toIndex = parseInt(over.id.toString().replace('field-', ''), 10);

    if (!isNaN(fromIndex) && !isNaN(toIndex) && data.onReorderField) {
      data.onReorderField(id, fromIndex, toIndex);
    }
  }, [data, id]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDialog = event.target.closest('[role="dialog"]') ||
                            event.target.closest('[data-headlessui-state]');

      if (!isInsideDialog) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setContextMenu(null);
        }
      }
    };

    if (showMenu || contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu, contextMenu]);

  // Auto-edit newly added field
  useEffect(() => {
    const currentFieldCount = data.dataset.fields?.length || 0;

    if (shouldEditNextField.current && currentFieldCount > previousFieldCount.current) {
      const newFieldIndex = currentFieldCount - 1;
      const newFieldName = data.dataset.fields?.[newFieldIndex]?.name || '';
      setEditingFieldIndex(newFieldIndex);
      setEditedFieldName(newFieldName);
      shouldEditNextField.current = false;
    }

    previousFieldCount.current = currentFieldCount;
  }, [data.dataset.fields]);

  const handleAddField = () => {
    data.onAddField(id, {
      name: '',
      expression: { dialects: [{ dialect: 'ANSI_SQL', expression: '' }] },
    });
  };

  const handleDeleteField = (fieldIndex) => {
    data.onDeleteField(id, fieldIndex);
  };

  const handleUpdateField = (fieldIndex, updates) => {
    const updatedFields = [...(data.dataset.fields || [])];
    updatedFields[fieldIndex] = {
      ...updatedFields[fieldIndex],
      ...updates,
    };
    data.onUpdateDataset(id, {
      ...data.dataset,
      fields: updatedFields,
    });
  };

  const handleDeleteDataset = () => {
    data.onDeleteDataset(id);
  };

  const handleStartEditDatasetName = () => {
    setEditedDatasetName(data.dataset.name || '');
    setIsEditingDatasetName(true);
  };

  const handleSaveDatasetName = () => {
    if (editedDatasetName.trim()) {
      data.onUpdateDataset(id, {
        ...data.dataset,
        name: editedDatasetName.trim(),
      });
    }
    setIsEditingDatasetName(false);
  };

  const handleStartEditFieldName = (index, currentName) => {
    setEditingFieldIndex(index);
    setEditedFieldName(currentName || '');
  };

  const handleSaveFieldName = (index, shouldAddNext = false) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    const isLastField = index === (data.dataset.fields?.length || 0) - 1;
    const trimmedName = String(editedFieldName || '').trim();

    if (shouldAddNext && isLastField) {
      // Combined: save current field AND add new one
      const updatedFields = [...(data.dataset.fields || [])];
      updatedFields[index] = {
        ...updatedFields[index],
        name: trimmedName,
      };
      updatedFields.push({
        name: '',
        expression: { dialects: [{ dialect: 'ANSI_SQL', expression: '' }] },
      });
      data.onUpdateDataset(id, {
        ...data.dataset,
        fields: updatedFields,
      });
      shouldEditNextField.current = true;
    } else {
      handleUpdateField(index, { name: trimmedName });
      setEditingFieldIndex(null);
      setEditedFieldName('');
    }

    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  };

  const handleFieldContextMenu = (event, fieldIndex) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      fieldIndex,
    });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 800);
  };

  const primaryKey = data.dataset.primary_key || [];
  const fields = data.dataset.fields || [];

  return (
    <div
      className="min-w-[250px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Node Toolbar */}
      <NodeToolbar isVisible={isHovered} position={Position.Bottom} offset={10}>
        <div className="flex items-center gap-1 bg-white rounded-md shadow-lg border border-gray-200 p-1">
          <button
            onClick={handleAddField}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Add field"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="More options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-50 min-w-[180px]">
                <button
                  onClick={() => {
                    handleDeleteDataset();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Dataset
                </button>
              </div>
            )}
          </div>
        </div>
      </NodeToolbar>

      {/* Accent Bar */}
      <div className="h-1.5 rounded-t bg-fuchsia-700"></div>

      {/* Dataset Container with Border */}
      <div className="border-[3px] rounded-b border-solid border-[#E9EEF4]">
        {/* Dataset Header */}
        <div className="flex items-center bg-[#E9EEF4] px-2 py-1.5">
          {/* Table Icon */}
          <span className="mr-1.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#000">
              <path d="M1.930848 1.960304C1.164656 2.0890560000000002 0.5672480000000001 2.720784 0.481104 3.493344C0.45718400000000003 3.707872 0.45718400000000003 12.292128000000002 0.481104 12.506656000000001C0.556416 13.182064 1.023328 13.757952 1.67112 13.9744C1.955984 14.069584 1.5522719999999999 14.063872 8 14.063872C14.428111999999999 14.063872 14.025120000000001 14.069504 14.32 13.975567999999999C14.967136 13.769408 15.44312 13.186208 15.518896000000002 12.506656000000001C15.542816 12.292128000000002 15.542816 3.707872 15.518896000000002 3.493344C15.432112 2.714992 14.832336 2.0853919999999997 14.058 1.959808C13.930848000000001 1.939184 13.146432 1.936336 7.984 1.937712C3.166448 1.938992 2.03256 1.9432159999999998 1.930848 1.960304M1.981696 2.981056C1.74744 3.060912 1.557504 3.262384 1.4968320000000002 3.4953600000000002C1.475616 3.576832 1.472 3.742864 1.472 4.6353599999999995L1.472 5.68 8 5.68L14.528 5.68 14.528 4.6353599999999995C14.528 3.742864 14.524384 3.576832 14.503168 3.4953600000000002C14.441392 3.258128 14.239951999999999 3.0488000000000004 14.002992 2.975616C13.901808 2.944368 13.832176 2.944 7.99432 2.9444160000000004L2.088 2.944832 1.981696 2.981056M1.472 8.064L1.472 9.44 3.3120000000000003 9.44L5.152 9.44 5.152 8.064L5.152 6.688 3.3120000000000003 6.688L1.472 6.688 1.472 8.064M6.16 8.064L6.16 9.44 8 9.44L9.84 9.44 9.84 8.064L9.84 6.688 8 6.688L6.16 6.688 6.16 8.064M10.848 8.064L10.848 9.44 12.688 9.44L14.528 9.44 14.528 8.064L14.528 6.688 12.688 6.688L10.848 6.688 10.848 8.064M1.472 11.420639999999999C1.472 12.262528 1.47568 12.423440000000001 1.4968320000000002 12.50464C1.558608 12.741871999999999 1.760048 12.951200000000002 1.9970080000000001 13.024384C2.09592 13.054943999999999 2.1507359999999998 13.056000000000001 3.62568 13.056000000000001L5.152 13.056000000000001 5.152 11.744L5.152 10.432 3.3120000000000003 10.432L1.472 10.432 1.472 11.420639999999999M6.16 11.744L6.16 13.056000000000001 8 13.056000000000001L9.84 13.056000000000001 9.84 11.744L9.84 10.432 8 10.432L6.16 10.432 6.16 11.744M10.848 11.744L10.848 13.056000000000001 12.374319999999999 13.056000000000001C13.849264 13.056000000000001 13.90408 13.054943999999999 14.002992 13.024384C14.239951999999999 12.951200000000002 14.441392 12.741871999999999 14.503168 12.50464C14.52432 12.423440000000001 14.528 12.262528 14.528 11.420639999999999L14.528 10.432 12.688 10.432L10.848 10.432 10.848 11.744" fillRule="evenodd"/>
            </svg>
          </span>
          {isEditingDatasetName ? (
            <input
              type="text"
              value={editedDatasetName}
              onChange={(e) => setEditedDatasetName(e.target.value)}
              onBlur={handleSaveDatasetName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveDatasetName();
                } else if (e.key === 'Escape') {
                  setIsEditingDatasetName(false);
                }
              }}
              className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border-2 border-indigo-300 focus:outline-none focus:border-indigo-400"
              autoFocus
            />
          ) : (
            <div
              className="cursor-pointer hover:opacity-80 flex-1 min-w-0"
              onClick={handleStartEditDatasetName}
              title="Click to edit"
            >
              <span className="font-bold text-md truncate">{data.dataset.name || 'Unnamed Dataset'}</span>
            </div>
          )}
        </div>

        {/* Fields List with Drag-and-Drop */}
        <div className="bg-white rounded-b divide-y divide-[#E9EEF4]">
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
                {fields.map((field, index) => {
                  const isFieldDetailsOpen = openFieldDetails?.fieldIndex === index;
                  const isPK = primaryKey.includes(field.name);
                  const isTimeDim = field.dimension?.is_time;
                  const expr = field.expression?.dialects?.[0]?.expression;
                  const showExpr = expr && expr !== field.name;

                  return (
                    <SortableFieldRow key={`field-${index}`} id={`field-${index}`}>
                      {({ dragHandleProps, isDragging }) => (
                        <Fragment>
                          <div
                            className={`pl-2 pr-3 py-2 group relative cursor-pointer ${
                              isFieldDetailsOpen ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                            } ${isDragging ? 'shadow-lg bg-white' : ''}`}
                            onContextMenu={(e) => handleFieldContextMenu(e, index)}
                            onClick={() => {
                              const node = getNode(id);
                              if (!node) return;
                              const headerHeight = 40;
                              const fieldRowHeight = 42;
                              const fieldOffset = headerHeight + (index * fieldRowHeight);
                              data.onShowFieldDetails?.(id, index, node.position, fieldOffset, 'click');
                            }}
                          >
                            {/* Field handles for connections */}
                            <Handle
                              type="source"
                              position={Position.Right}
                              id={`${id}-field-${index}-source`}
                              className="w-6 h-6 !bg-indigo-500 !border-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ right: -1 }}
                            />
                            <Handle
                              type="target"
                              position={Position.Left}
                              id={`${id}-field-${index}-target`}
                              className="w-6 h-6 !bg-gray-400 !border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ left: -1 }}
                            />
                            <div className="flex justify-between items-center">
                              {/* Left side: Name */}
                              <div className="flex items-center flex-1 min-w-0">
                                {editingFieldIndex === index ? (
                                  <input
                                    type="text"
                                    value={editedFieldName}
                                    onChange={(e) => setEditedFieldName(e.target.value)}
                                    onBlur={() => handleSaveFieldName(index)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSaveFieldName(index, true);
                                      } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingFieldIndex(null);
                                        setEditedFieldName('');
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500"
                                    placeholder="field name"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    {/* Drag handle */}
                                    <span
                                      {...dragHandleProps}
                                      className="nodrag cursor-grab active:cursor-grabbing touch-none text-gray-400"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Drag to reorder"
                                    >
                                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                                      </svg>
                                    </span>
                                    <span
                                      className={`text-sm font-medium truncate cursor-pointer hover:text-indigo-600 ${
                                        !field.name || (typeof field.name === 'string' && field.name.trim() === '') ? 'text-gray-400 italic' : 'text-gray-900'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditFieldName(index, field.name);
                                        // Also show field details drawer
                                        const node = getNode(id);
                                        if (node) {
                                          const headerHeight = 40;
                                          const fieldRowHeight = 42;
                                          const fieldOffset = headerHeight + (index * fieldRowHeight);
                                          data.onShowFieldDetails?.(id, index, node.position, fieldOffset, 'click');
                                        }
                                      }}
                                      title="Click to edit"
                                    >
                                      {!field.name || (typeof field.name === 'string' && field.name.trim() === '') ? 'unnamed field' : field.name}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Right side: indicators */}
                              <div className="flex items-center gap-1 ml-2">
                                {editingFieldIndex !== index && (
                                  <>
                                    {isTimeDim && (
                                      <svg className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {isPK && (
                                      <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                      </svg>
                                    )}
                                    {showExpr && (
                                      <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{expr}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      )}
                    </SortableFieldRow>
                  );
                })}
              </SortableContext>
            </DndContext>
          ) : (
            <div
              className="px-4 py-3 text-xs text-gray-400 italic cursor-pointer hover:bg-gray-50"
              onClick={handleAddField}
            >
              No fields defined
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-md shadow-lg py-1 z-50 min-w-[120px] border border-gray-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => {
              handleDeleteField(contextMenu.fieldIndex);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(DatasetNode);
