# Open Semantic Editor

A visual editor for [Open Semantic Interchange (OSI)](https://github.com/open-semantic-interchange/OSI) semantic models. Edit semantic models using a form-based UI, raw YAML, or an interactive diagram view — with real-time validation against the OSI JSON Schema.

## Features

- **Form View** — Edit datasets, fields, relationships, metrics, and custom extensions through a structured UI
- **YAML View** — Full Monaco editor with syntax highlighting, auto-completion, and schema validation via [monaco-yaml](https://github.com/remcohaszing/monaco-yaml)
- **Diagram View** — Visualize datasets as nodes and relationships as edges using [React Flow](https://reactflow.dev/) with automatic Dagre layout
- **Live Preview** — Side-by-side HTML preview of the semantic model
- **Validation** — Real-time validation against the [OSI JSON Schema](https://github.com/open-semantic-interchange/OSI/blob/main/core-spec/osi-schema.json)
- **Diff View** — Compare current edits against the last saved version
- **File Operations** — Open and save `.yaml` files using the browser File System Access API
- **Embeddable** — Drop into any web page via a simple `init()` API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build (library mode) |
| `npm run build:debug` | Debug build with source maps |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Embedding

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

### Embed Options

| Option | Type | Default | Description |
|---|---|---|---|
| `container` | `string \| HTMLElement` | `'#opensemantic-editor'` | Container element or CSS selector |
| `yaml` | `string` | Minimal OSI skeleton | Initial YAML content |
| `schemaUrl` | `string` | OSI schema URL | JSON Schema URL for validation |
| `initialView` | `'form' \| 'yaml' \| 'diagram'` | `'form'` | Initial editor view |
| `onSave` | `(yaml: string) => void` | `null` | Save callback (bypasses file dialog) |
| `showPreview` | `boolean` | `true` | Show the preview panel |

### Instance API

```js
const editor = init({ /* config */ });

editor.getYaml();        // Get current YAML string
editor.setYaml(yaml);    // Load new YAML content
editor.isDirty();        // Check for unsaved changes
editor.setView('yaml');  // Switch view
editor.getMarkers();     // Get validation markers
editor.subscribe(fn);    // Subscribe to state changes
editor.destroy();        // Unmount and clean up
```

## Tech Stack

- [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) (state management)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) + [monaco-yaml](https://github.com/remcohaszing/monaco-yaml)
- [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) (diagram)
- [AJV](https://ajv.js.org/) (JSON Schema validation)
- [Headless UI](https://headlessui.com/) (accessible UI primitives)

## OSI Schema Structure

```
Root
├── version
├── semantic_model[]
│   ├── name, description, ai_context
│   ├── datasets[]
│   │   ├── name, source, primary_key, description, ai_context
│   │   └── fields[]
│   │       ├── name, label, description, ai_context
│   │       ├── expression[] (dialect + SQL)
│   │       └── dimension (is_time)
│   ├── relationships[]
│   │   ├── name, from, to
│   │   ├── from_columns[], to_columns[]
│   │   └── ai_context
│   ├── metrics[]
│   │   ├── name, description, ai_context
│   │   └── expression[] (dialect + SQL)
│   └── custom_extensions[]
│       ├── vendor_name
│       └── data (JSON string)
├── dialects[]
└── vendors[]
```

## License

MIT
