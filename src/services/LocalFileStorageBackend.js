import { FileStorageBackend } from './FileStorageBackend.js';

export class LocalFileStorageBackend extends FileStorageBackend {
  constructor() {
    super();
    this.supportsFileSystemAccess = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }

  async loadYamlFile() {
    if (this.supportsFileSystemAccess) {
      return this._loadWithFileSystemAccess();
    } else {
      return this._loadWithFileInput();
    }
  }

  async saveYamlFile(yamlContent, suggestedName = 'semantic-model.yaml') {
    if (!yamlContent.trim()) {
      throw new Error('No content to save');
    }
    if (this.supportsFileSystemAccess) {
      return this._saveWithFileSystemAccess(yamlContent, suggestedName);
    } else {
      return this._saveWithDownload(yamlContent, suggestedName);
    }
  }

  supportsFileDialog() {
    return this.supportsFileSystemAccess;
  }

  getBackendName() {
    return 'Local File System';
  }

  async _loadWithFileSystemAccess() {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'YAML files',
        accept: { 'application/x-yaml': ['.yaml', '.yml'] },
      }],
    });
    const file = await fileHandle.getFile();
    return await file.text();
  }

  async _saveWithFileSystemAccess(yamlContent, suggestedName) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'YAML files',
        accept: { 'application/x-yaml': ['.yaml', '.yml'] },
      }],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(yamlContent);
    await writable.close();
    return { filename: fileHandle.name };
  }

  async _loadWithFileInput() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.yaml,.yml';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) { reject(new Error('No file selected')); return; }
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      input.oncancel = () => reject(new Error('File selection cancelled'));
      input.click();
    });
  }

  async _saveWithDownload(yamlContent, suggestedName) {
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { filename: suggestedName };
  }
}
