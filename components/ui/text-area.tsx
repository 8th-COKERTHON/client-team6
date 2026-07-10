import type { TextareaHTMLAttributes } from "react";

export type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  className?: string;
  errorMessage?: string;
  fieldClassName?: string;
  helperText?: string;
  label?: string;
  showCount?: boolean;
  textareaClassName?: string;
};

export function TextArea({
  className,
  defaultValue,
  errorMessage,
  fieldClassName,
  helperText,
  id,
  label,
  maxLength,
  name,
  showCount,
  textareaClassName,
  value,
  ...props
}: TextAreaProps) {
  const textareaId = id ?? name;
  const captionId = textareaId ? `${textareaId}-caption` : undefined;
  const hasCaption = Boolean(errorMessage || helperText);
  const currentLength = getTextAreaLength(value ?? defaultValue);

  return (
    <div className={["flex w-full flex-col gap-2", className].filter(Boolean).join(" ")}>
      {label ? (
        <label
          className="text-sm font-medium leading-[1.4] tracking-[-0.01em] text-white"
          htmlFor={textareaId}
        >
          {label}
        </label>
      ) : null}

      <div
        className={[
          "flex min-h-[52px] w-full items-start rounded-xl bg-[#292e38] px-4 py-[14px]",
          "border transition-colors",
          errorMessage
            ? "border-[#ff0002]"
            : "border-transparent focus-within:border-[#87919e]",
          fieldClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <textarea
          {...props}
          aria-describedby={hasCaption ? captionId : props["aria-describedby"]}
          aria-invalid={errorMessage ? true : props["aria-invalid"]}
          className={[
            "min-h-6 w-full resize-none bg-transparent text-base font-medium leading-[1.6]",
            "tracking-[-0.01em] text-white outline-none placeholder:text-[#b1b9c5]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            textareaClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          defaultValue={defaultValue}
          id={textareaId}
          maxLength={maxLength}
          name={name}
          value={value}
        />
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

function getTextAreaLength(value: TextAreaProps["value"]) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).length;
  }

  return 0;
}
