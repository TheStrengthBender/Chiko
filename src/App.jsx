import { useState, useEffect } from 'react';
import { programData } from './data/program';
import { dayExplanations } from './data/explanations';
import { Settings, Calendar, CheckCircle2, ChevronLeft, Dumbbell, Target, FileText, Info, SlidersHorizontal, X, TrendingUp, Calculator } from 'lucide-react';
import './App.css';

const MAXES_KEY = 'fourLift_maxes';
const PROGRESS_KEY = 'fourLift_progress';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  
  const [maxes, setMaxes] = useState(() => {
    const saved = localStorage.getItem(MAXES_KEY);
    return saved ? JSON.parse(saved) : { squat: 335, bench: 225, deadlift: 410, rackPull: 0 };
  });

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [sessionNotes, setSessionNotes] = useState(() => {
    const saved = localStorage.getItem('fourLift_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [adjustments, setAdjustments] = useState(() => {
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

  const tms = {
    squat: Math.round(maxes.squat * 0.90 / 5) * 5,
    bench: Math.round(maxes.bench * 0.90 / 5) * 5,
    deadlift: Math.round(maxes.deadlift * 0.90 / 5) * 5,
    rackPull: maxes.rackPull > 0 ? maxes.rackPull : 0
  };

  const handleMaxChange = (e) => {
    const { name, value } = e.target;
    setMaxes(prev => ({ ...prev, [name]: Number(value) }));
  };

  const toggleExercise = (week, day, exerciseIdx) => {
    const key = `${week}-${day}-${exerciseIdx}`;
    setProgress(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const completeSession = (week, dayData) => {
    const newProgress = { ...progress };
    dayData.exercises.forEach((ex, idx) => {
      newProgress[`${week}-${dayData.day}-${idx}`] = true;
    });
    setProgress(newProgress);
    setSelectedDay(null);
    setSelectedWeek(null);
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
      <h2 className="text-gradient" style={{marginBottom: '24px'}}>Program Rules & Maxes</h2>
      
      <div className="glass-panel" style={{marginBottom: '24px', background: 'rgba(250, 204, 21, 0.05)', borderColor: 'rgba(250, 204, 21, 0.3)'}}>
        <h3 style={{fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '12px', fontStyle: 'italic'}}>Establishing TM (Training Max)</h3>
        <ul style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '20px', marginBottom: 0, lineHeight: 1.6}}>
          <li style={{marginBottom: '8px'}}><strong>Squat / Bench / Deadlift:</strong> 90% of a true 1RM, OR 90% of an estimated 1RM from a recent AMRAP.</li>
          <li><strong>Rack Pull:</strong> Set independently. Test or estimate a mid-shin rack pull max.</li>
        </ul>
      </div>

      <div className="glass-panel" style={{marginBottom: '24px', background: 'rgba(255, 59, 48, 0.05)', borderColor: 'rgba(255, 59, 48, 0.3)'}}>
        <h3 style={{fontSize: '1.1rem', color: '#ff453a', marginBottom: '12px', fontStyle: 'italic'}}>Autoregulation Rule</h3>
        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 0, lineHeight: 1.6}}>
          If the first working set of any top set comes up more than ~1 RPE point harder than prescribed, or bar speed clearly slows, <strong>drop the load ~5%</strong> and keep the prescribed sets/reps. Never grind a top set to hit a percentage.
        </p>
      </div>
      
      <div className="glass-panel">
        <div className="input-group">
          <label className="input-label">Squat 1RM (lbs)</label>
          <input type="number" name="squat" className="input-field" value={maxes.squat || ''} onChange={handleMaxChange} />
          <div className="tm-display"><Target size={16} /> Training Max: {tms.squat} lbs</div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Bench Press 1RM (lbs)</label>
          <input type="number" name="bench" className="input-field" value={maxes.bench || ''} onChange={handleMaxChange} />
          <div className="tm-display"><Target size={16} /> Training Max: {tms.bench} lbs</div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Deadlift 1RM (lbs)</label>
          <input type="number" name="deadlift" className="input-field" value={maxes.deadlift || ''} onChange={handleMaxChange} />
          <div className="tm-display"><Target size={16} /> Training Max: {tms.deadlift} lbs</div>
        </div>
        
        <div className="input-group" style={{marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px'}}>
          <label className="input-label">Paused Rack Pull TM (lbs)</label>
          <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4}}>
            Enter manually based on a mid-shin rack pull max.
          </p>
          <input type="number" name="rackPull" className="input-field" value={maxes.rackPull || ''} onChange={handleMaxChange} />
        </div>
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
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-title">Power Level</span>
            <span className="progress-percent" style={progressPercent === 100 ? {color: 'var(--success)', textShadow: '0 0 15px var(--success)'} : {}}>
              {progressPercent === 100 ? 'OVER 9000!' : `${progressPercent}%`}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <h2 className="text-gradient">Program Overview</h2>
        <p className="text-secondary" style={{marginBottom: '1.5rem'}}>Select a week to view and track your training.</p>
        <div className="week-grid">
          {programData.map((w, idx) => {
            const completed = isWeekCompleted(w);
            return (
              <div 
                key={idx} 
                className={`week-card ${completed ? 'completed' : ''}`} 
                onClick={() => setSelectedWeek(w)}
              >
                <div className="week-number">W{w.week}</div>
                <div className="week-phase">{w.phase}</div>
                {completed && (
                  <div style={{position: 'absolute', top: 8, right: 8, color: '#30d158'}}>
                    <CheckCircle2 size={16} />
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
    <div className="animate-fade">
      <div className="days-header">
        <button className="back-btn" onClick={() => setSelectedWeek(null)}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 style={{marginBottom: 0, fontSize: '1.75rem'}}>Week {weekData.week}</h2>
          <span className="text-secondary" style={{fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{weekData.phase}</span>
        </div>
      </div>
      
      <div className="day-list">
        {weekData.days.map((day, idx) => {
          let dayFocus = day.notes || "";
          if (!dayFocus && day.exercises && day.exercises.length > 0) {
             const mains = day.exercises.filter(e => e.isMain).map(e => e.name);
             dayFocus = mains.join(" / ");
          }
          
          let dayCompleted = false;
          if (day.exercises && day.exercises.length > 0) {
            let total = day.exercises.length;
            let done = 0;
            day.exercises.forEach((ex, i) => {
              if (progress[`${weekData.week}-${day.day}-${i}`]) done++;
            });
            dayCompleted = (total === done && total > 0);
          }

          return (
            <div key={idx} className="day-card" onClick={() => { setSelectedDay({week: weekData.week, dayData: day}); setIsNotesOpen(false); setIsInfoOpen(false); }}>
              <div className="day-header">
                <div className="day-title">Day {day.day}</div>
                {dayCompleted && (
                   <div style={{color: 'var(--success)'}}><CheckCircle2 size={22} /></div>
                )}
              </div>
              <div className="day-preview">{dayFocus}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const calculateWeight = (exercise) => {
    if (!exercise.percent) return null;
    const liftRef = exercise.lift;
    if (!liftRef || !tms[liftRef]) return null;
    
    const tmWeight = tms[liftRef];
    const weight = Math.round((tmWeight * exercise.percent) / 5) * 5;
    return weight;
  };

  const parseDefaultRPE = (rpeStr) => {
    if (!rpeStr) return 7;
    if (typeof rpeStr === 'number') return rpeStr;
    if (rpeStr.includes('-')) {
      const parts = rpeStr.split('-');
      return (Number(parts[0]) + Number(parts[1])) / 2;
    }
    return Number(rpeStr) || 7;
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
    
    let currentMaxWeek = 0;
    let currentMaxDay = 0;
    Object.keys(progress).forEach(key => {
      if (progress[key]) {
        const [wStr, dStr, idxStr] = key.split('-');
        const w = parseInt(wStr, 10);
        const d = parseInt(dStr, 10);
        if (w > currentMaxWeek || (w === currentMaxWeek && d > currentMaxDay)) {
          currentMaxWeek = w;
          currentMaxDay = d;
        }
      }
    });

    if (currentMaxWeek === 0) {
      return { trend: 'stable', sessionCompletion: 100, fatigueState: 'normal', riskIndicators: 0, improvingRate: 0.5 };
    }

    const historicalLifts = [];
    programData.forEach(weekData => {
      if (weekData.week > currentMaxWeek) return;
      weekData.days.forEach(dayData => {
        if (weekData.week === currentMaxWeek && dayData.day > currentMaxDay) return;
        dayData.exercises.forEach((ex, idx) => {
          if (ex.isMain && ex.lift === liftRef) {
            programmedLifts++;
            const exKey = `${weekData.week}-${dayData.day}-${idx}`;
            const isDone = progress[exKey];
            if (isDone) completedLifts++;
            
            const defWeight = calculateWeight(ex);
            const defRpe = parseDefaultRPE(ex.rpe);
            const actWeight = adjustments[exKey]?.weight ?? defWeight;
            const actRpe = adjustments[exKey]?.rpe ?? defRpe;
            
            if (actWeight < defWeight) riskIndicators++;
            
            if (isDone) {
              historicalLifts.push({ week: weekData.week, defWeight, actWeight, defRpe, actRpe });
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
    }

    return { trend, sessionCompletion, fatigueState, riskIndicators, improvingRate };
  };

  const calculateProjection = (lift) => {
    const projState = autoAnalyzeLift(lift);
    const currentMax = maxes[lift];
    if (!currentMax) return { base: 0, min: 0, max: 0, conf: 0, projState };
    
    let adaptationRate = 0.005; 
    if (projState.trend === 'declining') adaptationRate = 0;
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
    }
    
    confidence -= (projState.riskIndicators * 5);
    confidence = Math.max(0, Math.min(100, confidence));
    
    let spread = 0.02;
    spread += ((100 - confidence) / 100) * 0.05;
    
    const minE1RM = Math.round(baseE1RM * (1 - spread));
    const maxE1RM = Math.round(baseE1RM * (1 + spread));
    
    return {
      base: Math.round(baseE1RM),
      min: minE1RM,
      max: maxE1RM,
      conf: Math.round(confidence),
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
          {['squat', 'bench', 'deadlift', 'rackPull'].map(l => (
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
                whiteSpace: 'nowrap'
              }}
            >
              {l === 'rackPull' ? 'Rack Pull' : l}
            </button>
          ))}
        </div>

        <div className="glass-panel" style={{marginBottom: '24px', background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.9) 100%)'}}>
          <div style={{textAlign: 'center', marginBottom: '16px'}}>
            <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px'}}>Current 1RM</div>
            <div style={{fontSize: '2rem', fontWeight: 900, color: '#fff'}}>{currMax || 0} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>lbs</span></div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px'}}>
            <div style={{height: '2px', flex: 1, background: 'var(--accent)', opacity: 0.3}}></div>
            <div style={{color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem'}}>13 Weeks</div>
            <div style={{height: '2px', flex: 1, background: 'var(--accent)', opacity: 0.3}}></div>
          </div>
          
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px'}}>Projected 1RM</div>
            <div style={{fontSize: '3rem', fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 20px rgba(250, 204, 21, 0.4)'}}>{result.base} <span style={{fontSize: '1.5rem', color: 'var(--text-secondary)'}}>lbs</span></div>
            <div style={{fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '8px'}}>Range: {result.min} - {result.max} lbs</div>
          </div>
          
          <div style={{background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontWeight: 'bold', color: 'var(--text-secondary)'}}>Confidence Score</span>
            <span style={{
              fontWeight: 900, 
              fontSize: '1.2rem',
              color: result.conf > 80 ? 'var(--success)' : (result.conf > 50 ? 'var(--accent)' : 'var(--danger)')
            }}>{result.conf}%</span>
          </div>
        </div>

        <h3 style={{fontSize: '1.2rem', marginBottom: '16px', marginTop: '32px'}}>Automated Analytics</h3>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '80px'}}>
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>30-Day Trend</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              textTransform: 'capitalize', 
              color: projState.trend === 'improving' ? 'var(--success)' : (projState.trend === 'declining' ? 'var(--danger)' : 'var(--text-primary)'),
              marginTop: '4px'
            }}>{projState.trend}</div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Compliance Rate</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              color: projState.sessionCompletion >= 90 ? 'var(--success)' : 'var(--danger)',
              marginTop: '4px'
            }}>{Math.round(projState.sessionCompletion)}%</div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Fatigue State</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              textTransform: 'capitalize', 
              color: projState.fatigueState === 'high' ? 'var(--danger)' : (projState.fatigueState === 'recovery' ? 'var(--accent)' : 'var(--success)'),
              marginTop: '4px'
            }}>{projState.fatigueState}</div>
          </div>
          
          <div className="glass-panel" style={{padding: '16px', background: 'rgba(255,255,255,0.03)'}}>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Risk Flags</div>
            <div style={{
              fontSize: '1.2rem', 
              fontWeight: '900', 
              color: projState.riskIndicators > 0 ? 'var(--danger)' : 'var(--success)',
              marginTop: '4px'
            }}>{projState.riskIndicators} <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500}}>Events</span></div>
          </div>
        </div>
        
      </div>
    );
  };

  const renderDay = ({week, dayData}) => {
    const dayKey = `${week}-${dayData.day}`;
    
    return (
      <div className="animate-fade">
        <div className="days-header">
          <button className="back-btn" onClick={() => setSelectedDay(null)}>
            <ChevronLeft size={24} />
          </button>
          <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{marginBottom: 0, fontSize: '1.5rem'}}>Week {week} - Day {dayData.day}</h2>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="back-btn" onClick={() => setIsInfoOpen(!isInfoOpen)} style={{background: isInfoOpen ? 'var(--accent)' : 'var(--surface)', color: isInfoOpen ? '#fff' : 'var(--text-primary)'}}>
                <Info size={20} />
              </button>
              <button className="back-btn" onClick={() => setIsNotesOpen(!isNotesOpen)} style={{background: isNotesOpen ? 'var(--accent)' : 'var(--surface)', color: isNotesOpen ? '#fff' : 'var(--text-primary)'}}>
                <FileText size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {isInfoOpen && dayExplanations[dayKey] && (
          <div className="glass-panel animate-fade" style={{marginBottom: '1.5rem', padding: '16px', background: 'rgba(58, 134, 255, 0.08)', borderColor: 'rgba(58, 134, 255, 0.3)'}}>
            <h3 style={{fontSize: '1rem', color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontStyle: 'italic'}}>
              <Info size={16} /> Day Focus & Rationale
            </h3>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0}}>
              {dayExplanations[dayKey]}
            </p>
          </div>
        )}
        
        {isNotesOpen && (
          <div className="glass-panel" style={{marginBottom: '1.5rem', padding: '16px'}}>
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
          <div className="glass-panel" style={{marginBottom: '1.5rem', padding: '16px 20px', background: 'rgba(250, 204, 21, 0.08)', borderColor: 'rgba(250, 204, 21, 0.2)'}}>
            <p style={{fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5}}>{dayData.notes}</p>
          </div>
        )}

        <div className="exercise-list">
          {dayData.exercises && dayData.exercises.map((ex, idx) => {
            const exKey = `${week}-${dayData.day}-${idx}`;
            const isDone = progress[exKey];
            const defaultWeight = calculateWeight(ex);
            const defaultRpe = parseDefaultRPE(ex.rpe);
            
            const displayWeight = adjustments[exKey]?.weight ?? defaultWeight;
            const displayRpe = adjustments[exKey]?.rpe ?? ex.rpe;
            
            const isEditing = editingEx === exKey;
            const isCalcOpen = calcOpenEx === exKey;
            
            return (
              <div key={idx} className={`exercise-item ${isDone ? 'completed' : ''} ${ex.isMain ? 'main-lift' : ''}`}>
                <div style={{display: 'flex', width: '100%'}}>
                  <div className="exercise-details" style={{flex: 1}}>
                    <div className="exercise-name" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <span>{ex.name}</span>
                      {ex.isMain && (
                        <div style={{display: 'flex', gap: '6px'}}>
                          <button 
                            className="back-btn" 
                            onClick={(e) => { e.stopPropagation(); setCalcOpenEx(exKey); setEditingEx(null); }}
                            style={{padding: '4px', background: 'transparent', color: 'var(--text-secondary)'}}
                          >
                            <Calculator size={18} />
                          </button>
                          <button 
                            className="back-btn" 
                            onClick={(e) => { e.stopPropagation(); setEditingEx(isEditing ? null : exKey); }}
                            style={{padding: '4px', background: isEditing ? 'var(--accent)' : 'transparent', color: isEditing ? '#000' : 'var(--text-secondary)'}}
                          >
                            {isEditing ? <X size={18} /> : <SlidersHorizontal size={18} />}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="exercise-meta">
                      {ex.sets && ex.reps && <span className="tag tag-accent">{ex.sets} × {ex.reps}</span>}
                      {ex.percent && <span className="tag">{(ex.percent * 100).toFixed(0)}%</span>}
                      {displayRpe && <span className="tag">RPE {displayRpe}</span>}
                    </div>
                    
                    {displayWeight > 0 && <div className="exercise-weight">{displayWeight} <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600}}>lbs</span></div>}
                    
                    {ex.notes && <div className="exercise-notes">{ex.notes}</div>}
                  </div>
                  
                  <div className="checkbox-wrapper" onClick={() => toggleExercise(week, dayData.day, idx)}>
                    <div className={`custom-checkbox ${isDone ? 'checked' : ''}`}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button 
          onClick={() => completeSession(week, dayData)}
          style={{
            width: '100%', 
            padding: '16px', 
            marginTop: '24px', 
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--success) 100%)', 
            color: '#000', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '1.1rem', 
            fontWeight: 900, 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px var(--success-glow)',
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
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end'}}>
                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Weight</span>
                <span style={{fontWeight: 900, color: 'var(--accent)', fontSize: '1.5rem'}}>{displayWeight} <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>lbs</span></span>
              </div>
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
            <div style={{color: 'var(--accent)', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 15px rgba(250, 204, 21, 0.3)'}}>{displayWeight} <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600}}>lbs</span></div>
          </div>

          <h4 style={{color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px'}}>Top Set Plate Loading (Per Side)</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '24px'}}>
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 'bold'}}>[ 45lb Bar ]</div>
            {calculatePlates(displayWeight).length > 0 && <div style={{color: 'var(--text-secondary)', fontWeight: 'bold'}}>+</div>}
            {calculatePlates(displayWeight).map((p, i) => (
              <div key={i} style={{
                background: p.weight === 45 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', 
                color: p.weight === 45 ? '#fca5a5' : 'inherit', 
                border: p.weight === 45 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)', 
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
                <span style={{fontWeight: 'bold', fontSize: '1rem', color: '#fff'}}>{w.weight} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>lbs</span> <span style={{color: 'var(--accent)', marginLeft: '12px'}}>× {w.reps}</span></span>
              </div>
            ))}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginTop: '4px', boxShadow: '0 0 15px rgba(250, 204, 21, 0.1)'}}>
              <span style={{fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold'}}>Top Set</span>
              <span style={{fontWeight: '900', fontSize: '1.1rem', color: '#fff'}}>{displayWeight} <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)'}}>lbs</span> <span style={{color: 'var(--accent)', marginLeft: '12px'}}>× {ex.reps}</span></span>
            </div>
          </div>
          
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{marginBottom: '2rem', marginTop: '1rem', textAlign: 'center'}}>
        <h1 className="app-title">Chiko_lifts</h1>
        <p className="text-secondary" style={{fontSize: '0.95rem', fontWeight: 500}}>The 13-Week StrengthBender System</p>
      </div>

      <main className="main-content">
        {activeTab === 'dashboard' ? renderDashboard() : (activeTab === 'progress' ? renderProgress() : renderSettings())}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Calendar size={26} strokeWidth={2.5} />
          <span>Plan</span>
        </button>
        <button className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          <TrendingUp size={26} strokeWidth={2.5} />
          <span>Progress</span>
        </button>
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={26} strokeWidth={2.5} />
          <span>Maxes</span>
        </button>
      </nav>

      {renderCalculatorModal()}
      {renderAdjustmentModal()}
    </>
  );
}

export default App;
