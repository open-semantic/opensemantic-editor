import { useEditorStore } from '../../store.js';

const WarningsPanel = ({ onMarkerClick }) => {
    const markers = useEditorStore((state) => state.markers);
    const schemaUrl = useEditorStore((state) => state.schemaUrl);

    const handleMarkerClick = (marker) => {
        if (onMarkerClick) onMarkerClick(marker.startLineNumber, marker.startColumn);
    };

    const schemaFilename = schemaUrl ? schemaUrl.split('/').pop() : null;

    if (markers.length === 0) {
        return (
            <div className="h-full bg-gray-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">No issues found</h3>
                        <p className="mt-1 text-sm">Your YAML is valid with no errors or warnings.</p>
                    </div>
                </div>
                {schemaFilename && (
                    <div className="p-3 bg-white border-t border-gray-200">
                        <a href={schemaUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline font-medium">{schemaFilename}</a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-lg font-bold mb-4 text-red-700">Problems ({markers.length})</h2>
                <div className="space-y-1">
                    {markers.map((marker, index) => (
                        <button key={index} onClick={() => handleMarkerClick(marker)}
                            className="w-full text-left p-2 rounded transition-colors bg-red-50 hover:bg-red-100">
                            <div className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 bg-red-100 text-red-700">!</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 break-words">{marker.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">Line {marker.startLineNumber}, Column {marker.startColumn}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            {schemaFilename && (
                <div className="p-3 bg-white border-t border-gray-200">
                    <a href={schemaUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-medium">{schemaFilename}</a>
                </div>
            )}
        </div>
    );
};

export default WarningsPanel;
