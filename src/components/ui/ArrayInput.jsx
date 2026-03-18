import { useState } from 'react';

const ArrayInput = ({ label, value = [], onChange, placeholder = "Add item..." }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onChange([...(value || []), newItem.trim()]);
    setNewItem('');
  };

  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">{label}</label>}
      <div className="space-y-1">
        {value && value.length > 0 && (
          <div className="flex items-center flex-wrap gap-1">
            {value.map((item, index) => (
              <span key={index} className="badge--gray">
                {item}
                <button type="button" onClick={() => handleRemove(index)} className="ml-1 hover:text-red-600">
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth={1.5} d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
          />
          <button type="button" onClick={handleAdd} disabled={!newItem.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-300 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArrayInput;
