import React from "react";
import Image from "next/image";

interface LogoProps {
  variant?: "dark" | "light"; // "dark" = for dark backgrounds (white text), "light" = for white/light backgrounds (navy text)
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  variant = "light",
  className = "",
  size = "md",
}) => {
  const isDarkBg = variant === "dark";

  const sizeConfig = {
    sm: { width: 34, height: 34, class: "w-8 h-8" },
    md: { width: 44, height: 44, class: "w-10 h-10 sm:w-11 sm:h-11" },
    lg: { width: 56, height: 56, class: "w-14 h-14" },
  };

  const current = sizeConfig[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official SAMA PUB Round Emblem Logo */}
      <div
        className={`relative ${current.class} shrink-0 rounded-full overflow-hidden shadow-sm bg-white border border-slate-100 flex items-center justify-center p-0.5`}
      >
        <Image
          src="/images/logo-sp.png"
          alt="SAMA PUB Logo Officiel"
          width={current.width}
          height={current.height}
          priority
          className="object-contain w-full h-full rounded-full"
        />
      </div>

      {/* Brand Text & Baseline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight text-xl md:text-2xl ${
              isDarkBg ? "text-white" : "text-sama-navy"
            }`}
          >
            SAMA
          </span>
          <span className="font-heading font-extrabold tracking-tight text-xl md:text-2xl text-sama-orange">
            PUB
          </span>
        </div>
        <span
          className={`font-sans tracking-wide text-[8.5px] sm:text-[9.5px] md:text-[10px] font-semibold uppercase mt-0.5 whitespace-nowrap ${
            isDarkBg ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Plus de visibilité • Plus de clients
        </span>
      </div>
    </div>
  );
};
