import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  }
>;

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass = variant === "primary" ? "" : variant;
  return (
    <button className={`btn ${variantClass} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}
