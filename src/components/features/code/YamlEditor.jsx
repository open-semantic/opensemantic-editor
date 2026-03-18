import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEditorStore } from '../../../store.js';

import '../../../lib/monaco-workers.js';

const YamlEditor = forwardRef(({ schemaUrl }, ref) => {
    const yaml = useEditorStore((state) => state.yaml);
    const setYaml = useEditorStore((state) => state.setYaml);
    const editorRef = useRef(null);
    const [fetchedSchema, setFetchedSchema] = useState(null);
    const [schemaError, setSchemaError] = useState(null);
    const [showDiff, setShowDiff] = useState(false);
    const [diffRenderSideBySide, setDiffRenderSideBySide] = useState(true);
    const monacoYamlRef = useRef(null);
    const monacoRef = useRef(null);
    const setMarkers = useEditorStore((state) => state.setMarkers);
    const setSchemaInfo = useEditorStore((state) => state.setSchemaInfo);
    const baselineYaml = useEditorStore((state) => state.baselineYaml);
    const hasChanges = yaml !== baselineYaml;

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        configureEditor(monaco);

        const updateMarkers = () => {
            const model = editor.getModel();
            if (model) {
                const markers = monaco.editor.getModelMarkers({ resource: model.uri });
                setMarkers(markers);
            }
        };

        updateMarkers();

        const markerDisposable = monaco.editor.onDidChangeMarkers(() => updateMarkers());
        const contentDisposable = editor.onDidChangeModelContent(() => setTimeout(updateMarkers, 100));
        const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
            useEditorStore.setState({ yamlCursorLine: e.position.lineNumber });
        });

        editor.onDidDispose(() => {
            markerDisposable.dispose();
            contentDisposable.dispose();
            cursorDisposable.dispose();
            setMarkers([]);
        });
    };

    useEffect(() => {
        if (schemaUrl && schemaUrl.trim()) {
            fetch(schemaUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    return response.json();
                })
                .then(schemaData => {
                    setFetchedSchema(schemaData);
                    setSchemaError(null);
                    setSchemaInfo(schemaUrl, schemaData);
                })
                .catch(error => {
                    setSchemaError(`Failed to load schema: ${error.message}`);
                    setFetchedSchema(null);
                    setSchemaInfo(schemaUrl, null);
                });
        } else {
            setFetchedSchema(null);
            setSchemaError(null);
            setSchemaInfo(null, null);
        }
    }, [schemaUrl, setSchemaInfo]);

    const configureEditor = (monaco) => {
        try {
            const monacoYaml = configureMonacoYaml(monaco, {
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                validate: true,
                format: true,
                schemas: []
            });
            monacoYamlRef.current = monacoYaml;
        } catch (error) {
            console.warn('Failed to configure monaco-yaml:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        getValue: () => editorRef.current?.getModel()?.getValue(),
        setValue: (value) => editorRef.current?.getModel()?.setValue(value),
        revealLine: (lineNumber, column = 1) => {
            if (editorRef.current) {
                editorRef.current.revealLineInCenter(lineNumber);
                editorRef.current.setPosition({ lineNumber, column });
                editorRef.current.focus();
            }
        }
    }));

    const handleChange = (value) => {
        if (setYaml) setYaml(value);
    };

    useEffect(() => {
        if (monacoYamlRef.current && fetchedSchema) {
            try {
                monacoYamlRef.current.update({
                    enableSchemaRequest: true, hover: true, completion: true, validate: true, format: true,
                    schemas: [{ uri: schemaUrl || 'http://myserver/schema.json', fileMatch: ['*'], schema: fetchedSchema }]
                });
            } catch (error) {
                console.warn('Failed to update schema:', error);
            }
        }
    }, [fetchedSchema, schemaUrl]);

    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            setTimeout(() => {
                const model = editorRef.current.getModel();
                if (model) {
                    const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
                    setMarkers(markers);
                }
            }, 200);
        }
    }, [yaml, setMarkers]);

    const pendingScrollToPos = useEditorStore((state) => state.pendingScrollToPos);
    useEffect(() => {
        if (pendingScrollToPos && editorRef.current && monacoRef.current) {
            const { line, col } = pendingScrollToPos;
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            editor.revealLineInCenter(line);
            editor.setPosition({ lineNumber: line, column: col || 1 });
            editor.focus();
            const decorations = editor.deltaDecorations([], [{
                range: new monaco.Range(line, 1, line, 1),
                options: { isWholeLine: true, className: 'yaml-error-line-highlight' },
            }]);
            setTimeout(() => editor.deltaDecorations(decorations, []), 1000);
            useEditorStore.setState({ pendingScrollToPos: null });
        }
    }, [pendingScrollToPos]);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowDiff(false)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${!showDiff ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        Edit
                    </button>
                    <button onClick={() => setShowDiff(true)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors inline-flex items-center gap-1.5 ${showDiff ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        Diff
                        {hasChanges && <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />}
                    </button>
                </div>
                {showDiff && (
                    <div className="flex items-center gap-1">
                        <button onClick={() => setDiffRenderSideBySide(true)}
                            className={`px-2 py-0.5 text-xs rounded ${diffRenderSideBySide ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Split</button>
                        <button onClick={() => setDiffRenderSideBySide(false)}
                            className={`px-2 py-0.5 text-xs rounded ${!diffRenderSideBySide ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Unified</button>
                    </div>
                )}
            </div>
            {schemaError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-2">
                    <p className="text-sm text-red-700"><strong>Schema Error:</strong> {schemaError}</p>
                </div>
            )}
            <div className="flex-1">
                {showDiff ? (
                    hasChanges ? (
                        <DiffEditor
                            original={baselineYaml || ''} modified={yaml || ''} language="yaml" theme="light"
                            onMount={(editor) => {
                                const modifiedEditor = editor.getModifiedEditor();
                                modifiedEditor.onDidChangeModelContent(() => {
                                    const newValue = modifiedEditor.getValue();
                                    if (setYaml && newValue !== yaml) setYaml(newValue);
                                });
                            }}
                            options={{
                                renderSideBySide: diffRenderSideBySide, minimap: { enabled: false },
                                scrollBeyondLastLine: false, fontSize: 12, lineNumbers: 'on',
                                wordWrap: diffRenderSideBySide ? 'off' : 'on', automaticLayout: true,
                                originalEditable: false, ignoreTrimWhitespace: true,
                                stickyScroll: { enabled: false },
                            }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50">
                            <div className="text-center">
                                <h3 className="mt-2 text-sm font-medium">No changes</h3>
                                <p className="mt-1 text-sm">Your document matches the last saved version.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <Editor
                        height="100%" language="yaml" value={yaml || '# Enter your YAML here\n'}
                        onChange={handleChange} onMount={handleEditorDidMount} theme="vs-light"
                        options={{
                            minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12,
                            wordWrap: 'on', automaticLayout: true, tabSize: 2, insertSpaces: true,
                            folding: true, lineNumbers: 'on', glyphMargin: true,
                            stickyScroll: { enabled: false },
                            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }
                        }}
                    />
                )}
            </div>
        </div>
    );
});

YamlEditor.displayName = 'YamlEditor';
export default YamlEditor;
