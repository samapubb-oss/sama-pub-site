import React from "react";

interface SenegalFlagProps {
  className?: string;
  width?: number;
  height?: number;
}

export const SenegalFlag: React.FC<SenegalFlagProps> = ({
  className = "w-5 h-3.5",
  width,
  height,
}) => {
  return (
    <svg
      viewBox="0 0 36 24"
      width={width}
      height={height}
      className={`rounded-xs overflow-hidden shrink-0 shadow-xs border border-slate-200/50 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Drapeau du Sénégal"
    >
      {/* Bande Verte (Gauche) */}
      <rect x="0" y="0" width="12" height="24" fill="#00853F" />
      {/* Bande Jaune (Centre) */}
      <rect x="12" y="0" width="12" height="24" fill="#FDEF42" />
      {/* Bande Rouge (Droite) */}
      <rect x="24" y="0" width="12" height="24" fill="#E31B23" />
      {/* Étoile verte à 5 branches au centre */}
      <polygon
        points="18,7 19.35,11.15 23.71,11.15 20.18,13.72 21.53,17.87 18,15.3 14.47,17.87 15.82,13.72 12.29,11.15 16.65,11.15"
        fill="#00853F"
      />
    </svg>
  );
};
