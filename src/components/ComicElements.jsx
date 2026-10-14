import React from 'react';

// Faint Spider Web for corners (cards & screen edges)
export const CornerWeb = ({ position = 'top-left', size = 50, opacity = 0.45, color = 'rgba(255, 255, 255, 0.4)' }) => {
  const isTL = position === 'top-left';
  const isTR = position === 'top-right';
  const isBL = position === 'bottom-left';
  const isBR = position === 'bottom-right';

  const transform = isTR 
    ? 'scaleX(-1)' 
    : isBL 
    ? 'scaleY(-1)' 
    : isBR 
    ? 'scale(-1, -1)' 
    : 'none';

  return (
    <svg 
      className={`comic-corner-web ${position}`}
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: isTL || isTR ? 0 : 'auto',
        bottom: isBL || isBR ? 0 : 'auto',
        left: isTL || isBL ? 0 : 'auto',
        right: isTR || isBR ? 0 : 'auto',
        pointerEvents: 'none',
        opacity,
        transform,
        zIndex: 1
      }}
      aria-hidden="true"
    >
      {/* Radiating Spokes from top-left */}
      <line x1="0" y1="0" x2="100" y2="0" stroke={color} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="100" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="100" y2="60" stroke={color} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="100" y2="100" stroke={color} strokeWidth="1.4" />
      <line x1="0" y1="0" x2="60" y2="100" stroke={color} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="28" y2="100" stroke={color} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="0" y2="100" stroke={color} strokeWidth="1.2" />

      {/* Catenary Curved Strands */}
      <path d="M 25 0 Q 24 12 0 25" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 50 0 Q 48 24 0 50" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 75 0 Q 72 36 0 75" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 100 0 Q 95 48 0 100" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M 100 35 Q 96 70 35 100" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 100 70 Q 95 90 70 100" stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
};

// Electric Lightning Aura around Venom Charge container
export const VenomLightningAura = () => (
  <div className="venom-lightning-aura" aria-hidden="true">
    <svg className="lightning-svg top-left" viewBox="0 0 60 40" fill="none">
      <path d="M 5 20 L 22 5 L 18 16 L 38 4 L 28 22 L 48 10 L 32 35" stroke="#FFE600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="miter" fill="none" />
    </svg>
    <svg className="lightning-svg top-right" viewBox="0 0 60 40" fill="none">
      <path d="M 55 18 L 38 4 L 42 16 L 22 3 L 30 22 L 10 12 L 25 35" stroke="#FFE600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="miter" fill="none" />
    </svg>
    <svg className="lightning-svg bottom-left" viewBox="0 0 60 40" fill="none">
      <path d="M 8 20 L 26 35 L 22 22 L 42 36 L 30 16 L 50 30" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter" fill="none" />
    </svg>
    <svg className="lightning-svg bottom-right" viewBox="0 0 60 40" fill="none">
      <path d="M 52 18 L 34 35 L 38 22 L 18 36 L 30 16 L 10 28" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter" fill="none" />
    </svg>
  </div>
);

// Cracked Screen / Spiderweb Detail on the right of the progress bar
export const CrackedWebDetail = () => (
  <svg className="cracked-web-detail" viewBox="0 0 50 20" fill="none" aria-hidden="true">
    <path d="M 50 0 L 32 10 L 20 8 M 32 10 L 36 20 M 32 10 L 15 16 M 20 8 L 10 3" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1" />
    <path d="M 45 4 Q 38 12 40 18" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.8" fill="none" />
    <path d="M 38 6 Q 30 14 34 19" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="0.8" fill="none" />
  </svg>
);

// Massive Comic-Book Action Starburst (KAPOW shape) for active/selected week (e.g. W8)
export const KapowStarburst = ({ weekNum = 8, phase = 'INTENSIFICATION', isJittering = false, onClick }) => (
  <div className={`kapow-starburst-container ${isJittering ? 'jittering' : ''}`} onClick={onClick}>
    {/* Electric lightning sparks around starburst */}
    <svg className="starburst-lightning-glow" viewBox="0 0 200 200" fill="none">
      <path d="M 30 50 L 10 30 L 25 45 L 5 40" stroke="#FFE600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 170 50 L 195 35 L 175 55 L 195 65" stroke="#FFE600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 25 150 L 5 170 L 25 155 L 15 185" stroke="#FFE600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 175 150 L 195 170 L 175 160 L 190 185" stroke="#FFE600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 100 10 L 105 25 L 115 5" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
      <path d="M 100 190 L 95 175 L 85 195" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
    </svg>

    {/* The Starburst Shape */}
    <div className="kapow-starburst-body">
      <div className="kapow-starburst-shadow" />
      <div className="kapow-starburst-main">
        <div className="kapow-text-week">W{weekNum}</div>
        <div className="kapow-text-phase">{phase}</div>
      </div>
    </div>
  </div>
);

