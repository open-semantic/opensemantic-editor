import { useEffect } from 'react';
import { Header, SidebarNavigation, MainContent } from './layouts/index.js';
import { HashRouter } from 'react-router-dom'
import { useEditorStore, setFileStorageBackend, setEditorConfig } from './store.js';
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js';
import { ToastContainer } from './components/ui/Toast.jsx';
import { ErrorBoundary } from './components/error/index.js';

function App({ storageBackend = null, editorConfig = null }) {
    const currentView = useEditorStore((state) => state.currentView);
    const yamlParseError = useEditorStore((state) => state.yamlParseError);

    useEffect(() => {
        if (storageBackend) {
            setFileStorageBackend(storageBackend);
        } else {
            setFileStorageBackend(new LocalFileStorageBackend());
        }
    }, [storageBackend]);

    useEffect(() => {
        if (editorConfig) {
            setEditorConfig(editorConfig);
        }
    }, [editorConfig]);

    return (
        <ErrorBoundary
            fallback={({ error, resetError }) => (
                <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
                        <h1 className="text-lg font-bold text-red-800">Application Error</h1>
                        <p className="mt-2 text-sm text-red-700">The Open Semantic Editor encountered a critical error.</p>
                        <div className="mt-3 text-sm text-red-600"><span className="font-medium">Error: </span>{error?.message || 'Unknown error'}</div>
                        <div className="mt-4 flex gap-3">
                            <button onClick={resetError} className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50">Try Again</button>
                            <button onClick={() => window.location.reload()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">Reload</button>
                        </div>
                    </div>
                </div>
            )}
        >
            <HashRouter>
                <div className="bg-white h-full">
                    <div className="h-full flex flex-row">
                        <div className="flex flex-col flex-1 min-w-0 h-full">
                            <Header />
                            <main className="flex flex-row w-full bg-white flex-1 overflow-hidden min-w-0">
                                {currentView === 'form' && !yamlParseError && (
                                    <>
                                        <div className="hidden md:block">
                                            <SidebarNavigation />
                                        </div>
                                        <SidebarNavigation isMobile={true} />
                                    </>
                                )}
                                <MainContent />
                            </main>
                        </div>
                    </div>
                    <ToastContainer />
                </div>
            </HashRouter>
        </ErrorBoundary>
    )
}

export default App
