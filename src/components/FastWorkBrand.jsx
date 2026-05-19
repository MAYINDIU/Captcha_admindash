import React from "react";

const FastWorkBrand = ({ compact = false, light = false, className = "", labelClassName = "" }) => {
  const textColor = light ? "text-white" : "text-emerald-950 dark:text-white";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-11 w-11 shrink-0 rounded-lg bg-emerald-900 text-white shadow-sm dark:bg-emerald-100 dark:text-emerald-950">
        <div className="absolute left-2 top-2 h-7 w-7 rounded-md border-2 border-teal-300" />
        <div className="absolute right-1 top-4 h-2 w-7 rounded-full bg-amber-300" />
        <div className="absolute bottom-2 left-3 h-1.5 w-5 rounded-full bg-white/90 dark:bg-emerald-950/90" />
      </div>

      {!compact && (
        <div className={`min-w-0 ${labelClassName}`}>
          <div className={`text-lg font-black leading-none tracking-normal ${textColor}`}>
            FastWork<span className="text-amber-400">24</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastWorkBrand;
