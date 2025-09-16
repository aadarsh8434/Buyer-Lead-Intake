// components/ui/input.tsx
import * as React from "react";
import { Input as ShadInput } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/label";

interface InputProps extends React.ComponentProps<typeof ShadInput> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <Label className="mb-1 block">{label}</Label>}
      <ShadInput ref={ref} {...props} />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
