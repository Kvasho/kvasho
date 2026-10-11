import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/** A translucent card that keeps text readable over the animated background. */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm backdrop-blur-md sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string[];
  hint?: string;
};

export function Field({ label, error, hint, className = "", ...input }: FieldProps) {
  const describedBy = error?.length ? `${input.name}-error` : undefined;

  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <input
        {...input}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={describedBy}
        className="mt-1.5 block w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground/30 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500"
      />
      {error?.length ? (
        <span id={describedBy} className="mt-1.5 block text-xs text-red-600 dark:text-red-400">
          {error[0]}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-foreground/50">{hint}</span>
      ) : null}
    </label>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  busy?: boolean;
};

const variants = {
  primary: "bg-accent text-accent-contrast hover:brightness-110",
  secondary: "border border-foreground/15 hover:border-foreground/40",
  danger: "border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400",
};

export function Button({
  variant = "primary",
  busy = false,
  disabled,
  className = "",
  children,
  ...button
}: ButtonProps) {
  return (
    <button
      {...button}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {busy && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${
        tone === "error"
          ? "bg-red-500/10 text-red-700 dark:text-red-300"
          : "bg-accent/10 text-accent"
      }`}
    >
      {children}
    </p>
  );
}
