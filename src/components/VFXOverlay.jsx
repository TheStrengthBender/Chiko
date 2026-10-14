import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { triggerHaptic } from '../utils/haptics';

// Onomatopoeia Word Pools per Tier
const TIER_1_WORDS = ['THWIP!', 'SNAP!', 'ZAP!'];
const TIER_2_WORDS = ['BAM!', 'BOOM!'];
const TIER_3_WORDS = ['CRUSH!', 'KAPOW!', 'SMASH!'];

const VFXContext = createContext(null);

export const useVFX = () => useContext(VFXContext);

// Factory helper to determine tier and onomatopoeia configuration
export const determineVFXTier = (exercise, displayRpe, displayWeight, userMax) => {
  const rpeNum = typeof displayRpe === 'number' 
    ? displayRpe 
    : parseFloat(String(displayRpe || '').replace(/[^\d.]/g, '')) || 7;

  // Tier 3: PRs, Grinders, RPE >= 9, or top heavy attempts (>= 90% of max)
  const isHeavyAttempt = userMax && displayWeight >= userMax * 0.90;
  if (rpeNum >= 9 || isHeavyAttempt || String(displayRpe).includes('cap') && rpeNum >= 8.5) {
    const text = TIER_3_WORDS[Math.floor(Math.random() * TIER_3_WORDS.length)];
    return { tier: 3, text, duration: 1100, screenShake: true };
  }

  // Tier 2: Working sets, moderate intensity (RPE 7.5 - 8.5)
  if (rpeNum >= 7.2) {
    const text = TIER_2_WORDS[Math.floor(Math.random() * TIER_2_WORDS.length)];
    return { tier: 2, text, duration: 820, screenShake: false };
  }

  // Tier 1: High velocity / speed work / warmup / RPE < 7
  const text = TIER_1_WORDS[Math.floor(Math.random() * TIER_1_WORDS.length)];
  return { tier: 1, text, duration: 700, screenShake: false };
};

// ==========================================
// SVG FACTORY COMPONENTS (Web implementations)
// ==========================================

// Tier 1: Cyan/Neon Blue & White, thin italic sharp typography (150ms linear spring)
const Tier1ThwipSVG = ({ text, x, y }) => (
  <div 
    className="vfx-item tier-1-thwip" 
    style={{ left: `${x}px`, top: `${y}px` }}
    aria-hidden="true"
  >
    <svg className="vfx-tier1-svg" viewBox="0 0 240 100" fill="none">
      {/* Dynamic Action Speed Lines */}
      <path d="M 10 50 L 50 48 M 20 62 L 60 58 M 15 36 L 55 40" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M 190 48 L 230 50 M 180 58 L 220 62 M 185 40 L 225 36" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      {/* Web Filament Streak */}
      <path d="M 40 85 Q 120 70 200 85" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.6" fill="none" />
      
      {/* Sharp Italic Typography */}
      <text 
        x="120" 
        y="62" 
        textAnchor="middle" 
        fill="#00F0FF" 
        stroke="#06121f" 
        strokeWidth="6" 
        paintOrder="stroke fill"
        className="vfx-text-tier1-shadow"
      >
        {text}
      </text>
      <text 
        x="120" 
        y="62" 
        textAnchor="middle" 
        fill="#FFFFFF" 
        className="vfx-text-tier1"
      >
        {text}
      </text>
    </svg>
  </div>
);

// Tier 2: Electric Yellow with heavy black halftone shadow (300ms, 12fps stutter)
const Tier2BamSVG = ({ text, x, y }) => (
  <div 
    className="vfx-item tier-2-bam" 
    style={{ left: `${x}px`, top: `${y}px` }}
    aria-hidden="true"
  >
    <svg className="vfx-tier2-svg" viewBox="0 0 260 140" fill="none">
      <defs>
        {/* Halftone Pattern Definition */}
        <pattern id="vfxHalftone" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.8" fill="#000000" />
        </pattern>
      </defs>

      {/* Halftone Shadow Layer */}
      <path 
        d="M 25 70 L 60 30 L 100 45 L 140 20 L 175 42 L 225 25 L 210 70 L 245 95 L 195 105 L 170 130 L 130 112 L 85 130 L 70 100 L 25 100 Z" 
        fill="url(#vfxHalftone)"
        transform="translate(6, 6)"
      />

      {/* Back Impact Starburst */}
      <path 
        d="M 25 70 L 60 30 L 100 45 L 140 20 L 175 42 L 225 25 L 210 70 L 245 95 L 195 105 L 170 130 L 130 112 L 85 130 L 70 100 L 25 100 Z" 
        fill="#FFE600" 
        stroke="#000000" 
        strokeWidth="3.5" 
        strokeLinejoin="miter"
      />

      {/* Blocky Arched Comic Typography */}
      <text 
        x="132" 
        y="84" 
        textAnchor="middle" 
        fill="#000000" 
        stroke="#000000" 
        strokeWidth="8"
        strokeLinejoin="round"
        className="vfx-text-tier2"
      >
        {text}
      </text>
      <text 
        x="130" 
        y="82" 
        textAnchor="middle" 
        fill="#FFFFFF" 
        stroke="#FFE600" 
        strokeWidth="2"
        className="vfx-text-tier2"
      >
        {text}
      </text>
    </svg>
  </div>
);

