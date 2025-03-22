import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
      ghost: "bg-transparent hover:bg-gray-50",
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 py-1 text-sm",
      lg: "h-12 px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
