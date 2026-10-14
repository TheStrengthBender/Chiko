import { useState, useEffect } from 'react';
import { programData } from './data/program';
import { dayExplanations } from './data/explanations';
import { Settings, Calendar, CheckCircle2, ChevronLeft, Target, FileText, Info, SlidersHorizontal, X, TrendingUp, Calculator } from 'lucide-react';
import { 
  CornerWeb, 
  VenomLightningAura, 
  CrackedWebDetail, 
  KapowStarburst, 
  TechCircuitWeb, 
  SplitSunburstBanner, 
  ComicActionRipples 
} from './components/ComicElements';
import { VFXProvider, useVFX, determineVFXTier } from './components/VFXOverlay';
import { triggerHaptic } from './utils/haptics';
import './App.css';

const MAXES_KEY = 'fourLift_maxes';
const PROGRESS_KEY = 'fourLift_progress';
const APP_VERSION_KEY = 'fourLift_version';
const CURRENT_VERSION = 'strengthbender_system_v1';

// Round to nearest 5 lb, matching Excel MROUND(x, 5). The epsilon guards against
// floating-point results like 162.49999999 that Excel would treat as 162.5.
const round5 = (x) => Math.round(x / 5 + 1e-9) * 5;
// Organic randomized corner distribution for spiderwebs on week cards
const WEEK_CORNER_POSITIONS = [
  'top-left',    // W1
  'top-right',   // W2
  'top-right',   // W3
  'top-right',   // W4
  'bottom-left', // W5
  'top-right',   // W6
  'top-left',    // W7
  'bottom-right',// W8
  'top-right',   // W9
  'top-left',    // W10
  'bottom-left', // W11
  'top-right',   // W12
  'top-left',    // W13
];

