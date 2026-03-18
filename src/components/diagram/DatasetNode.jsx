import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const DatasetNode = memo(({ data }) => {
    return (
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md min-w-[250px] max-w-[350px]">
            <Handle type="target" position={Position.Left} className="!bg-indigo-500" />
            <div className="bg-indigo-50 border-b border-gray-200 px-3 py-2 rounded-t-lg">
                <div className="text-sm font-semibold text-gray-900">{data.name || 'Untitled'}</div>
                {data.source && <div className="text-xs text-gray-500">{data.source}</div>}
            </div>
            {data.fields?.length > 0 && (
                <div className="px-3 py-1">
                    {data.fields.slice(0, 15).map((field, i) => (
                        <div key={i} className="flex items-center justify-between py-0.5 text-xs">
                            <span className="font-mono text-gray-700">{field.name}</span>
                            {field.dimension?.is_time && (
                                <span className="text-indigo-500 text-[10px]">time</span>
                            )}
                        </div>
                    ))}
                    {data.fields.length > 15 && (
                        <div className="text-xs text-gray-400 py-0.5">...and {data.fields.length - 15} more</div>
                    )}
                </div>
            )}
            <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
        </div>
    );
});

DatasetNode.displayName = 'DatasetNode';
export default DatasetNode;
