import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ActionButtonBaseProps = {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
};

export type ActionButtonProps = ActionButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;

export type ActionButtonLinkProps = ActionButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children" | "className">;

export function ActionButton({
  children,
  className,
  disabled,
  isActive = true,
  type = "button",
  ...props
}: ActionButtonProps) {
  const isEnabled = isActive && !disabled;

  return (
    <button
      className={getActionButtonClassName(isEnabled, className)}
      disabled={!isEnabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionButtonLink({
  children,
  className,
  isActive = true,
  onClick,
  tabIndex,
  ...props
}: ActionButtonLinkProps) {
  return (
    <Link
      {...props}
      aria-disabled={isActive ? props["aria-disabled"] : true}
      className={getActionButtonClassName(isActive, className)}
      onClick={isActive ? onClick : undefined}
      tabIndex={isActive ? tabIndex : -1}
    >
      {children}
    </Link>
  );
}

function getActionButtonClassName(isActive: boolean, className?: string) {
  return [
    "flex h-[52px] w-full items-center justify-center rounded-[14px] px-2.5",
    "text-center text-lg font-semibold leading-[1.4] tracking-[-0.01em] text-white",
    "transition-colors",
    isActive
      ? "bg-[#ff0002] hover:bg-[#d90002]"
      : "pointer-events-none cursor-not-allowed bg-[#575e6a]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