function AppContent() {
  const { spawnVFX } = useVFX() || {};
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [featuredWeek] = useState(13); // Showcase active week KAPOW starburst
  const [tappingWeek, setTappingWeek] = useState(null); // Week jitter on tap
  const [flaringDay, setFlaringDay] = useState(null); // Day border flashbulb flare
  const [justCompletedEx, setJustCompletedEx] = useState(null); // Exercise check burst
  
  const [maxes, setMaxes] = useState(() => {
    const saved = localStorage.getItem(MAXES_KEY);
    return saved ? JSON.parse(saved) : { squat: 325, bench: 225, deadlift: 405 };
  });

  const [progress, setProgress] = useState(() => {
    if (localStorage.getItem(APP_VERSION_KEY) !== CURRENT_VERSION) {
      localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem('fourLift_notes');
      localStorage.removeItem('fourLift_adjustments');
      return {};
    }
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [sessionNotes, setSessionNotes] = useState(() => {
    if (localStorage.getItem(APP_VERSION_KEY) !== CURRENT_VERSION) {
      return {};
    }
    const saved = localStorage.getItem('fourLift_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [adjustments, setAdjustments] = useState(() => {
    if (localStorage.getItem(APP_VERSION_KEY) !== CURRENT_VERSION) {
      return {};
    }
    const saved = localStorage.getItem('fourLift_adjustments');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeProjLift, setActiveProjLift] = useState('squat');

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [calcOpenEx, setCalcOpenEx] = useState(null);

  useEffect(() => {
    localStorage.setItem(MAXES_KEY, JSON.stringify(maxes));
  }, [maxes]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('fourLift_notes', JSON.stringify(sessionNotes));
  }, [sessionNotes]);

  useEffect(() => {
    localStorage.setItem('fourLift_adjustments', JSON.stringify(adjustments));
  }, [adjustments]);

  const handleMaxChange = (e) => {
    const { name, value } = e.target;
    const num = value === '' ? '' : Number(value);
    setMaxes(prev => ({ ...prev, [name]: num }));
  };

  const handleResetProgress = () => {
    if (window.confirm("Reset all workout progress back to 0%? This will clear all checked exercises, adjustments, and session notes.")) {
      setProgress({});
      setSessionNotes({});
      setAdjustments({});
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem('fourLift_notes');
      localStorage.removeItem('fourLift_adjustments');
    }
  };

  const getIntensityTag = (ex) => {
    if (ex.intensity) {
      return ex.intensity.replace(/\s*TM/g, '').replace(/\s*est\.\s*1RM/g, '').replace(/\s*1RM/g, '');
    }
    if (!ex.percent) return null;
    return `${Math.round(ex.percent * 100)}%`;
  };

  const getCalcBreakdown = (ex) => {
    if (!ex.percent || !ex.lift) return null;
    const pct = Math.round(ex.percent * 100);
    const maxVal = maxes[ex.lift] || 0;
    const plus = ex.plus || 0;
    const plusStr = plus ? ` + ${plus} lb` : '';
    return `(${pct}% of ${maxVal} lb max${plusStr})`;
  };

  const toggleExercise = (week, day, exerciseIdx, event) => {
    const key = `${week}-${day}-${exerciseIdx}`;
    const willComplete = !progress[key];

    if (willComplete) {
      setJustCompletedEx(key);
      setTimeout(() => setJustCompletedEx(null), 950);

      // Dynamic Onomatopoeia & Impact VFX Matrix
      const weekData = programData.find(w => w.week === week);
      const dayData = weekData?.days.find(d => d.day === day);
      const ex = dayData?.exercises[exerciseIdx];
      const defaultWeight = ex ? calculateWeight(ex) : 0;
      const displayWeight = adjustments[key]?.weight ?? defaultWeight;
      const displayRpe = adjustments[key]?.rpe ?? ex?.rpe;
      const userMax = ex?.lift ? maxes[ex.lift] : null;

      const vfxConfig = determineVFXTier(ex, displayRpe, displayWeight, userMax);

      // Paired tactile haptic feedback per intensity tier
      if (vfxConfig.tier === 3) {
        triggerHaptic('burst');
      } else if (vfxConfig.tier === 2) {
        triggerHaptic('thud');
      } else {
        triggerHaptic('tick');
      }

      // Anchor point: exactly at the user's touch coordinate
      if (spawnVFX) {
        let coords = null;
        if (event?.clientX && event?.clientY) {
          coords = { x: event.clientX, y: event.clientY };
        } else if (event?.target) {
          const rect = event.target.getBoundingClientRect();
          coords = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        spawnVFX(vfxConfig, coords);
      }
    } else {
      triggerHaptic('tick');
    }

    setProgress(prev => ({
      ...prev,
      [key]: willComplete
    }));
  };

  const completeSession = (week, dayData) => {
    triggerHaptic('burst');
    if (spawnVFX) {
      // Center in viewport for maximum dramatic comic impact and perfect on-screen framing
      const coords = { x: window.innerWidth / 2, y: window.innerHeight * 0.42 };
      spawnVFX({ 
        tier: 3, 
        text: 'SESSION CRUSHED!', 
        isSession: true,
        duration: 2100, 
        screenShake: true 
      }, coords);
    }
    const newProgress = { ...progress };
    dayData.exercises.forEach((ex, idx) => {
      newProgress[`${week}-${dayData.day}-${idx}`] = true;
    });
    setProgress(newProgress);

    // Give user time to enjoy the full 2.1-second celebration before navigating back
    setTimeout(() => {
      setSelectedDay(null);
      setSelectedWeek(null);
    }, 1900);
  };

  const handleSelectWeek = (w) => {
    triggerHaptic('thud');
    setTappingWeek(w.week);
    setTimeout(() => {
      setSelectedWeek(w);
      setTappingWeek(null);
    }, 150);
  };

  const handleSelectDay = (week, day) => {
    triggerHaptic('tick');
    setFlaringDay(day.day);
    setTimeout(() => {
      setSelectedDay({ week, dayData: day });
      setIsNotesOpen(false);
      setIsInfoOpen(false);
      setFlaringDay(null);
    }, 110);
  };

  const isWeekCompleted = (weekData) => {
    let totalExercises = 0;
    let completedExercises = 0;
    
    weekData.days.forEach(day => {
      if (day.exercises && day.exercises.length > 0) {
        day.exercises.forEach((ex, idx) => {
          totalExercises++;
          const key = `${weekData.week}-${day.day}-${idx}`;
          if (progress[key]) {
            completedExercises++;
          }
        });
      }
    });
    
    if (totalExercises === 0) return false;
    return totalExercises === completedExercises;
  };

  const renderSettings = () => (
    <div className="animate-fade">
      <h2 className="text-gradient" style={{marginBottom: '24px'}}>Your Maxes &amp; Rules</h2>
      
      {/* Informational Callout */}
      <div className="glass-panel" style={{marginBottom: '24px', background: 'rgba(255, 0, 68, 0.06)', borderColor: 'rgba(255, 0, 68, 0.35)'}}>
        <h3 style={{fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '8px', fontStyle: 'italic'}}>Actual Maxes Based Programming</h3>
        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0}}>
          All working weights and percentages are calculated directly from your actual entered maxes below (rounded to the nearest 5 lb).
        </p>
      </div>

      {/* Program 2.0 Rules */}
      <div className="glass-panel" style={{marginBottom: '24px', background: 'rgba(0, 240, 255, 0.05)', borderColor: 'rgba(0, 240, 255, 0.3)'}}>
        <h3 style={{fontSize: '1.1rem', color: 'var(--spider-sense)', marginBottom: '12px', fontStyle: 'italic'}}>Program 2.0 Rules</h3>
        <ul style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '20px', marginBottom: 0, lineHeight: 1.6}}>
          <li style={{marginBottom: '8px'}}><strong>Squat top single:</strong> 85–87% of max in Weeks 1–4, 90–92% in Weeks 6–9, with back-off sets after.</li>
          <li style={{marginBottom: '8px'}}><strong>1.5-rep deadlift (knee height):</strong> Starts at 60% of deadlift max and adds 5 lb/week only when clean and ≤RPE 7. Deloads: 2x3 @ 55% of max.</li>
          <li style={{marginBottom: '8px'}}><strong>Secondary squat:</strong> Weeks 1–6 paused squat starts at 70% of max and adds 5 lb/week; Week 5 deload is 55%; Week 6 resumes at base +20 lb. Weeks 7–12 high-bar squat starts at 75% of max and adds 5 lb/week; Week 10 deload is 60%; Week 11 resumes at base +15 lb. Week 12 is an easy 60% taper.</li>
          <li style={{marginBottom: '8px'}}><strong>Bent-over row:</strong> 4 strict sets of 4–6. Add 5 lb next exposure only when every set is clean and ≤RPE 8. No failure.</li>
          <li><strong>Week 13 PR attempts:</strong> Opener ~90% of max; take subsequent attempts only if clean.</li>
        </ul>
      </div>

      {/* Autoregulation Rule */}
      <div className="glass-panel" style={{marginBottom: '24px', background: 'rgba(255, 0, 68, 0.05)', borderColor: 'rgba(255, 0, 68, 0.25)'}}>
        <h3 style={{fontSize: '1.1rem', color: '#ff4d6d', marginBottom: '12px', fontStyle: 'italic'}}>Autoregulation Rule</h3>
        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 0, lineHeight: 1.6}}>
          If the first working set of any top set comes up more than ~1 RPE point harder than prescribed, or bar speed clearly slows, <strong>drop the load ~5%</strong> and keep the prescribed sets/reps. Never grind a top set to hit a percentage.
        </p>
      </div>

      <h3 style={{fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-primary)'}}>Enter Your Actual Maxes</h3>
      
      <div className="lift-inputs-container" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {[
          { key: 'squat', title: 'Squat Max', placeholder: '325' },
          { key: 'bench', title: 'Bench Press Max', placeholder: '225' },
          { key: 'deadlift', title: 'Deadlift Max', placeholder: '405' }
        ].map(lift => (
          <div key={lift.key} className="glass-panel" style={{padding: '20px', borderLeft: '4px solid var(--accent)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <h4 style={{fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)'}}>{lift.title}</h4>
            </div>
            
            <div style={{maxWidth: '320px'}}>
              <label className="input-label" style={{display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', marginBottom: '8px'}}>
                <Target size={16} /> Enter Max (lbs)
              </label>
              <input 
                type="number" 
                step="5"
                name={lift.key}
                className="input-field" 
                style={{borderColor: 'rgba(255, 0, 68, 0.35)', fontWeight: 800, fontSize: '1.4rem', color: '#fff'}}
                value={maxes[lift.key] ?? ''} 
                onChange={handleMaxChange} 
                placeholder={lift.placeholder}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reset Progress Section */}
      <div className="glass-panel" style={{marginTop: '32px', borderColor: 'rgba(255, 0, 68, 0.35)', background: 'rgba(255, 0, 68, 0.05)'}}>
        <h4 style={{fontSize: '1.1rem', color: '#ff4d6d', marginBottom: '8px', fontWeight: 800}}>Reset Program Progress</h4>
        <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5}}>
          Clear all completed checkmarks, recorded set adjustments, and session notes back to a clean 0% state. Your entered maxes will remain intact.
        </p>
        <button 
          onClick={handleResetProgress}
          style={{
            background: 'rgba(255, 0, 68, 0.15)',
            border: '1px solid var(--accent)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 0, 68, 0.15)'}
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (selectedDay) return renderDay(selectedDay);
    if (selectedWeek) return renderWeek(selectedWeek);

    let totalEx = 0;
    let compEx = 0;
    programData.forEach(w => {
      w.days.forEach(d => {
        if (d.exercises) {
          d.exercises.forEach((ex, idx) => {
            totalEx++;
            if (progress[`${w.week}-${d.day}-${idx}`]) compEx++;
          });
        }
      });
    });
    const progressPercent = totalEx > 0 ? Math.round((compEx / totalEx) * 100) : 0;

    return (
      <div className="animate-fade">
        {/* Venom Charge Progress Bar with Electric Lightning Aura */}
        <div className="venom-charge-box">
          <VenomLightningAura />
          <div className="venom-charge-header">
            <span className="venom-charge-title">VENOM CHARGE</span>
            <span className="venom-charge-percent">
              {progressPercent === 100 ? 'MAX VENOM BLAST!' : `${progressPercent}%`}
            </span>
          </div>
          <div className="venom-track-wrapper">
            <div className="venom-track-fill" style={{ width: `${progressPercent}%` }} />
            <CrackedWebDetail />
          </div>
        </div>

        <h2 className="text-gradient" style={{marginTop: '1.75rem', marginBottom: '0.25rem', fontSize: '1.35rem'}}>
          PROGRAM OVERVIEW
        </h2>
        <p className="text-secondary" style={{marginBottom: '1.25rem', fontSize: '0.9rem', color: '#a0a0a0'}}>
          Select a week to view and track your training.
        </p>

        {/* Grid with W13 Action Starburst & Corner Webs */}
        <div className="week-grid">
          {programData.map((w, idx) => {
            const completed = isWeekCompleted(w);
            const isFeatured = w.week === featuredWeek || w.week === tappingWeek;

            if (isFeatured) {
              return (
                <KapowStarburst 
                  key={idx}
                  weekNum={w.week}
                  phase={w.phase}
                  isJittering={w.week === tappingWeek}
                  onClick={() => handleSelectWeek(w)}
                />
              );
            }

            const webPos = WEEK_CORNER_POSITIONS[w.week - 1] || 'top-left';

            return (
              <div 
                key={idx} 
                className={`comic-week-card ${completed ? 'completed' : ''}`} 
                onClick={() => handleSelectWeek(w)}
              >
                <CornerWeb position={webPos} size={46} opacity={0.42} color="rgba(255, 255, 255, 0.45)" />
                <div className="comic-week-num">W{w.week}</div>
                <div className="comic-week-phase">{w.phase}</div>
                {completed && (
                  <div style={{position: 'absolute', top: 6, right: 6, color: '#ffe600'}}>
                    <CheckCircle2 size={15} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeek = (weekData) => (
    <div className="comic-panel-transition" style={{position: 'relative'}}>
      {/* Top right Tech Circuit Lines & Webbing */}
      <TechCircuitWeb />
      <CornerWeb position="bottom-left" size={90} opacity={0.35} />

      <div className="days-header">
        <button className="comic-back-btn" onClick={() => { triggerHaptic('tick'); setSelectedWeek(null); }} aria-label="Back to overview">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 style={{marginBottom: 0, fontSize: '2rem', fontStyle: 'italic', fontWeight: 900}}>Week {weekData.week}</h2>
          <span style={{fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', color: '#a0a0a0', textTransform: 'uppercase'}}>
            {weekData.phase}
          </span>
        </div>
      </div>
      
      <div className="day-list">
        {weekData.days.map((day, idx) => {
          let dayFocus = day.notes || "";
          if (!dayFocus && day.exercises && day.exercises.length > 0) {
             const mains = day.exercises.filter(e => e.isMain).map(e => e.name);
             dayFocus = mains.join(" / ");
          }

          // Top cards use crimson red neon glow (Day 1), while lower cards transition into cyan/blue neon glow
          const glowClass = idx === 0 ? 'glow-red' : 'glow-cyan';
          const isFlaring = flaringDay === day.day;
          const flareClass = isFlaring ? (idx === 0 ? 'flaring-red' : 'flaring-cyan') : '';
          return (
            <div 
              key={idx} 
              className={`comic-day-card ${glowClass} ${flareClass}`} 
              onClick={() => handleSelectDay(weekData.week, day)}
            >
              <CornerWeb position="top-right" size={120} opacity={0.22} color="rgba(255, 255, 255, 0.4)" />
              <div style={{position: 'relative', zIndex: 2}}>
                <div className="comic-day-title">Day {day.day}</div>
                <div className="comic-day-subtext">{dayFocus}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // All exercise weights calculate directly from the user's entered maxes
  const calculateWeight = (exercise) => {
    if (!exercise.percent) return null;
    const liftRef = exercise.lift;
    if (!liftRef || !maxes[liftRef]) return null;

    const baseMax = maxes[liftRef];
    const plus = exercise.plus || 0;
    return round5(baseMax * exercise.percent) + plus;
  };

  // Averages the numbers in an RPE prescription: 7 -> 7, "7-8" -> 7.5, "≤8" -> 8, "8 cap" -> 8
  const parseDefaultRPE = (rpeVal) => {
    if (!rpeVal) return 7;
    if (typeof rpeVal === 'number') return rpeVal;
    const nums = String(rpeVal).match(/\d+(\.\d+)?/g);
    if (!nums) return 7;
    return nums.reduce((sum, n) => sum + Number(n), 0) / nums.length;
  };

  const handleAdjustmentChange = (exKey, field, value) => {
    setAdjustments(prev => ({
      ...prev,
      [exKey]: {
        ...(prev[exKey] || {}),
        [field]: Number(value)
      }
    }));
  };

  const calculatePlates = (targetWeight) => {
    let remaining = targetWeight - 45;
    if (remaining < 0) remaining = 0;
    
    const perSide = remaining / 2;
    const availablePlates = [45, 35, 25, 10, 5, 2.5];
    const platesToLoad = [];
    
    let currentLoad = perSide;
    for (let plate of availablePlates) {
      const count = Math.floor(currentLoad / plate);
      if (count > 0) {
        platesToLoad.push({ weight: plate, count });
        currentLoad -= (count * plate);
      }
      currentLoad = Math.round(currentLoad * 100) / 100; // prevent float issues
    }
    
    return platesToLoad;
  };

  const generateWarmups = (targetWeight, liftType) => {
    if (targetWeight <= 45) return [];
    
    const warmups = [{ weight: 45, reps: 10 }];
    const minFirstJump = liftType === 'bench' ? 95 : 135;
    
    if (targetWeight <= minFirstJump) {
      if (targetWeight > 45) {
        warmups.push({ weight: Math.max(45, Math.round(targetWeight * 0.7 / 5) * 5), reps: 5 });
      }
      return warmups;
    }

    const getFriendlyWeight = (rawWeight) => {
       const common = liftType === 'bench' 
         ? [95, 115, 135, 155, 185, 205, 225, 245, 275, 295, 315, 335, 365, 385, 405]
         : [135, 185, 225, 275, 315, 365, 405, 455, 495, 545, 585];
         
       let closest = Math.round(rawWeight / 10) * 10;
       let minDiff = 15; 
       for (let w of common) {
         if (w >= targetWeight) break;
         const diff = Math.abs(rawWeight - w);
         if (diff < minDiff) {
           minDiff = diff;
           closest = w;
         }
       }
       return closest;
    };

    let steps = [0.5, 0.75]; 
    if (targetWeight >= 315) steps = [0.4, 0.6, 0.8]; 
    if (targetWeight >= 405) steps = [0.4, 0.6, 0.75, 0.9]; 

    steps.forEach((percent, index) => {
      let raw = targetWeight * percent;
      let weight = getFriendlyWeight(raw);
      
      if (weight < minFirstJump) weight = minFirstJump;
      
      const lastWeight = warmups[warmups.length - 1].weight;
      if (weight <= lastWeight) weight = lastWeight + (liftType === 'bench' ? 20 : 40); 
      
      weight = Math.round(weight / 5) * 5;
      
      if (weight >= targetWeight) return; 

      let reps = 5;
      if (index === steps.length - 2) reps = 3;
      if (index === steps.length - 1) reps = 1;

      warmups.push({ weight, reps });
    });

    return warmups;
  };

  const autoAnalyzeLift = (liftRef) => {
    let programmedLifts = 0;
    let completedLifts = 0;
    let riskIndicators = 0;
    
    // Find the furthest week and day reached FOR THIS SPECIFIC LIFT
    let maxLiftWeek = 0;
    let maxLiftDay = 0;

    programData.forEach(weekData => {
      weekData.days.forEach(dayData => {
        dayData.exercises.forEach((ex, idx) => {
          if (ex.isMain && ex.lift === liftRef) {
            const exKey = `${weekData.week}-${dayData.day}-${idx}`;
            if (progress[exKey] || adjustments[exKey]?.weight) {
              if (weekData.week > maxLiftWeek || (weekData.week === maxLiftWeek && dayData.day > maxLiftDay)) {
                maxLiftWeek = weekData.week;
                maxLiftDay = dayData.day;
              }
            }
          }
        });
      });
    });

    if (maxLiftWeek === 0) {
      return { 
        trend: 'stable', 
        sessionCompletion: 100, 
        fatigueState: 'normal', 
        riskIndicators: 0, 
        improvingRate: 0.5,
        historicalLifts: [],
        completedLifts: 0,
        programmedLifts: 0
      };
    }

    const historicalLifts = [];
    programData.forEach(weekData => {
      if (weekData.week > maxLiftWeek) return;
      weekData.days.forEach(dayData => {
        if (weekData.week === maxLiftWeek && dayData.day > maxLiftDay) return;
        dayData.exercises.forEach((ex, idx) => {
          if (ex.isMain && ex.lift === liftRef) {
            programmedLifts++;
            const exKey = `${weekData.week}-${dayData.day}-${idx}`;
            const isDone = !!progress[exKey];
            if (isDone) completedLifts++;
            
            const defWeight = calculateWeight(ex);
            const defRpe = parseDefaultRPE(ex.rpe);
            const actWeight = adjustments[exKey]?.weight ?? defWeight;
            const actRpe = adjustments[exKey]?.rpe ?? defRpe;
            
            // Risk indicator: count only for completed lifts where actual weight was dropped below programmed
            if (isDone && defWeight > 0 && actWeight < defWeight) {
              riskIndicators++;
            }
            
            if (isDone) {
              historicalLifts.push({ 
                week: weekData.week, 
                day: dayData.day, 
                name: ex.name,
                defWeight, 
                actWeight, 
                defRpe, 
                actRpe 
              });
            }
          }
        });
      });
    });

    const sessionCompletion = programmedLifts > 0 ? (completedLifts / programmedLifts) * 100 : 100;

    let fatigueState = 'normal';
    if (historicalLifts.length >= 3) {
      const last3 = historicalLifts.slice(-3);
      const avgRpeDelta = last3.reduce((sum, l) => sum + (l.actRpe - l.defRpe), 0) / 3;
      if (avgRpeDelta >= 1.0) fatigueState = 'high';
      else if (avgRpeDelta >= 0.5) fatigueState = 'recovery';
      else if (avgRpeDelta <= -0.5) fatigueState = 'fresh';
    }

    let trend = 'stable';
    let improvingRate = 0.5;
    if (historicalLifts.length >= 4) {
      const last4 = historicalLifts.slice(-4);
      const avgWeightDelta = last4.reduce((sum, l) => sum + (l.actWeight - l.defWeight), 0) / 4;
      const avgRpeDelta = last4.reduce((sum, l) => sum + (l.actRpe - l.defRpe), 0) / 4;
      
      if (avgWeightDelta < -2 || avgRpeDelta >= 1.0) {
        trend = 'declining';
      } else if (avgWeightDelta > 2 || avgRpeDelta <= -0.5) {
        trend = 'improving';
        improvingRate = 1.0;
      }
    } else if (historicalLifts.length >= 2) {
      const last2 = historicalLifts.slice(-2);
      const avgWeightDelta = last2.reduce((sum, l) => sum + (l.actWeight - l.defWeight), 0) / 2;
      const avgRpeDelta = last2.reduce((sum, l) => sum + (l.actRpe - l.defRpe), 0) / 2;
      if (avgWeightDelta < -2 || avgRpeDelta >= 1.0) {
        trend = 'declining';
      } else if (avgWeightDelta > 2 || avgRpeDelta <= -0.5) {
        trend = 'improving';
        improvingRate = 0.8;
      }
    }

    return { 
      trend, 
      sessionCompletion, 
      fatigueState, 
      riskIndicators, 
      improvingRate,
      historicalLifts,
      completedLifts,
      programmedLifts
    };
  };

  const calculateProjection = (lift) => {
    const projState = autoAnalyzeLift(lift);
    const currentMax = maxes[lift];
    if (!currentMax) return { base: 0, min: 0, max: 0, conf: 0, opener: 0, targetPR: 0, stretchPR: 0, projState };
    
    // 13-week adaptation projection
    let adaptationRate = 0.005; 
    if (projState.trend === 'declining') adaptationRate = 0.001;
    else if (projState.trend === 'improving' && projState.improvingRate) adaptationRate = projState.improvingRate / 100;
    
    let baseE1RM = currentMax * Math.pow((1 + adaptationRate), 13);
    
    let confidence = 85;
    
    if (projState.sessionCompletion < 90) {
      confidence -= (90 - projState.sessionCompletion);
    }
    
    if (projState.fatigueState === 'high') {
      confidence -= 15;
      baseE1RM = baseE1RM * 0.98;
    } else if (projState.fatigueState === 'recovery') {
      confidence -= 5;
    } else if (projState.fatigueState === 'fresh') {
      confidence += 5;
    }
    
    confidence -= (projState.riskIndicators * 5);
    confidence = Math.max(10, Math.min(99, confidence));
    
    let spread = 0.02;
    spread += ((100 - confidence) / 100) * 0.04;
    
    const baseVal = round5(baseE1RM);
    const minE1RM = round5(baseE1RM * (1 - spread));
    const maxE1RM = round5(baseE1RM * (1 + spread));

    // Week 13 Attempt Strategy
    const opener = round5(baseVal * 0.90);
    const targetPR = baseVal;
    const stretchPR = Math.max(targetPR + 5, round5(baseVal * 1.025));
    
    return {
      base: baseVal,
      min: minE1RM,
      max: maxE1RM,
      conf: Math.round(confidence),
      opener,
      targetPR,
      stretchPR,
      projState
    };
  };

  const renderProgress = () => {
    const result = calculateProjection(activeProjLift);
    const currMax = maxes[activeProjLift];
    const projState = result.projState;
    
    return (
      <div className="animate-fade">
        <h2 className="text-gradient" style={{marginBottom: '24px'}}>13-Week Projections</h2>
        
        <div style={{display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px'}}>
          {['squat', 'bench', 'deadlift'].map(l => (
            <button 
              key={l}
              onClick={() => setActiveProjLift(l)}
              style={{
                background: activeProjLift === l ? 'var(--accent)' : 'var(--surface)',
                color: activeProjLift === l ? '#000' : 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="glass-panel" style={{marginBottom: '24px', background: 'linear-gradient(145deg, rgba(16,18,28,0.85) 0%, rgba(10,12,18,0.95) 100%)', borderTop: '1px solid var(--accent)'}}>
          <div style={{textAlign: 'center', marginBottom: '16px'}}>
            <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px'}}>Current Max</div>
            <div style={{fontSize: '2rem', fontWeight: 900, color: '#fff'}}>{currMax || 0} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>lbs</span></div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px'}}>
            <div style={{height: '2px', flex: 1, background: 'var(--accent)', opacity: 0.3}}></div>
            <div style={{color: 'var(--venom)', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 8px var(--venom-glow)'}}>13 Weeks</div>
            <div style={{height: '2px', flex: 1, background: 'var(--accent)', opacity: 0.3}}></div>
          </div>
          
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px'}}>Projected 13-Week Max</div>
            <div style={{fontSize: '3rem', fontWeight: 900, color: 'var(--venom)', textShadow: '0 0 20px var(--venom-glow), 0 0 35px var(--accent-glow)'}}>{result.base} <span style={{fontSize: '1.5rem', color: 'var(--text-secondary)'}}>lbs</span></div>
            <div style={{fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '8px'}}>Expected Range: {result.min} – {result.max} lbs</div>
          </div>
          
          <div style={{background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)'}}>
            <span style={{fontWeight: 'bold', color: 'var(--text-secondary)'}}>Confidence Score</span>
            <span style={{
              fontWeight: 900, 
              fontSize: '1.2rem',
              color: result.conf > 80 ? 'var(--spider-sense)' : (result.conf > 50 ? 'var(--venom)' : 'var(--accent)')
            }}>{result.conf}%</span>
          </div>
        </div>

        <h3 style={{fontSize: '1.2rem', marginBottom: '16px', marginTop: '32px'}}>Automated Analytics</h3>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px'}}>
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>30-Day Trend</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              textTransform: 'capitalize', 
              color: projState.trend === 'improving' ? 'var(--spider-sense)' : (projState.trend === 'declining' ? 'var(--accent)' : 'var(--text-primary)'),
              marginTop: '4px'
            }}>{projState.trend}</div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Compliance Rate</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              color: projState.sessionCompletion >= 90 ? 'var(--venom)' : 'var(--accent)',
              marginTop: '4px'
            }}>{Math.round(projState.sessionCompletion)}%</div>
            <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
              {projState.completedLifts} of {projState.programmedLifts} main sets
            </div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Fatigue State</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              textTransform: 'capitalize', 
              color: projState.fatigueState === 'high' ? 'var(--accent)' : (projState.fatigueState === 'recovery' ? 'var(--venom)' : 'var(--spider-sense)'),
              marginTop: '4px'
            }}>{projState.fatigueState}</div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Risk Flags</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              color: projState.riskIndicators > 0 ? 'var(--accent)' : 'var(--spider-sense)',
              marginTop: '4px'
            }}>{projState.riskIndicators} <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500}}>Events</span></div>
          </div>
        </div>

        {/* Week 13 Attempt Strategy */}
        <h3 style={{fontSize: '1.2rem', marginBottom: '16px', marginTop: '28px'}}>Week 13 Attempt Strategy</h3>
        <div className="glass-panel" style={{marginBottom: '28px', background: 'rgba(255, 255, 255, 0.02)'}}>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5}}>
            Target attempts calibrated for your Week 13 Testing Day based on progression and readiness:
          </p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'}}>
            <div style={{background: 'rgba(0, 240, 255, 0.06)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(0, 240, 255, 0.3)'}}>
              <div style={{fontSize: '0.75rem', color: 'var(--spider-sense)', textTransform: 'uppercase', fontWeight: 700}}>Opener</div>
              <div style={{fontSize: '1.3rem', fontWeight: 900, color: 'var(--spider-sense)', marginTop: '4px'}}>{result.opener} <span style={{fontSize: '0.75rem'}}>lb</span></div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px'}}>~90% / Smooth</div>
            </div>
            <div style={{background: 'rgba(255, 230, 0, 0.08)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(255, 230, 0, 0.35)'}}>
              <div style={{fontSize: '0.75rem', color: 'var(--venom)', textTransform: 'uppercase', fontWeight: 700}}>Target PR</div>
              <div style={{fontSize: '1.3rem', fontWeight: 900, color: 'var(--venom)', marginTop: '4px'}}>{result.targetPR} <span style={{fontSize: '0.75rem'}}>lb</span></div>
              <div style={{fontSize: '0.7rem', color: 'rgba(255, 230, 0, 0.8)', marginTop: '2px'}}>Projected Max</div>
            </div>
            <div style={{background: 'rgba(255, 0, 68, 0.08)', padding: '12px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(255, 0, 68, 0.35)'}}>
              <div style={{fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700}}>Stretch Goal</div>
              <div style={{fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)', marginTop: '4px'}}>{result.stretchPR} <span style={{fontSize: '0.75rem'}}>lb</span></div>
              <div style={{fontSize: '0.7rem', color: 'rgba(255, 0, 68, 0.8)', marginTop: '2px'}}>Clean PR +</div>
            </div>
          </div>
        </div>

        {/* Completed Session History */}
        <h3 style={{fontSize: '1.2rem', marginBottom: '16px', marginTop: '28px'}}>Session History ({activeProjLift.toUpperCase()})</h3>
        <div style={{marginBottom: '80px'}}>
          {projState.historicalLifts.length === 0 ? (
            <div className="glass-panel" style={{textAlign: 'center', padding: '24px', color: 'var(--text-secondary)'}}>
              <p style={{marginBottom: 0, fontSize: '0.9rem'}}>No completed sessions yet for {activeProjLift}. Check off workouts in the Plan tab to track real-time trends.</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {projState.historicalLifts.slice(-5).reverse().map((hist, i) => (
                <div key={i} className="glass-panel" style={{padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)'}}>
                  <div>
                    <div style={{fontWeight: 'bold', fontSize: '0.95rem', color: '#fff'}}>
                      Week {hist.week} &bull; Day {hist.day}
                    </div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
                      {hist.name}
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 900, fontSize: '1.05rem', color: 'var(--accent)'}}>
                      {hist.actWeight} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>lbs</span>
                    </div>
                    <div style={{fontSize: '0.75rem', color: hist.actRpe > hist.defRpe ? 'var(--danger)' : 'var(--success)'}}>
                      RPE {hist.actRpe} {hist.actRpe !== hist.defRpe && `(Target: ${hist.defRpe})`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDay = ({week, dayData}) => {
    const dayKey = `${week}-${dayData.day}`;
    
    return (
      <div className="comic-panel-transition day-view-container">
        {/* Background Banner: Comic action-line sunburst, split diagonally with red on left and blue on right */}
        <SplitSunburstBanner />

        <div className="days-header" style={{justifyContent: 'space-between', marginBottom: '1.75rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
            <button className="comic-back-btn" onClick={() => { triggerHaptic('tick'); setSelectedDay(null); }} aria-label="Back to week">
              <ChevronLeft size={24} />
            </button>
            <h2 style={{marginBottom: 0, fontSize: '1.65rem', fontStyle: 'italic', fontWeight: 900}}>
              Week {week} - Day {dayData.day}
            </h2>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className={`comic-util-btn ${isInfoOpen ? 'active' : ''}`} 
              onClick={() => { triggerHaptic('tick'); setIsInfoOpen(!isInfoOpen); }} 
              title="Day Rationale"
            >
              <Info size={19} />
            </button>
            <button 
              className={`comic-util-btn ${isNotesOpen ? 'active' : ''}`} 
              onClick={() => { triggerHaptic('tick'); setIsNotesOpen(!isNotesOpen); }} 
              title="Session Notes"
            >
              <FileText size={19} />
            </button>
          </div>
        </div>
        
        {isInfoOpen && dayExplanations[dayKey] && (
          <div className="glass-panel animate-fade" style={{marginBottom: '1.5rem', padding: '16px', background: 'rgba(0, 240, 255, 0.08)', borderColor: 'rgba(0, 240, 255, 0.35)', position: 'relative', zIndex: 3}}>
            <h3 style={{fontSize: '1rem', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontStyle: 'italic', fontWeight: 800}}>
              <Info size={16} /> Day Focus & Rationale
            </h3>
            <p style={{fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6, marginBottom: 0}}>
              {dayExplanations[dayKey]}
            </p>
          </div>
        )}
        
        {isNotesOpen && (
          <div className="glass-panel" style={{marginBottom: '1.5rem', padding: '16px', position: 'relative', zIndex: 3}}>
            <textarea 
              className="input-field" 
              style={{minHeight: '100px', resize: 'vertical', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)'}}
              placeholder="Add your training notes for this session..."
              value={sessionNotes[dayKey] || ''}
              onChange={(e) => setSessionNotes({...sessionNotes, [dayKey]: e.target.value})}
            />
          </div>
        )}

        {dayData.notes && (
          <div className="glass-panel" style={{marginBottom: '1.5rem', padding: '14px 18px', background: 'rgba(255, 0, 68, 0.08)', borderColor: 'rgba(255, 0, 68, 0.35)', position: 'relative', zIndex: 3}}>
            <p style={{fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600, lineHeight: 1.5, fontStyle: 'italic'}}>{dayData.notes}</p>
          </div>
        )}

        <div className="exercise-list">
          {dayData.exercises && dayData.exercises.map((ex, idx) => {
            const exKey = `${week}-${dayData.day}-${idx}`;
            const isDone = progress[exKey];
            const defaultWeight = calculateWeight(ex);
            
            const displayWeight = adjustments[exKey]?.weight ?? defaultWeight;
            const displayRpe = adjustments[exKey]?.rpe ?? ex.rpe;
            const intensityTag = getIntensityTag(ex);
            const calcBreakdown = getCalcBreakdown(ex);
            
            const isEditing = editingEx === exKey;
            const isJustCompleted = justCompletedEx === exKey;
            
            return (
              <div key={idx} className={`comic-exercise-card ${isDone ? 'completed' : ''} ${isJustCompleted ? 'just-completed' : ''}`}>
                {/* Faint white/cyan spider webs in the bottom-left and top-right corners */}
                <CornerWeb position="top-right" size={46} opacity={0.35} />
                <CornerWeb position="bottom-left" size={46} opacity={0.35} />

                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1, position: 'relative', zIndex: 2}}>
                    {/* Exercise Title */}
                    <div className="comic-ex-name">
                      <span>{ex.name}</span>
                      {ex.isMain && (
                        <div style={{display: 'flex', gap: '6px'}}>
                          <button 
                            className="comic-util-btn" 
                            onClick={(e) => { e.stopPropagation(); setCalcOpenEx(exKey); setEditingEx(null); }}
                            style={{width: '32px', height: '32px'}}
                            title="Warmup Calculator"
                          >
                            <Calculator size={15} />
                          </button>
                          <button 
                            className={`comic-util-btn ${isEditing ? 'active' : ''}`} 
                            onClick={(e) => { e.stopPropagation(); setEditingEx(isEditing ? null : exKey); }}
                            style={{width: '32px', height: '32px'}}
                            title="Adjust Load/RPE"
                          >
                            {isEditing ? <X size={15} /> : <SlidersHorizontal size={15} />}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Badges (Sets / Reps / RPE) in pill containers */}
                    <div className="comic-badges-row">
                      {ex.isRest && <span className="comic-badge-sets">REST DAY</span>}
                      {ex.sets && ex.reps && (
                        <span className="comic-badge-sets">{ex.sets} × {ex.reps}</span>
                      )}
                      {intensityTag && (
                        <span className="comic-badge-intensity">{intensityTag}</span>
                      )}
                      {displayRpe && (
                        <span className="comic-badge-rpe">RPE {displayRpe}</span>
                      )}
                    </div>
                    
                    {/* Target Load: Massively upscaled, bold, italic, bright red ("285") with smaller white "lbs" */}
                    {displayWeight > 0 && (
                      <div style={{marginTop: '4px'}}>
                        <div className="comic-load-container">
                          <span className="comic-weight-num">{displayWeight}</span>
                          <span className="comic-weight-unit">lbs</span>
                        </div>
                        {calcBreakdown && (
                          <div className="comic-calc-subtext">
                            {calcBreakdown}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Coach's notes with vertical red line blockquote border and white italic text */}
                    {ex.notes && (
                      <div className="comic-coach-note">
                        {ex.notes}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Toggles: rough red circle outline, complete = dark grey + checkmark + action ripples */}
                  <div 
                    className="comic-toggle-wrapper" 
                    onClick={(e) => toggleExercise(week, dayData.day, idx, e)}
                    title={isDone ? "Mark incomplete" : "Mark complete"}
                  >
                    <ComicActionRipples active={isDone} bursting={isJustCompleted} />
                    <div className={`comic-toggle-circle ${isDone ? 'checked' : ''}`}>
                      {isDone && <span className="comic-toggle-check">✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={(e) => completeSession(week, dayData, e)}
          style={{
            width: '100%', 
            padding: '16px', 
            marginTop: '24px', 
            background: 'linear-gradient(90deg, #ff0044 0%, #ff1744 50%, #ffe600 100%)', 
            color: '#000', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '1.1rem', 
            fontWeight: 900, 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(255, 0, 68, 0.5), 0 0 15px rgba(255, 230, 0, 0.3)',
            cursor: 'pointer'
          }}
        >
          Complete Session
        </button>
      </div>
    );
  };

  const renderAdjustmentModal = () => {
    if (!editingEx) return null;
    
    const [wStr, dStr, idxStr] = editingEx.split('-');
    const w = parseInt(wStr, 10);
    const d = parseInt(dStr, 10);
    const idx = parseInt(idxStr, 10);
    
    const weekData = programData.find(wd => wd.week === w);
    const dayData = weekData.days.find(dd => dd.day === d);
    const ex = dayData.exercises[idx];
    
    const defaultWeight = calculateWeight(ex);
    const defaultRpe = parseDefaultRPE(ex.rpe);
    
    const displayWeight = adjustments[editingEx]?.weight ?? defaultWeight;
    const displayRpe = adjustments[editingEx]?.rpe ?? defaultRpe;

    return (
      <div className="modal-overlay animate-fade" onClick={() => setEditingEx(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="glass-panel" onClick={e => e.stopPropagation()} style={{width: '100%', maxWidth: '400px', background: 'linear-gradient(145deg, rgba(15,20,30,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid var(--accent)', padding: '24px', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>
          
          <button onClick={() => setEditingEx(null)} style={{position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
            <X size={24} />
          </button>

          <div style={{textAlign: 'center', marginBottom: '32px', paddingRight: '24px', paddingLeft: '24px'}}>
            <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '8px', lineHeight: 1.3}}>{ex.name}</h3>
            <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Adjust Set Values</div>
          </div>

          {defaultWeight > 0 && (
            <div className="slider-group" style={{marginBottom: '24px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end'}}>
                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Weight</span>
                <span style={{fontWeight: 900, color: 'var(--accent)', fontSize: '1.5rem'}}>{displayWeight} <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>lbs</span></span>
              </div>
              {getCalcBreakdown(ex) && (
                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px'}}>
                  Programmed: {defaultWeight} lbs {getCalcBreakdown(ex)}
                </div>
              )}
              <input 
                type="range" 
                className="custom-slider" 
                min={Math.max(0, defaultWeight - 100)} 
                max={defaultWeight + 100} 
                step={5} 
                value={displayWeight} 
                onChange={(e) => handleAdjustmentChange(editingEx, 'weight', e.target.value)} 
                style={{width: '100%'}}
              />
            </div>
          )}

          <div className="slider-group">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end'}}>
              <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>RPE</span>
              <span style={{fontWeight: 900, color: 'var(--accent)', fontSize: '1.5rem'}}>{displayRpe}</span>
            </div>
            <input 
              type="range" 
              className="custom-slider" 
              min={5} 
              max={10} 
              step={0.5} 
              value={displayRpe} 
              onChange={(e) => handleAdjustmentChange(editingEx, 'rpe', e.target.value)} 
              style={{width: '100%'}}
            />
          </div>
          
        </div>
      </div>
    );
  };

  const renderCalculatorModal = () => {
    if (!calcOpenEx) return null;
    
    const [wStr, dStr, idxStr] = calcOpenEx.split('-');
    const w = parseInt(wStr, 10);
    const d = parseInt(dStr, 10);
    const idx = parseInt(idxStr, 10);
    
    const weekData = programData.find(wd => wd.week === w);
    const dayData = weekData.days.find(dd => dd.day === d);
    const ex = dayData.exercises[idx];
    
    const defaultWeight = calculateWeight(ex);
    const displayWeight = adjustments[calcOpenEx]?.weight ?? defaultWeight;

    return (
      <div className="modal-overlay animate-fade" onClick={() => setCalcOpenEx(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="glass-panel" onClick={e => e.stopPropagation()} style={{width: '100%', maxWidth: '400px', background: 'linear-gradient(145deg, rgba(15,20,30,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid var(--accent)', padding: '24px', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>
          
          <button onClick={() => setCalcOpenEx(null)} style={{position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
            <X size={24} />
          </button>

          <div style={{textAlign: 'center', marginBottom: '24px', paddingRight: '24px', paddingLeft: '24px'}}>
            <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '8px', lineHeight: 1.3}}>{ex.name}</h3>
            <div style={{color: 'var(--accent)', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 15px var(--accent-glow)'}}>{displayWeight} <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600}}>lbs</span></div>
            {getCalcBreakdown(ex) && (
              <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500}}>
                {getCalcBreakdown(ex)}
              </div>
            )}
          </div>

          <h4 style={{color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px'}}>Top Set Plate Loading (Per Side)</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '24px'}}>
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 'bold'}}>[ 45lb Bar ]</div>
            {calculatePlates(displayWeight).length > 0 && <div style={{color: 'var(--text-secondary)', fontWeight: 'bold'}}>+</div>}
            {calculatePlates(displayWeight).map((p, i) => (
              <div key={i} style={{
                background: p.weight === 45 ? 'rgba(255, 0, 68, 0.25)' : 'rgba(255,255,255,0.05)', 
                color: p.weight === 45 ? '#ff4d6d' : 'inherit', 
                border: p.weight === 45 ? '1px solid rgba(255, 0, 68, 0.45)' : '1px solid rgba(255,255,255,0.1)', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.9rem', 
                fontWeight: p.weight === 45 ? 'bold' : 'normal'
              }}>
                {p.count}x {p.weight} <span style={{opacity: 0.5}}>lbs</span>
              </div>
            ))}
          </div>

          <h4 style={{color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px'}}>Warm-up Protocol</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {generateWarmups(displayWeight, ex.lift).map((w, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: 'var(--radius-sm)'}}>
                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Step {i + 1}</span>
                <span style={{fontWeight: 'bold', fontSize: '1rem', color: '#fff'}}>{w.weight} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>lbs</span> <span style={{color: 'var(--venom)', marginLeft: '12px'}}>× {w.reps}</span></span>
              </div>
            ))}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 0, 68, 0.15)', border: '1px solid rgba(255, 0, 68, 0.35)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginTop: '4px', boxShadow: '0 0 15px rgba(255, 0, 68, 0.2)'}}>
              <span style={{fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold'}}>Top Set</span>
              <span style={{fontWeight: '900', fontSize: '1.1rem', color: '#fff'}}>{displayWeight} <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)'}}>lbs</span> <span style={{color: 'var(--venom)', marginLeft: '12px'}}>× {ex.reps}</span></span>
            </div>
          </div>
          
        </div>
      </div>
    );
  };

  const renderSpiderWebs = () => (
    <div className="spiderweb-bg" aria-hidden="true">
      {/* Top Right Corner Spider-Man Web */}
      <svg className="web-corner-tr" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="350" y1="0" x2="0" y2="0" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="0" y2="70" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="0" y2="150" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="0" y2="250" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="0" y2="350" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.4" />
        <line x1="350" y1="0" x2="100" y2="350" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="200" y2="350" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="280" y2="350" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="350" y1="0" x2="350" y2="350" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.2" />

        <path d="M 300 0 Q 300 35 350 50" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 250 0 Q 255 70 350 100" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 200 0 Q 210 110 350 150" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 150 0 Q 165 155 350 200" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 100 0 Q 120 200 350 250" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 50 0 Q 75 250 350 300" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 0 0 Q 30 300 350 350" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.4" fill="none" />
        <path d="M 0 100 Q 60 320 280 350" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1" fill="none" />
        <path d="M 0 200 Q 90 335 200 350" stroke="rgba(255, 0, 68, 0.3)" strokeWidth="1" fill="none" />
      </svg>

      {/* Bottom Left Corner Spider-Man Web */}
      <svg className="web-corner-bl" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="350" x2="350" y2="350" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="350" y2="280" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="350" y2="200" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="350" y2="100" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="350" y2="0" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.4" />
        <line x1="0" y1="350" x2="250" y2="0" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="150" y2="0" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="70" y2="0" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
        <line x1="0" y1="350" x2="0" y2="0" stroke="rgba(255, 0, 68, 0.45)" strokeWidth="1.2" />

        <path d="M 50 350 Q 50 315 0 300" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 100 350 Q 95 280 0 250" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 150 350 Q 140 240 0 200" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 200 350 Q 185 195 0 150" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 250 350 Q 230 150 0 100" stroke="rgba(255, 0, 68, 0.4)" strokeWidth="1.2" fill="none" />
        <path d="M 300 350 Q 275 100 0 50" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.2" fill="none" />
        <path d="M 350 350 Q 320 50 0 0" stroke="rgba(255, 0, 68, 0.5)" strokeWidth="1.4" fill="none" />
        <path d="M 350 250 Q 290 30 70 0" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1" fill="none" />
        <path d="M 350 150 Q 260 15 150 0" stroke="rgba(255, 0, 68, 0.3)" strokeWidth="1" fill="none" />
      </svg>

      {/* Subtle Spider-Man Background Web Strands */}
      <svg className="web-strands" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 180 Q 400 260 1000 140" stroke="rgba(255, 0, 68, 0.22)" strokeWidth="1" fill="none" />
        <path d="M 0 520 Q 600 580 1000 460" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
        <path d="M 0 820 Q 500 760 1000 890" stroke="rgba(255, 0, 68, 0.25)" strokeWidth="1" fill="none" />
        <path d="M 280 0 Q 320 500 240 1000" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" fill="none" strokeDasharray="6 4" />
        <path d="M 750 0 Q 700 500 790 1000" stroke="rgba(255, 0, 68, 0.18)" strokeWidth="1" fill="none" strokeDasharray="8 6" />
      </svg>
    </div>
  );

  return (
    <>
      {renderSpiderWebs()}
      <div style={{marginBottom: '1.75rem', marginTop: '0.75rem', textAlign: 'center'}}>
        <h1 className="app-title">Chiko_Lifts</h1>
        <p className="app-subtitle">StrengthBender System</p>
      </div>

      <main className="main-content">
        {activeTab === 'dashboard' ? renderDashboard() : (activeTab === 'progress' ? renderProgress() : renderSettings())}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => { triggerHaptic('tick'); setActiveTab('dashboard'); setSelectedDay(null); setSelectedWeek(null); }}
        >
          <div className="nav-icon-container">
            {activeTab === 'dashboard' && <ComicActionRipples active />}
            <Calendar size={22} strokeWidth={2.5} />
          </div>
          <span className="nav-label">Plan</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} 
          onClick={() => { triggerHaptic('tick'); setActiveTab('progress'); }}
        >
          <div className="nav-icon-container">
            {activeTab === 'progress' && <ComicActionRipples active />}
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <span className="nav-label">Progress</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => { triggerHaptic('tick'); setActiveTab('settings'); }}
        >
          <div className="nav-icon-container">
            {activeTab === 'settings' && <ComicActionRipples active />}
            <Settings size={22} strokeWidth={2.5} />
          </div>
          <span className="nav-label">Maxes</span>
        </button>
      </nav>

      {renderCalculatorModal()}
      {renderAdjustmentModal()}
    </>
  );
}

function App() {
  return (
    <VFXProvider>
      <AppContent />
    </VFXProvider>
  );
}

export default App;
