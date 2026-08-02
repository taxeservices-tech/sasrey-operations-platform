import { ArrowRight } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  variant = "primary",
}: ButtonProps) {
  const styles = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-600 shadow-lg",

    secondary:
      "border-2 border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white",
  };

  return (
    <button
      className={`inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles[variant]}`}
    >
      {children}

      <ArrowRight size={20} />
    </button>
  );
}