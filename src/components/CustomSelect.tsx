"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  required?: boolean;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: SelectOption[];
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  required,
  name,
  value,
  onChange,
  options,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {label} {required && <span className="text-sama-orange">*</span>}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 rounded-xl border text-left text-sm bg-white transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
          isOpen
            ? "border-sama-orange ring-2 ring-sama-orange/30 shadow-sm"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="font-medium text-slate-800 truncate">
          {currentOption ? currentOption.label : "Sélectionner..."}
        </span>
        <div
          className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-sama-orange" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Styled Dropdown Menu (Guaranteed 100% width, NEVER overflows container or screen) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
          <ul role="listbox" className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 select-none ${
                    isSelected
                      ? "bg-orange-50/80 text-sama-orange font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-sama-orange shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Hidden native input for form compatibility */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
};
