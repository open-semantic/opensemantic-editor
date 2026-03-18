import { Routes, Route } from 'react-router-dom';
import { useRef, useState } from 'react';
import YamlEditor from "../components/features/code/YamlEditor.jsx";
import SemanticModelPreview from "../components/features/preview/SemanticModelPreview.jsx";
import WarningsPanel from "../components/features/WarningsPanel.jsx";
import { Overview, Datasets, Dataset, Relationships, Metrics, CustomExtensions, Diagram } from "../routes/index.js";
import { useEditorStore } from "../store.js";
import YamlParseErrorPage from "../components/features/code/YamlParseErrorPage.jsx";
import { ErrorBoundary } from "../components/error/index.js";
import ResizeDivider from "../components/ui/ResizeDivider.jsx";

const MainContent = () => {
    const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
    const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
    const currentView = useEditorStore((state) => state.currentView);
    const setView = useEditorStore((state) => state.setView);
    const yamlParseError = useEditorStore((state) => state.yamlParseError);

    const schemaUrl = useEditorStore((state) => state.schemaUrl) ||
        'https://raw.githubusercontent.com/open-semantic-interchange/OSI/refs/heads/main/core-spec/osi-schema.json';

    const editorRef = useRef(null);

    const handleMarkerClick = (lineNumber, column) => {
        setView('yaml');
        setTimeout(() => {
            if (editorRef.current && editorRef.current.revealLine) {
                editorRef.current.revealLine(lineNumber, column);
            }
        }, 100);
    };

    const isRightPaneVisible = isPreviewVisible || isWarningsVisible;
    const [leftPanePercent, setLeftPanePercent] = useState(50);

    return (
        <div className="flex flex-col w-full h-full min-w-0">
            <div className="flex flex-row w-full h-full min-w-0">
                <div
                    className={`h-full overflow-auto ${isRightPaneVisible ? 'max-lg:!w-full' : 'w-full'}`}
                    style={isRightPaneVisible ? { width: `${leftPanePercent}%` } : {}}
                >
                    {/* Always keep YAML editor mounted for validation */}
                    <div className={currentView === 'yaml' ? 'h-full' : 'hidden'}>
                        <YamlEditor ref={editorRef} schemaUrl={schemaUrl} />
                    </div>
                    {currentView === 'diagram' && (
                        yamlParseError ? (
                            <YamlParseErrorPage onSwitchToYaml={() => {
                                setView('yaml');
                                const pos = useEditorStore.getState().yamlParseErrorPos;
                                if (pos) useEditorStore.setState({ pendingScrollToPos: pos });
                            }} />
                        ) : (
                            <ErrorBoundary>
                                <Diagram />
                            </ErrorBoundary>
                        )
                    )}
                    {currentView === 'form' && (
                        yamlParseError ? (
                            <YamlParseErrorPage onSwitchToYaml={() => {
                                setView('yaml');
                                const pos = useEditorStore.getState().yamlParseErrorPos;
                                if (pos) useEditorStore.setState({ pendingScrollToPos: pos });
                            }} />
                        ) : (
                            <Routes>
                                <Route path="/" element={<Overview />} />
                                <Route path="/overview" element={<Overview />} />
                                <Route path="/datasets" element={<Datasets />} />
                                <Route path="/datasets/:datasetId" element={<Dataset />} />
                                <Route path="/relationships" element={<Relationships />} />
                                <Route path="/metrics" element={<Metrics />} />
                                <Route path="/custom-extensions" element={<CustomExtensions />} />
                                <Route path="*" element={<Overview />} />
                            </Routes>
                        )
                    )}
                </div>

                {isRightPaneVisible && (
                    <ResizeDivider onResize={setLeftPanePercent} />
                )}

                {isPreviewVisible && (
                    <div className="hidden md:block h-full p-4 overflow-y-auto overflow-x-hidden bg-gray-50"
                        style={{ width: `${100 - leftPanePercent}%` }}>
                        <ErrorBoundary>
                            <SemanticModelPreview />
                        </ErrorBoundary>
                    </div>
                )}
                {isWarningsVisible && (
                    <div className="hidden md:block h-full"
                        style={{ width: `${100 - leftPanePercent}%` }}>
                        <ErrorBoundary>
                            <WarningsPanel onMarkerClick={handleMarkerClick} />
                        </ErrorBoundary>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainContent;
