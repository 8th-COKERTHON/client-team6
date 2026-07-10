import type { InputHTMLAttributes, ReactNode } from "react";

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  className?: string;
  errorMessage?: string;
  helperText?: string;
  inputClassName?: string;
  label?: string;
  leadingIcon?: ReactNode;
  showCount?: boolean;
  trailingIcon?: ReactNode;
};

export function TextInput({
  className,
  defaultValue,
  errorMessage,
  helperText,
  id,
  inputClassName,
  label,
  leadingIcon,
  maxLength,
  name,
  showCount,
  trailingIcon,
  value,
  ...props
}: TextInputProps) {
  const inputId = id ?? name;
  const captionId = inputId ? `${inputId}-caption` : undefined;
  const hasCaption = Boolean(errorMessage || helperText);
  const currentLength = getInputLength(value ?? defaultValue);

  return (
    <div className={["flex w-full flex-col gap-2", className].filter(Boolean).join(" ")}>
      {label ? (
        <label
          className="text-sm font-medium leading-[1.4] tracking-[-0.01em] text-white"
          htmlFor={inputId}
        >
          {label}
        </label>
      ) : null}

      <div
        className={[
          "flex h-[52px] w-full items-center gap-2 rounded-xl bg-[#292e38] px-4",
          "border transition-colors",
          errorMessage
            ? "border-[#ff0002]"
            : "border-transparent focus-within:border-[#87919e]",
        ].join(" ")}
      >
        {leadingIcon ? (
          <span className="flex shrink-0 items-center text-[#b1b9c5]">
            {leadingIcon}
          </span>
        ) : null}
        <input
          {...props}
          aria-describedby={hasCaption ? captionId : props["aria-describedby"]}
          aria-invalid={errorMessage ? true : props["aria-invalid"]}
          className={[
            "min-w-0 flex-1 bg-transparent text-base font-medium leading-[1.4]",
            "tracking-[-0.01em] text-white outline-none placeholder:text-[#b1b9c5]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          defaultValue={defaultValue}
          id={inputId}
          maxLength={maxLength}
          name={name}
          value={value}
        />
        {trailingIcon ? (
          <span className="flex shrink-0 items-center text-[#b1b9c5]">
            {trailingIcon}
          </span>
        ) : null}
      </div>

      {showCount && maxLength ? (
        <div className="flex justify-end text-sm leading-[1.4] tracking-[-0.01em]">
          <span className="font-semibold text-[#b1b9c5]">{currentLength}</span>
          <span className="text-[#87919e]">/{maxLength}</span>
        </div>
      ) : null}

      {hasCaption ? (
        <p
          className={[
            "text-[13px] leading-[1.4] tracking-[-0.01em]",
            errorMessage ? "text-[#ff0002]" : "text-[#b1b9c5]",
          ].join(" ")}
          id={captionId}
        >
          {errorMessage || helperText}
        </p>
      ) : null}
    </div>
  );
}

function getInputLength(value: TextInputProps["value"]) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).length;
  }

  return 0;
}
