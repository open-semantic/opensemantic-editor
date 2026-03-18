import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { useState } from 'react'

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
)

const ComboboxComponent = ({
  label, options = [], value, onChange, placeholder = "Select an option...",
  displayValue = (item) => item?.name || item?.label || item || '',
  filterKey = 'name', acceptAnyInput = true, className = '', disabled = false,
  hasError = false, ...props
}) => {
  const [query, setQuery] = useState('')

  const filteredOptions = query === ''
    ? options
    : options.filter((option) => {
        const searchValue = option[filterKey] || option.name || option.label || ''
        return searchValue.toLowerCase().includes(query.toLowerCase())
      })

  const handleChange = (selectedOption) => {
    setQuery('')
    if (selectedOption && typeof selectedOption === 'object') {
      onChange(selectedOption.id ?? selectedOption.value ?? selectedOption.name ?? selectedOption)
    } else {
      onChange(selectedOption)
    }
  }

  const handleInputChange = (event) => {
    const inputValue = event.target.value
    setQuery(inputValue)
    if (acceptAnyInput) onChange(inputValue)
  }

  return (
    <Combobox as="div" value={value} onChange={handleChange} disabled={disabled} className={className} {...props}>
      {label && <Label className="block text-xs font-medium leading-4 text-gray-900">{label}</Label>}
      <div className="relative mt-1">
        <ComboboxInput
          className={`block w-full rounded-md border-0 py-1.5 pl-2 pr-8 text-gray-900 bg-white shadow-sm ring-1 ring-inset ${hasError ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4`}
          onChange={handleInputChange}
          onBlur={() => setQuery('')}
          displayValue={acceptAnyInput ? (item) => item || '' : displayValue}
          placeholder={placeholder}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
          <ChevronDownIcon className="size-4 text-gray-400" />
        </ComboboxButton>
        <ComboboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-xs leading-4"
        >
          {acceptAnyInput && query.length > 0 && (
            <ComboboxOption value={query} className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white">
              <span className="block truncate">"{query}"</span>
            </ComboboxOption>
          )}
          {filteredOptions.length > 0 && filteredOptions.map((option, index) => (
            <ComboboxOption
              key={option.id || option.value || index}
              value={acceptAnyInput ? (option[filterKey] || option.name || option.label || option) : option}
              className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
            >
              <span className="block truncate">{displayValue(option)}</span>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  )
}

export default ComboboxComponent
