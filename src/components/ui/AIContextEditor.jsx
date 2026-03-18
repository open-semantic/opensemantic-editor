import ValidatedTextarea from './ValidatedTextarea.jsx';
import TagsInput from './TagsInput.jsx';

const AIContextEditor = ({ value = {}, onChange, label = "AI Context" }) => {
  const handleChange = (field, newValue) => {
    const updated = { ...value, [field]: newValue };
    if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
      delete updated[field];
    }
    onChange(Object.keys(updated).length > 0 ? updated : undefined);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-xs font-semibold text-gray-900">{label}</h4>
      </div>
      <div className="p-4 space-y-4">
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
    </div>
  );
};

export default AIContextEditor;
