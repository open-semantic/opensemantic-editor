import { useRef, useState } from 'react';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const TagsInput = ({ label = "Tags", value = [], onChange, placeholder = "Add a tag...", tooltip, className = '' }) => {
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef(null);

  const handleAdd = (tag) => {
    if (!tag || !tag.trim()) return;
    if (value.some(t => t.toLowerCase() === tag.trim().toLowerCase())) return;
    onChange([...value, tag.trim()]);
    setNewTag('');
  };

  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(newTag);
    }
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <label className="block text-xs font-medium leading-4 text-gray-900">{label}</label>
          {tooltip && <Tooltip content={tooltip}><QuestionMarkCircleIcon /></Tooltip>}
        </div>
      )}
      <div className="space-y-1">
        {value && value.length > 0 && (
          <div className="flex items-center flex-wrap">
            {value.map((tag, index) => (
              <span key={index} className="tag-element m-0.5 badge--gray">
                <svg className="size-1.5 fill-gray-500" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" /></svg>
                {tag}
                <button type="button" onClick={() => handleRemove(index)} className="ml-0.5 hover:text-red-600 transition-colors" aria-label={`Remove ${tag}`}>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth={1.5} d="M1 1l6 6m0-6L1 7" /></svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef} value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
          />
          <button type="button" onClick={() => handleAdd(newTag)} disabled={!newTag.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsInput;
