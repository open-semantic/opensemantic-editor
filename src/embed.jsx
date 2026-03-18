import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { create } from 'zustand'
import App from './App.jsx'
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js'
import { getValueWithPath, setOverrideStore, setValueWithPath, extractParseErrorMessage, extractParseErrorPos } from './store.js'
import './index.css'
import './components/diagram/DiagramStyles.css'
import * as Yaml from "yaml";
import { stringifyYaml } from './utils/yaml.js';

let activeEditorInstance = null;
let globalEditorStore = null;

const DEFAULT_CONFIG = {
    container: '#opensemantic-editor',
    yaml: 'version: "0.1.1"\nsemantic_model:\n  - name: "my_model"\n    datasets: []\n',
    schemaUrl: 'https://raw.githubusercontent.com/open-semantic-interchange/OSI/refs/heads/main/core-spec/osi-schema.json',
    availableViews: ['yaml', 'form', 'diagram'],
    initialView: 'form',
    mode: 'SERVER',
    onSave: null,
    backend: null,
    enablePersistence: false,
    showPreview: true,
};

function createConfiguredStore(config) {
    const storageBackend = config.backend || new LocalFileStorageBackend();

    const storeConfig = (set, get) => {
        const actions = {
            setYaml: (newYaml) => {
                try {
                    const yamlParts = Yaml.parse(newYaml);
                    set({ yaml: newYaml, isDirty: true, yamlParts, yamlParseError: null, yamlParseErrorPos: null });
                } catch (e) {
                    set({ yaml: newYaml, isDirty: true, yamlParseError: extractParseErrorMessage(e), yamlParseErrorPos: extractParseErrorPos(e) });
                }
            },
            loadYaml: (newYaml) => {
                get().setYaml(newYaml);
                set({ baselineYaml: newYaml, isDirty: false });
            },
            getValue: (path) => getValueWithPath(get().yamlParts, path),
            setValue: (path, value) => {
                const newYamlParts = setValueWithPath(get().yamlParts, path, value);
                set({ yamlParts: newYamlParts, yaml: stringifyYaml(newYamlParts), isDirty: true });
            },
            clearSaveInfo: () => set({ lastSaveInfo: null }),
            addNotification: (notification) => {
                const id = Date.now() + Math.random();
                const n = { id, type: 'info', duration: 3000, ...notification };
                set((state) => ({ notifications: [...state.notifications, n] }));
                if (n.duration > 0) setTimeout(() => set((state) => ({ notifications: state.notifications.filter(x => x.id !== id) })), n.duration);
                return id;
            },
            removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
            togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible, isWarningsVisible: false })),
            toggleWarnings: () => set((state) => ({ isWarningsVisible: !state.isWarningsVisible, isPreviewVisible: false })),
            setMarkers: (markers) => set({ markers }),
            setView: (view) => set({ currentView: view }),
            setSchemaInfo: (schemaUrl, schemaData) => set({ schemaUrl, schemaData }),
            loadFromFile: async () => {
                try {
                    const yamlContent = await storageBackend.loadYamlFile();
                    get().setYaml(yamlContent);
                    set({ baselineYaml: yamlContent });
                    return yamlContent;
                } catch (error) {
                    if (error.message !== 'File selection cancelled') throw error;
                }
            },
            saveToFile: async (suggestedName = 'semantic-model.yaml') => {
                const { yaml } = get();
                if (config.onSave) {
                    config.onSave(yaml);
                    set({ isDirty: false, baselineYaml: yaml });
                    return;
                }
                await storageBackend.saveYamlFile(yaml, suggestedName);
                set({ isDirty: false, baselineYaml: yaml });
            },
            toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
            closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
        };

        return {
            yaml: config.yaml,
            yamlParts: Yaml.parse(config.yaml),
            baselineYaml: config.yaml,
            isDirty: false,
            isPreviewVisible: config.showPreview,
            isWarningsVisible: false,
            isMobileSidebarOpen: false,
            markers: [],
            yamlParseError: null,
            yamlParseErrorPos: null,
            pendingScrollToPos: null,
            currentView: config.initialView,
            schemaUrl: config.schemaUrl,
            schemaData: null,
            yamlCursorLine: 1,
            lastSaveInfo: null,
            notifications: [],
            editorConfig: { mode: config.mode },
            ...actions,
        };
    };

    return create()(storeConfig);
}

export function init(userConfig = {}) {
    const config = { ...DEFAULT_CONFIG, ...userConfig };

    let containerElement;
    if (typeof config.container === 'string') {
        containerElement = document.querySelector(config.container);
        if (!containerElement) throw new Error(`Container element not found: ${config.container}`);
    } else if (config.container instanceof HTMLElement) {
        containerElement = config.container;
    } else {
        throw new Error('Container must be a CSS selector string or HTMLElement');
    }

    if (activeEditorInstance) activeEditorInstance.destroy();

    globalEditorStore = createConfiguredStore(config);
    setOverrideStore(globalEditorStore);

    const root = createRoot(containerElement);
    root.render(<StrictMode><App /></StrictMode>);

    const instance = {
        getYaml() { return globalEditorStore.getState().yaml; },
        setYaml(yaml) { globalEditorStore.getState().loadYaml(yaml); },
        isDirty() { return globalEditorStore.getState().isDirty; },
        setView(view) { globalEditorStore.getState().setView(view); },
        getView() { return globalEditorStore.getState().currentView; },
        getMarkers() { return globalEditorStore.getState().markers; },
        subscribe(callback) { return globalEditorStore.subscribe(callback); },
        destroy() {
            root.unmount();
            setOverrideStore(null);
            activeEditorInstance = null;
            globalEditorStore = null;
        },
        getStore() { return globalEditorStore; },
    };

    activeEditorInstance = instance;
    return instance;
}

export function getInstance() {
    return activeEditorInstance;
}
