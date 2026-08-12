import { ChevronDown } from 'lucide-react';

interface SelectProps<T extends string> {
  id: string;
  value: T;
  options: { value: T; label: string; detail?: string }[];
  onChange: (value: T) => void;
  describedBy?: string;
}

function Select<T extends string>({ id, value, options, onChange, describedBy }: SelectProps<T>) {
  return (
    <div className="select">
      <select
        id={id}
        className="select-input"
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.detail ? `${option.label} — ${option.detail}` : option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} strokeWidth={2.2} className="select-chevron" aria-hidden="true" />
    </div>
  );
}

export default Select;
