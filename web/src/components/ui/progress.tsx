import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${
          className || ""
        }`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