// Tier 3: Crimson Red core, yellow stroke, black jagged outer border, massive screen impact (600ms)
const Tier3KapowSVG = ({ text, x, y }) => (
  <div 
    className="vfx-item tier-3-kapow" 
    style={{ left: `${x}px`, top: `${y}px` }}
    aria-hidden="true"
  >
    <svg className="vfx-tier3-svg" viewBox="0 0 360 200" fill="none">
      {/* Outer Black Comic Inked Jagged Burst */}
      <path 
        d="M 30 100 L 65 40 L 110 65 L 150 15 L 190 60 L 250 20 L 285 70 L 345 55 L 320 110 L 355 155 L 295 160 L 270 195 L 210 165 L 160 195 L 125 155 L 75 185 L 60 135 L 15 130 Z" 
        fill="#000000"
        transform="translate(4, 5)"
      />

      {/* Primary Crimson Starburst Core */}
      <path 
        d="M 30 100 L 65 40 L 110 65 L 150 15 L 190 60 L 250 20 L 285 70 L 345 55 L 320 110 L 355 155 L 295 160 L 270 195 L 210 165 L 160 195 L 125 155 L 75 185 L 60 135 L 15 130 Z" 
        fill="#FF0044" 
        stroke="#FFE600" 
        strokeWidth="4" 
        strokeLinejoin="miter"
      />

      {/* Electric Lightning Filaments radiating outward */}
      <path d="M 65 40 L 40 10 L 55 25" stroke="#FFE600" strokeWidth="3" strokeLinecap="round" />
      <path d="M 285 70 L 325 35 L 305 50" stroke="#FFE600" strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 185 L 45 205 L 65 190" stroke="#FFE600" strokeWidth="3" strokeLinecap="round" />
      <path d="M 270 195 L 295 220 L 280 200" stroke="#FFE600" strokeWidth="3" strokeLinecap="round" />

      {/* Massive Jagged 3D Comic Typography */}
      <text 
        x="185" 
        y="120" 
        textAnchor="middle" 
        fill="#000000" 
        stroke="#000000" 
        strokeWidth="12"
        strokeLinejoin="round"
        className="vfx-text-tier3"
      >
        {text}
      </text>
      <text 
        x="182" 
        y="117" 
        textAnchor="middle" 
        fill="#FFE600" 
        stroke="#FF0044" 
        strokeWidth="3.5"
        className="vfx-text-tier3"
      >
        {text}
      </text>
      <text 
        x="180" 
        y="115" 
        textAnchor="middle" 
        fill="#FFFFFF" 
        className="vfx-text-tier3"
      >
        {text}
      </text>
    </svg>
  </div>
);

// ==========================================
// GLOBAL VFX OVERLAY HOST & PROVIDER
// ==========================================
export const VFXProvider = ({ children }) => {
  const [vfxList, setVfxList] = useState([]);
  const [isShaking, setIsShaking] = useState(false);

  // Trigger VFX item with auto-cleanup (Memory leak prevention & pool management)
  const spawnVFX = useCallback((tierConfig, coords) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const x = coords?.x ?? window.innerWidth / 2;
    const y = coords?.y ?? window.innerHeight / 2;

    const newItem = {
      id,
      tier: tierConfig.tier,
      text: tierConfig.text,
      x,
      y,
      duration: tierConfig.duration
    };

    // Pool limit: keep at most 5 active VFX elements to prevent memory / frame drops
    setVfxList(prev => [...prev.slice(-4), newItem]);

    // Handle Screen Shake on Tier 3 (PR / Grinder)
    if (tierConfig.screenShake) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 80);
    }

    // Auto-remove after animation completes
    setTimeout(() => {
      setVfxList(prev => prev.filter(item => item.id !== id));
    }, tierConfig.duration + 50);
  }, []);

  return (
    <VFXContext.Provider value={{ spawnVFX }}>
      <div className={isShaking ? 'screen-shaking' : ''} style={{ minHeight: '100%' }}>
        {children}
      </div>

      {/* Global decoupled portal rendering directly into document.body */}
      {typeof document !== 'undefined' && createPortal(
        <div className="vfx-portal-container" aria-hidden="true">
          {vfxList.map(item => {
            if (item.tier === 1) {
              return <Tier1ThwipSVG key={item.id} text={item.text} x={item.x} y={item.y} />;
            }
            if (item.tier === 2) {
              return <Tier2BamSVG key={item.id} text={item.text} x={item.x} y={item.y} />;
            }
            return <Tier3KapowSVG key={item.id} text={item.text} x={item.x} y={item.y} />;
          })}
        </div>,
        document.body
      )}
    </VFXContext.Provider>
  );
};
