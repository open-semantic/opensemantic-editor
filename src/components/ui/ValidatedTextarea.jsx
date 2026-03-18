import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from "./icons/QuestionMarkCircleIcon.jsx";

const ValidatedTextarea = ({
  name, label, value, onChange, required = false, tooltip, placeholder,
  rows = 3, className = '', ...props
}) => {
  const strValue = value || '';
  const trimmed = strValue.trim();
  const errorMessages = [];
  if (required && trimmed === '') errorMessages.push('This field is required');

  const hasError = errorMessages.length > 0;
  const ringClass = hasError ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600';

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label htmlFor={name} className="block text-xs font-medium leading-4 text-gray-900">{label}</label>
        {tooltip && <Tooltip content={tooltip}><QuestionMarkCircleIcon /></Tooltip>}
        {required && <span className="ml-auto text-xs leading-4 text-gray-500">Required</span>}
      </div>
      <textarea
        id={name} name={name} rows={rows} value={value} onChange={onChange}
        className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ${ringClass} placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4 ${className}`}
        placeholder={placeholder} aria-invalid={hasError} {...props}
      />
      {hasError && errorMessages.map((message, idx) => (
        <p key={idx} className="mt-1 text-xs text-red-600">{message}</p>
      ))}
    </div>
  );
};

ValidatedTextarea.displayName = 'ValidatedTextarea';
export default ValidatedTextarea;
