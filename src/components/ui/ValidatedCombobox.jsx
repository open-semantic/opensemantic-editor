import { forwardRef } from 'react';
import Combobox from './Combobox.jsx';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const ValidatedCombobox = forwardRef(({
  label, value, onChange, options = [], required = false, tooltip,
  placeholder = "Select an option...", className = '', acceptAnyInput = true,
  disabled = false, ...props
}, ref) => {
  const hasInternalError = required && (!value || (typeof value === 'string' && value.trim() === ''));
  const errorMessages = [];
  if (hasInternalError) errorMessages.push('This field is required');
  const hasError = errorMessages.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="block text-xs font-medium leading-4 text-gray-900">{label}</label>
        {tooltip && <Tooltip content={tooltip}><QuestionMarkCircleIcon /></Tooltip>}
        {required && <span className="ml-auto text-xs leading-4 text-gray-500">Required</span>}
      </div>
      <Combobox
        ref={ref} options={options} value={value} onChange={onChange}
        placeholder={placeholder} acceptAnyInput={acceptAnyInput}
        disabled={disabled} hasError={hasError} className={className} {...props}
      />
      {hasError && errorMessages.map((message, idx) => (
        <p key={idx} className="mt-1 text-xs text-red-600">{message}</p>
      ))}
    </div>
  );
});

ValidatedCombobox.displayName = 'ValidatedCombobox';
export default ValidatedCombobox;
