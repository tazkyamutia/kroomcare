import React from 'react';

export const AuthIllustration: React.FC = () => {
  return (
    <div className="relative flex flex-col justify-end items-center h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900/60 dark:to-[#0b0f19] overflow-hidden select-none">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Architectural Modern Cityscape Vector Illustration */}
      <div className="relative w-full max-w-[440px] flex items-end justify-center pointer-events-none mt-auto">
        <svg
          viewBox="0 0 520 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto max-h-[320px] object-contain opacity-95 dark:opacity-85 transition-opacity drop-shadow-sm"
        >
          <g stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Background Building (Far Left) */}
            <path d="M10 360 L10 260 L80 200 L80 360" fill="#dbeafe" />
            <line x1="25" y1="260" x2="65" y2="225" />
            <line x1="25" y1="285" x2="65" y2="250" />
            <line x1="25" y1="310" x2="65" y2="275" />
            <line x1="25" y1="335" x2="65" y2="300" />

            {/* Mid-Left Angled Tower */}
            <path d="M70 360 L70 170 L140 110 L140 360" fill="#ffffff" />
            {/* Front side perspective */}
            <path d="M140 110 L180 150 L180 360 L140 360 Z" fill="#eff6ff" />
            {/* Slanted lines on face */}
            <line x1="85" y1="180" x2="125" y2="145" />
            <line x1="85" y1="210" x2="125" y2="175" />
            <line x1="85" y1="240" x2="125" y2="205" />
            <line x1="85" y1="270" x2="125" y2="235" />
            <line x1="85" y1="300" x2="125" y2="265" />
            <line x1="85" y1="330" x2="125" y2="295" />

            {/* Middle Tower (Tall Line Building) */}
            <path d="M175 360 L175 190 L245 190 L245 360" fill="#ffffff" />
            <path d="M245 190 L285 220 L285 360 L245 360 Z" fill="#f1f5f9" />
            {/* Windows in dashed columns */}
            <line x1="195" y1="215" x2="195" y2="235" strokeDasharray="3 3" />
            <line x1="210" y1="215" x2="210" y2="235" strokeDasharray="3 3" />
            <line x1="225" y1="215" x2="225" y2="235" strokeDasharray="3 3" />
            <line x1="195" y1="250" x2="195" y2="275" strokeDasharray="3 3" />
            <line x1="210" y1="250" x2="210" y2="275" strokeDasharray="3 3" />
            <line x1="225" y1="250" x2="225" y2="275" strokeDasharray="3 3" />
            <line x1="195" y1="290" x2="195" y2="315" strokeDasharray="3 3" />
            <line x1="210" y1="290" x2="210" y2="315" strokeDasharray="3 3" />
            <line x1="225" y1="290" x2="225" y2="315" strokeDasharray="3 3" />

            {/* Accent Building - Soft Indigo/Lavender */}
            <path d="M280 360 L280 270 L345 270 L345 360" fill="#e0e7ff" />
            <line x1="295" y1="285" x2="295" y2="345" strokeDasharray="4 4" />
            <line x1="312" y1="285" x2="312" y2="345" strokeDasharray="4 4" />
            <line x1="330" y1="285" x2="330" y2="345" strokeDasharray="4 4" />

            {/* Tallest Skyscraper (Right Side) */}
            <path d="M340 360 L340 60 L395 15 L435 60 L435 360 Z" fill="#ffffff" />
            {/* Angled Roof Facet */}
            <path d="M340 60 L395 15 L435 60 Z" fill="#e2e8f0" />
            {/* Perspective Side Face */}
            <path d="M435 60 L480 100 L480 360 L435 360 Z" fill="#cffafe" />
            
            {/* Windows on Tall Skyscraper */}
            <g strokeWidth="2.4">
              <line x1="360" y1="85" x2="360" y2="105" />
              <line x1="380" y1="85" x2="380" y2="105" />
              <line x1="400" y1="85" x2="400" y2="105" />

              <line x1="360" y1="120" x2="360" y2="140" />
              <line x1="380" y1="120" x2="380" y2="140" />
              <line x1="400" y1="120" x2="400" y2="140" />

              <line x1="360" y1="155" x2="360" y2="175" />
              <line x1="380" y1="155" x2="380" y2="175" />
              <line x1="400" y1="155" x2="400" y2="175" />

              <line x1="360" y1="190" x2="360" y2="210" />
              <line x1="380" y1="190" x2="380" y2="210" />
              <line x1="400" y1="190" x2="400" y2="210" />

              <line x1="360" y1="225" x2="360" y2="245" />
              <line x1="380" y1="225" x2="380" y2="245" />
              <line x1="400" y1="225" x2="400" y2="245" />

              <line x1="360" y1="260" x2="360" y2="280" />
              <line x1="380" y1="260" x2="380" y2="280" />
              <line x1="400" y1="260" x2="400" y2="280" />
            </g>

            {/* Far Right Tower */}
            <path d="M475 360 L475 180 L520 220 L520 360 Z" fill="#f8fafc" />
            <line x1="495" y1="240" x2="495" y2="330" strokeDasharray="4 4" />

            {/* Modernist Trees at Base */}
            {/* Left Tree */}
            <circle cx="230" cy="325" r="22" fill="#ffffff" />
            <path d="M230 347 L230 360" />
            <path d="M225 325 Q230 315 235 325" />
            <line x1="230" y1="320" x2="230" y2="335" />

            {/* Small Left Tree */}
            <circle cx="205" cy="342" r="14" fill="#eff6ff" />
            <path d="M205 356 L205 360" />

            {/* Right Trees */}
            <circle cx="435" cy="318" r="26" fill="#ffffff" />
            <path d="M435 344 L435 360" />
            <line x1="435" y1="310" x2="435" y2="335" />
            <path d="M428 322 Q435 315 442 322" />

            <circle cx="475" cy="335" r="18" fill="#e0f2fe" />
            <path d="M475 353 L475 360" />
          </g>
        </svg>
      </div>
    </div>
  );
};
