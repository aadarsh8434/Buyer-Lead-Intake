// components/ui/select.tsx
import * as React from "react";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/shadcn/select";
import { Label } from "@/components/ui/label";

type Option = { value: string; label: string };

type BaseShadProps = Omit<
  React.ComponentProps<typeof ShadSelect>,
  "onValueChange" | "value" | "defaultValue"
>;

export interface SelectProps extends BaseShadProps {
  label?: string;
  options?: Option[];
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  /** Synthetic onChange so existing code that expects e.target.value continues to work */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** direct value callback when you want it */
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const {
      label,
      options = [],
      error,
      placeholder,
      value,
      defaultValue,
      onChange,
      onValueChange,
      name,
      disabled,
      ...rest
    } = props;

    // controlled if `value` provided, otherwise start with defaultValue or empty
    const [internalValue, setInternalValue] = React.useState<string>(
      value ?? defaultValue ?? "..."
    );

    // keep internal in sync if parent controls `value`
    React.useEffect(() => {
      if (value !== undefined && value !== internalValue) {
        setInternalValue(value);
      }
    }, [value, internalValue]);

    const handleValueChange = (val: string) => {
      setInternalValue(val);
      onValueChange?.(val);

      if (onChange) {
        // create a minimal synthetic event compatible with handlers that read e.target.value
        const syntheticEvent = {
          target: { value: val },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        {label && <Label className="mb-1 block">{label}</Label>}

        <ShadSelect
          value={internalValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          {...(rest as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder ?? "Select an option"} />
          </SelectTrigger>

          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadSelect>

        {/* Hidden native select to satisfy react-hook-form register() (ref) & native expectations */}
        <select
          ref={ref}
          name={name}
          aria-hidden
          value={internalValue}
          onChange={(e) => {
            const val = e.target.value;
            setInternalValue(val);
            onValueChange?.(val);
            onChange?.(e);
          }}
          className="sr-only pointer-events-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
