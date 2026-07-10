import type { InputHTMLAttributes } from "react";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
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
  const inputId = id ?? name;

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <input
        className={[
          "h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950",
          "outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        id={inputId}
        name={name}
        {...props}
      />
    </label>
  );
}
