import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js'
import * as Yaml from "yaml";
import { stringifyYaml } from './utils/yaml.js';

let fileStorageBackend = new LocalFileStorageBackend();

export const initialYaml = 'version: "0.1.1"\nsemantic_model:\n  - name: "my_model"\n    datasets: []\n';

export const setFileStorageBackend = (backend) => {
  fileStorageBackend = backend;
};

export const getFileStorageBackend = () => {
  return fileStorageBackend;
};

let overrideStore = null;

export const setOverrideStore = (store) => {
  overrideStore = store;
};

export const getOverrideStore = () => {
  return overrideStore;
};

export function getValueWithPath(obj, path, defaultValue) {
  const keys = path?.split(/\.|\[|\]/).filter(Boolean);
  const result = keys?.reduce((acc, key) => acc?.[key], obj);
  return result !== undefined ? result : defaultValue;
}

export function setValueWithPath(obj, path, value) {
  const newObj = JSON.parse(JSON.stringify(obj || {}));
  const keys = path.match(/[^.[\]]+/g);
  keys.slice(0, -1).reduce((acc, key, i) =>
    acc[key] = acc[key] || (/^\d+$/.test(keys[i + 1]) ? [] : {}), newObj
  )[keys[keys.length - 1]] = value;
  return newObj;
}

export function extractParseErrorMessage(e) {
  try {
    if (e?.message) return String(e.message);
  } catch { /* ignore */ }
  return 'Unknown YAML parse error';
}

export function extractParseErrorPos(e) {
  try {
    const pos = e?.linePos?.[0];
    if (pos && typeof pos.line === 'number') {
      return { line: pos.line, col: typeof pos.col === 'number' ? pos.col : 1 };
    }
  } catch { /* ignore */ }
  return null;
}

export function defaultStoreConfig(set, get) {
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
      try {
        const yamlParts = Yaml.parse(newYaml);
        set({ yaml: newYaml, baselineYaml: newYaml, isDirty: false, yamlParts, yamlParseError: null, yamlParseErrorPos: null });
      } catch {
        // NOOP
      }
    },
    getValue: (path) => getValueWithPath(get().yamlParts, path),
    setValue: (path, value) => {
      const newYamlParts = setValueWithPath(get().yamlParts, path, value);
      set({ yamlParts: newYamlParts, yaml: stringifyYaml(newYamlParts), isDirty: true })
    },
    clearSaveInfo: () => set({ lastSaveInfo: null }),
    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      const newNotification = { id, type: 'info', duration: 3000, ...notification };
      set((state) => ({ notifications: [...state.notifications, newNotification] }));
      if (newNotification.duration > 0) {
        setTimeout(() => {
          set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }));
        }, newNotification.duration);
      }
      return id;
    },
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    toggleMobileSidebar: () => set((state) => ({
      isMobileSidebarOpen: !state.isMobileSidebarOpen,
    })),
    closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
    togglePreview: () => set((state) => ({
      isPreviewVisible: !state.isPreviewVisible,
      isWarningsVisible: false,
    })),
    toggleWarnings: () => set((state) => ({
      isWarningsVisible: !state.isWarningsVisible,
      isPreviewVisible: false,
    })),
    setMarkers: (markers) => set({ markers }),
    setView: (view) => set({ currentView: view }),
    setSchemaInfo: (schemaUrl, schemaData) => set({ schemaUrl, schemaData }),
    loadFromFile: async (filename = null) => {
      try {
        const yamlContent = await fileStorageBackend.loadYamlFile(filename);
        let modelName = 'untitled';
        try {
          const parsed = Yaml.parse(yamlContent);
          modelName = parsed?.semantic_model?.[0]?.name || 'untitled';
        } catch { /* ignore */ }

        get().setYaml(yamlContent);
        set({
          baselineYaml: yamlContent,
          lastSaveInfo: filename ? {
            filename,
            timestamp: new Date().toISOString(),
            modelName,
          } : null
        });
        return yamlContent;
      } catch (error) {
        if (error.message !== 'File selection cancelled') {
          throw error;
        }
      }
    },
    saveToFile: async (suggestedName) => {
      const { yaml, lastSaveInfo } = get();
      const parsed = Yaml.parse(yaml);
      const modelName = (parsed?.semantic_model?.[0]?.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_');
      const suggestedFilename = `${suggestedName || modelName}.yaml`;
      const existingFilename = lastSaveInfo?.filename;
      const result = await fileStorageBackend.saveYamlFile(yaml, suggestedFilename, existingFilename);

      set({
        isDirty: false,
        baselineYaml: yaml,
        lastSaveInfo: {
          filename: result?.filename || suggestedFilename,
          timestamp: new Date().toISOString(),
          modelName: parsed?.semantic_model?.[0]?.name,
        }
      });

      const { addNotification } = get();
      addNotification({
        type: 'success',
        title: 'Saved successfully',
        message: `${result?.filename || suggestedFilename} has been saved`,
        duration: 3000
      });
    },
  };

  return {
    yaml: initialYaml,
    yamlParts: Yaml.parse(initialYaml),
    baselineYaml: initialYaml,
    isDirty: false,
    isMobileSidebarOpen: false,
    isPreviewVisible: true,
    isWarningsVisible: false,
    markers: [],
    yamlParseError: null,
    yamlParseErrorPos: null,
    pendingScrollToPos: null,
    currentView: 'form',
    schemaUrl: null,
    schemaData: null,
    yamlCursorLine: 1,
    lastSaveInfo: null,
    notifications: [],
    editorConfig: {
      mode: 'SERVER',
    },
    ...actions,
  };
}

const defaultEditorStore = create()(
  devtools(
    persist(defaultStoreConfig, {
      name: 'osi-editor-store',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          editorConfig: {
            ...currentState.editorConfig,
            ...persistedState?.editorConfig,
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.yaml) {
          setTimeout(() => {
            try {
              const yamlParts = Yaml.parse(state.yaml);
              defaultEditorStore.setState({ yamlParts });
            } catch (e) {
              console.warn('Failed to parse yaml during rehydration:', e);
            }
          }, 0);
        }
      },
    })
  )
);

export const useEditorStore = (selector) => {
  const store = overrideStore || defaultEditorStore;
  return store(selector);
};

useEditorStore.setState = (state) => {
  const store = overrideStore || defaultEditorStore;
  return store.setState(state);
};

useEditorStore.getState = () => {
  const store = overrideStore || defaultEditorStore;
  return store.getState();
};

export const setEditorConfig = (config) => {
  const store = overrideStore || defaultEditorStore;
  const currentConfig = store.getState().editorConfig;
  store.setState({
    editorConfig: { ...currentConfig, ...config },
  });
};
