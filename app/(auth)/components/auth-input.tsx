import { TextInput, type TextInputProps } from "@/components/ui/text-input";

type AuthInputProps = Omit<TextInputProps, "className" | "inputClassName" | "name"> & {
  className?: string;
  label: string;
  name: string;
};

export function AuthInput({
  label,
  name,
  id,
  className,
  ...props
}: AuthInputProps) {
  return (
    <TextInput
      id={id}
      inputClassName={className}
      label={label}
      name={name}
      placeholder={props.placeholder ?? label}
      {...props}
    />
  );
}
