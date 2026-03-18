export class FileStorageBackend {
  async loadYamlFile() {
    throw new Error('loadYamlFile must be implemented by subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async saveYamlFile(yamlContent, suggestedName = 'semantic-model.yaml') {
    throw new Error('saveYamlFile must be implemented by subclass');
  }

  supportsFileDialog() {
    return false;
  }

  getBackendName() {
    return 'Unknown Backend';
  }
}
