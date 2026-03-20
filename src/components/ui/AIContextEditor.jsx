import { useState } from 'react';
import ValidatedTextarea from './ValidatedTextarea.jsx';
import TagsInput from './TagsInput.jsx';

const AIContextEditor = ({ value = {}, onChange, label = "AI Context", defaultOpen = false }) => {
  const hasContent = value?.instructions || value?.synonyms?.length > 0 || value?.examples?.length > 0;
  const [isOpen, setIsOpen] = useState(defaultOpen || hasContent);

  const handleChange = (field, newValue) => {
    const updated = { ...value, [field]: newValue };
    if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
      delete updated[field];
    }
    onChange(Object.keys(updated).length > 0 ? updated : undefined);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <h4 className="text-xs font-semibold text-gray-900">{label}</h4>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-200">
          <ValidatedTextarea
            name="ai-instructions"
            label="Instructions"
            value={value?.instructions || ''}
            onChange={(e) => handleChange('instructions', e.target.value || undefined)}
            placeholder="Provide instructions for AI about this element..."
            rows={2}
          />
          <TagsInput
            label="Synonyms"
            value={value?.synonyms || []}
            onChange={(val) => handleChange('synonyms', val)}
            placeholder="Add synonym..."
          />
          <TagsInput
            label="Examples"
            value={value?.examples || []}
            onChange={(val) => handleChange('examples', val)}
            placeholder="Add example..."
          />
        </div>
      )}
    </div>
  );
};

export default AIContextEditor;
