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

### Docker

You can also run the editor as a Docker container locally or on your own infrastructure:

```bash
docker run -d -p 4173:4173 opensemantic/editor
```

Then open http://localhost:4173

### Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

### Embedding

Install the npm package:

```bash
npm install opensemantic-editor
```

Then embed the editor in your application:

```js
import { init } from 'opensemantic-editor';
import 'opensemantic-editor/dist/style.css';

const editor = init({
  container: '#opensemantic-editor',
  yaml: 'version: "0.1.1"\nsemantic_model:\n  - name: "my_model"\n    datasets: []\n',
  onSave: (yaml) => console.log('Saved:', yaml),
});
```


## License

This project is maintained by [Entropy Data](https://entropy-data.com) and licensed under the [MIT LICENSE](LICENSE).
