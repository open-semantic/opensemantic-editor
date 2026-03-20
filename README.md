# Open Semantic Editor

A web-based editor for creating and managing semantic models using the [Open Semantic Interchange (OSI)](https://github.com/open-semantic-interchange/OSI) standard.

## Features

- **Open Semantic Interchange**: OSI is the open standard for semantic models.
- **Editing Modes**:
  - **Visual Editor**: Define datasets and relationships using a visual interface
  - **Form Editor**: Get guided input with a simple form interface
  - **YAML Editor**: Edit semantic models directly in YAML format with code completion
- **Preview**: Live preview of semantic models as HTML
- **Validation**: Get instant feedback on your semantic models

## Usage

### Web Editor

Open the editor as web application:

https://editor.opensemantic.com

### Standalone Application

```bash
npx opensemantic-editor
```

Or edit a semantic model file directly:

```bash
npx opensemantic-editor my-model.yaml
```

### Docker

```bash
docker run -d -p 4173:4173 ghcr.io/open-semantic/opensemantic-editor
```

Then open http://localhost:4173

### Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

### Embedding

The editor can be embedded in any web page:

```html
<div id="opensemantic-editor" style="height: 100vh;"></div>
<link rel="stylesheet" href="opensemantic-editor.css" />
<script type="module">
  import { init } from './opensemantic-editor.es.js';

  const editor = init({
    container: '#opensemantic-editor',
    yaml: 'version: "0.1.1"\nsemantic_model:\n  - name: "my_model"\n    datasets: []\n',
    onSave: (yaml) => console.log('Saved:', yaml),
  });
</script>
```


## License

This project is maintained by [Entropy Data](https://entropy-data.com) and licensed under the [MIT LICENSE](LICENSE).
