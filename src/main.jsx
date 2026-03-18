import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js'

const storageBackend = new LocalFileStorageBackend();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App storageBackend={storageBackend} />
  </StrictMode>
);