// Tech Circuit Lines mixed with spiderwebbing for Screen 2 (Week View) top right
export const TechCircuitWeb = () => (
  <svg className="tech-circuit-web" viewBox="0 0 220 180" fill="none" aria-hidden="true">
    {/* Tech Circuit Traces */}
    <path d="M 80 0 L 80 40 L 130 40 L 130 90 L 200 90" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="200" cy="90" r="3" fill="#00F0FF" />
    
    <path d="M 120 0 L 120 25 L 170 25 L 170 65 L 220 65" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="170" cy="65" r="2.5" fill="#FF0044" />

    <path d="M 160 0 L 160 15 L 210 15" stroke="rgba(0, 240, 255, 0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <circle cx="210" cy="15" r="2" fill="#00F0FF" />

    <path d="M 50 15 L 70 15 L 90 35 L 90 75" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 3" fill="none" />
    <circle cx="90" cy="75" r="2" fill="#ffffff" />

    {/* Intertwined Spider Web Strands in top right corner */}
    <line x1="220" y1="0" x2="130" y2="0" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.2" />
    <line x1="220" y1="0" x2="140" y2="50" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" />
    <line x1="220" y1="0" x2="170" y2="100" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1.4" />
    <line x1="220" y1="0" x2="220" y2="110" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.2" />

    <path d="M 190 0 Q 185 20 220 30" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.2" fill="none" />
    <path d="M 160 0 Q 155 40 220 60" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" fill="none" />
    <path d="M 130 0 Q 135 70 220 95" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="1.2" fill="none" />
  </svg>
);

// Diagonal Split Action-Line Sunburst Banner for Screen 3 (Day View) Header
export const SplitSunburstBanner = () => (
  <div className="split-sunburst-banner" aria-hidden="true">
    <svg className="sunburst-svg" viewBox="0 0 600 120" preserveAspectRatio="none" fill="none">
      {/* Red Left Comic Sunburst */}
      <defs>
        <clipPath id="leftHalfClip">
          <polygon points="0,0 340,0 260,120 0,120" />
        </clipPath>
        <clipPath id="rightHalfClip">
          <polygon points="340,0 600,0 600,120 260,120" />
        </clipPath>
      </defs>

      {/* Left Red Sunburst */}
      <g clipPath="url(#leftHalfClip)">
        <rect width="600" height="120" fill="#140810" />
        {/* Radiating action lines from (-20, 60) */}
        <path d="M -20 60 L 400 -50 L 420 -50 Z" fill="rgba(255, 0, 68, 0.28)" />
        <path d="M -20 60 L 450 -10 L 470 -10 Z" fill="rgba(255, 0, 68, 0.32)" />
        <path d="M -20 60 L 500 30 L 520 30 Z" fill="rgba(255, 0, 68, 0.28)" />
        <path d="M -20 60 L 520 70 L 540 70 Z" fill="rgba(255, 0, 68, 0.32)" />
        <path d="M -20 60 L 500 110 L 520 110 Z" fill="rgba(255, 0, 68, 0.28)" />
        <path d="M -20 60 L 440 160 L 460 160 Z" fill="rgba(255, 0, 68, 0.32)" />
        <path d="M -20 60 L 380 190 L 400 190 Z" fill="rgba(255, 0, 68, 0.28)" />
      </g>

      {/* Right Cyan Sunburst */}
      <g clipPath="url(#rightHalfClip)">
        <rect width="600" height="120" fill="#06121a" />
        {/* Radiating action lines from (620, 60) */}
        <path d="M 620 60 L 200 -50 L 180 -50 Z" fill="rgba(0, 240, 255, 0.28)" />
        <path d="M 620 60 L 150 -10 L 130 -10 Z" fill="rgba(0, 240, 255, 0.32)" />
        <path d="M 620 60 L 100 30 L 80 30 Z" fill="rgba(0, 240, 255, 0.28)" />
        <path d="M 620 60 L 80 70 L 60 70 Z" fill="rgba(0, 240, 255, 0.32)" />
        <path d="M 620 60 L 100 110 L 80 110 Z" fill="rgba(0, 240, 255, 0.28)" />
        <path d="M 620 60 L 160 160 L 140 160 Z" fill="rgba(0, 240, 255, 0.32)" />
        <path d="M 620 60 L 220 190 L 200 190 Z" fill="rgba(0, 240, 255, 0.28)" />
      </g>

      {/* Diagonal Lightning / Glitch Divider */}
      <line x1="340" y1="0" x2="260" y2="120" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 4" opacity="0.7" />
    </svg>
  </div>
);

// Blank White Jagged Comic Speech Bubble for Day Cards
export const ComicSpeechBubble = ({ onClick }) => (
  <div className="comic-speech-bubble" onClick={onClick} title="Coach note" role="button" aria-label="Coach note">
    <svg viewBox="0 0 44 32" fill="none">
      {/* Speech bubble with tail pointing into card */}
      <path 
        d="M 6 4 C 6 2 8 1 12 1 L 34 1 C 39 1 42 3 42 6 L 42 22 C 42 25 39 27 34 27 L 16 27 L 6 31 L 8 25 L 8 22 C 6 20 6 18 6 16 Z" 
        fill="#FFFFFF" 
        stroke="#121212" 
        strokeWidth="1.8" 
      />
    </svg>
  </div>
);

// Red Curved Comic Action / Movement Lines flanking elements
export const ComicActionRipples = ({ active = false, bursting = false }) => (
  <svg className={`comic-action-ripples ${active ? 'active' : ''} ${bursting ? 'bursting' : ''}`} viewBox="0 0 54 36" fill="none" aria-hidden="true">
    {/* Left action curves */}
    <path d="M 12 6 C 6 12 6 24 12 30" stroke="#FF0044" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 6 10 C 2 14 2 22 6 26" stroke="#FF0044" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
    
    {/* Right action curves */}
    <path d="M 42 6 C 48 12 48 24 42 30" stroke="#FF0044" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 48 10 C 52 14 52 22 48 26" stroke="#FF0044" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
  </svg>
);
