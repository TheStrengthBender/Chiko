// Chiko_Lifts Program 2.0 — sourced from "Chiko_Lifts_Program_2.0_Formatted FINAL.xlsx"
//
// Load fields (all loads round to the nearest 5 lb, matching Excel MROUND(x, 5)):
//   percent   — fraction applied to user's entered max
//   plus      — fixed lb added after rounding (secondary squat / 1.5-rep deadlift progression)
//   intensity — optional display label used instead of the plain "%" tag
//   isRest    — rest day placeholder (no lifting)

const SQUAT_TOP_NOTE = "Smooth single, no grind";
const DELOAD_TOP_NOTE = "Skip if slow or technically compromised";
const SECONDARY_SQUAT_NOTE = "Clean reps; no grinding";
const SECONDARY_DELOAD_NOTE = "Easy deload; reduce fatigue";
const ONE_FIVE_DL_NOTE = "Reset every rep; lower to just below knee, return to lockout, then lower fully. W1 60% DL max; add +5 lb/week only if clean and ≤RPE 7. Deload: 2x3 @55% max.";
const ROW_NOTE = "4 strict sets. Add 5 lb next exposure only when every set is clean and ≤RPE 8; deload load/reps, no failure.";
const REST_NOTE = "Full rest; no loaded lifting.";
const PRE_DL_REST_NOTE = "Full rest before deadlift testing.";

const oneFiveDeadlift = (plus) => ({
  name: "1.5-rep deadlift (knee height)", sets: 3, reps: "3",
  percent: 0.60, plus,
  intensity: plus ? `60% + ${plus} lb` : "60%",
  notes: ONE_FIVE_DL_NOTE, isMain: true, lift: "deadlift"
});
const oneFiveDeadliftDeload = {
  name: "1.5-rep deadlift (knee height)", sets: 2, reps: "3",
  percent: 0.55, intensity: "55% — deload",
  notes: ONE_FIVE_DL_NOTE, isMain: true, lift: "deadlift"
};
const bentOverRow = { name: "Bent-over row", sets: 4, reps: "4-6", intensity: "RPE progression", notes: ROW_NOTE };

export const programData = [
  // Week 1
  {
    week: 1,
    phase: "Accumulation",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Back squat — top single", sets: 1, reps: "1", percent: 0.85, rpe: "7.5-8", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Back squat — back-off", sets: 4, reps: "4", percent: 0.70, rpe: 7, isMain: true, lift: "squat" },
        { name: "Bulgarian split squat", sets: 3, reps: "10/leg" },
        { name: "Seated leg curl", sets: 3, reps: "12" },
        { name: "Pallof press", sets: 3, reps: "10/side" },
        { name: "Standing calf raise", sets: 3, reps: "15" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench press", sets: 6, reps: "4", percent: 0.70, rpe: 7, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "6", rpe: 7 },
        { name: "Incline DB press", sets: 3, reps: "12" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 3, reps: "4", percent: 0.68, rpe: 7, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(0),
        { name: "Reverse hyper", sets: 2, reps: "15" },
        { name: "Jefferson curl", sets: 2, reps: "8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Tempo bench (3-1-1)", sets: 4, reps: "4", percent: 0.65, rpe: "6-7", isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "12" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "12" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 3, reps: "3", percent: 0.70, plus: 0, intensity: "70%", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" },
        { name: "Jefferson curl", sets: 1, reps: "8" }
      ] }
    ]
  },
  // Week 2
  {
    week: 2,
    phase: "Accumulation",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Back squat — top single", sets: 1, reps: "1", percent: 0.86, rpe: "7.5-8", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Back squat — back-off", sets: 5, reps: "4", percent: 0.73, rpe: 7, isMain: true, lift: "squat" },
        { name: "Bulgarian split squat", sets: 3, reps: "10/leg" },
        { name: "Leg curl", sets: 3, reps: "12" },
        { name: "Copenhagen plank", sets: 3, reps: "20sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench press", sets: 7, reps: "4", percent: 0.73, rpe: 7, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "6" },
        { name: "Incline DB press", sets: 3, reps: "12" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 3, reps: "4", percent: 0.72, rpe: 7, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(5),
        { name: "Reverse hyper", sets: 2, reps: "15" },
        { name: "Jefferson curl", sets: 2, reps: "8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Paused bench", sets: 4, reps: "3", percent: 0.70, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "12" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "12" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 3, reps: "5", percent: 0.70, plus: 5, intensity: "70% + 5 lb", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" }
      ] }
    ]
  },
  // Week 3
  {
    week: 3,
    phase: "Accumulation",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.87, rpe: "7.5-8", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 6, reps: "3", percent: 0.77, rpe: "7-8", isMain: true, lift: "squat" },
        { name: "Bulgarian split squat", sets: 3, reps: "8-10/leg" },
        { name: "Leg curl", sets: 3, reps: "12" },
        { name: "Copenhagen plank", sets: 3, reps: "30sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 7, reps: "4", percent: 0.76, rpe: "7-8", isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "5" },
        { name: "Incline DB press", sets: 3, reps: "10-12" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 4, reps: "3", percent: 0.76, rpe: "7-8", isMain: true, lift: "deadlift" },
        oneFiveDeadlift(10),
        { name: "Reverse hyper", sets: 2, reps: "15" },
        { name: "Jefferson curl", sets: 2, reps: "8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Spoto press", sets: 4, reps: "4", percent: 0.60, rpe: "6-7", isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "12" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "12" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 3, reps: "4", percent: 0.70, plus: 10, intensity: "70% + 10 lb", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" }
      ] }
    ]
  },
  // Week 4
  {
    week: 4,
    phase: "Accumulation Peak",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.87, rpe: "7.5-8", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 6, reps: "3", percent: 0.80, rpe: 8, isMain: true, lift: "squat" },
        { name: "Bulgarian split squat", sets: 2, reps: "8/leg" },
        { name: "Leg curl", sets: 3, reps: "10-12" },
        { name: "Copenhagen plank", sets: 3, reps: "30sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 8, reps: "3", percent: 0.80, rpe: 8, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "5" },
        { name: "Incline DB press", sets: 3, reps: "10" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 4, reps: "3", percent: 0.80, rpe: 8, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(15),
        { name: "Reverse hyper", sets: 2, reps: "15" },
        { name: "Jefferson curl", sets: 2, reps: "8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Tempo bench", sets: 4, reps: "3", percent: 0.65, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "10-12" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "12" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 3, reps: "3", percent: 0.70, plus: 15, intensity: "70% + 15 lb", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" }
      ] }
    ]
  },
  // Week 5
  {
    week: 5,
    phase: "Deload",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.60, rpe: "7-8 cap", notes: DELOAD_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 3, reps: "3", percent: 0.60, rpe: 6, isMain: true, lift: "squat" },
        { name: "Split squat", sets: 2, reps: "8/leg" },
        { name: "Leg curl", sets: 2, reps: "10" },
        { name: "Copenhagen plank", sets: 2, reps: "15sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 5, reps: "3", percent: 0.60, rpe: 6, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 2, reps: "5" },
        { name: "Incline DB press", sets: 2, reps: "10" },
        { name: "Face pull", sets: 2, reps: "15" },
        { name: "Pallof press", sets: 2, reps: "8/side" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 2, reps: "3", percent: 0.55, rpe: 6, isMain: true, lift: "deadlift" },
        oneFiveDeadliftDeload,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "Jefferson curl", sets: 1, reps: "6" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Light paused bench", sets: 3, reps: "3", percent: 0.55, rpe: 6, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 2, reps: "10" },
        { name: "Lateral raise", sets: 2, reps: "15" },
        { name: "Curl", sets: 2, reps: "10" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 2, reps: "3", percent: 0.55, intensity: "55% — deload", notes: SECONDARY_DELOAD_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 1, reps: "12" }
      ] }
    ]
  },
  // Week 6
  {
    week: 6,
    phase: "Intensification",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.90, rpe: "8 cap", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 5, reps: "3", percent: 0.83, rpe: 8, isMain: true, lift: "squat" },
        { name: "Bulgarian split squat", sets: 3, reps: "8" },
        { name: "Leg curl", sets: 3, reps: "10" },
        { name: "Copenhagen plank", sets: 3, reps: "20sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 7, reps: "3", percent: 0.83, rpe: 8, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "5" },
        { name: "Incline DB press", sets: 3, reps: "8-10" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 3, reps: "3", percent: 0.82, rpe: 8, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(25),
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "Jefferson curl", sets: 2, reps: "8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Spoto press", sets: 4, reps: "3", percent: 0.65, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "10" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "10-12" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "Paused squat", sets: 3, reps: "4", percent: 0.70, plus: 20, intensity: "70% + 20 lb (resume progression)", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" }
      ] }
    ]
  },
  // Week 7
  {
    week: 7,
    phase: "Intensification",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.92, rpe: "8 cap", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 5, reps: "2", percent: 0.87, rpe: 8, isMain: true, lift: "squat" },
        { name: "Split squat", sets: 2, reps: "8/leg" },
        { name: "Leg curl", sets: 3, reps: "10" },
        { name: "Copenhagen plank", sets: 3, reps: "20sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 8, reps: "2", percent: 0.87, rpe: 8, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "4-5" },
        { name: "Incline DB press", sets: 3, reps: "8" },
        { name: "Triceps pressdown", sets: 3, reps: "12" },
        { name: "Face pull", sets: 3, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 4, reps: "2", percent: 0.86, rpe: 8, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(30),
        { name: "Reverse hyper", sets: 2, reps: "10-12" },
        { name: "Jefferson curl", sets: 2, reps: "6-8" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Tempo bench", sets: 3, reps: "3", percent: 0.65, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "10" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "10" },
        { name: "Pallof press", sets: 3, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 3, reps: "3", percent: 0.75, plus: 0, intensity: "75%", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "10-12" },
        { name: "GHR or Nordic curl", sets: 3, reps: "8" }
      ] }
    ]
  },
  // Week 8
  {
    week: 8,
    phase: "Intensification",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.92, rpe: "8 cap", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 3, reps: "2", percent: 0.87, rpe: "8 cap", isMain: true, lift: "squat" },
        { name: "Split squat", sets: 2, reps: "8/leg" },
        { name: "Leg curl", sets: 2, reps: "10" },
        { name: "Copenhagen plank", sets: 3, reps: "15-20sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 7, reps: "2", percent: 0.90, rpe: "8-9", isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 3, reps: "4" },
        { name: "Incline DB press", sets: 2, reps: "8" },
        { name: "Triceps pressdown", sets: 2, reps: "12" },
        { name: "Face pull", sets: 2, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 3, reps: "2", percent: 0.89, rpe: "8-9", isMain: true, lift: "deadlift" },
        oneFiveDeadlift(35),
        { name: "Reverse hyper", sets: 2, reps: "10" },
        { name: "Jefferson curl", sets: 2, reps: "6" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Paused bench", sets: 3, reps: "2", percent: 0.70, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 3, reps: "10" },
        { name: "Lateral raise", sets: 3, reps: "15" },
        { name: "Curl", sets: 3, reps: "10" },
        { name: "Pallof press", sets: 2, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 2, reps: "3", percent: 0.75, plus: 5, intensity: "75% + 5 lb", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 2, reps: "10" },
        { name: "GHR or Nordic curl", sets: 2, reps: "8" }
      ] }
    ]
  },
  // Week 9
  {
    week: 9,
    phase: "Top of Intensification",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.92, rpe: "8 cap", notes: SQUAT_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 2, reps: "2", percent: 0.87, rpe: "8 cap", notes: "Reduce if needed", isMain: true, lift: "squat" },
        { name: "Split squat", sets: 2, reps: "8/leg" },
        { name: "Leg curl", sets: 2, reps: "10" },
        { name: "Copenhagen plank", sets: 3, reps: "15sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 6, reps: "2", percent: 0.88, rpe: "8-9", isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 2, reps: "4" },
        { name: "Incline DB press", sets: 2, reps: "8" },
        { name: "Triceps pressdown", sets: 2, reps: "12" },
        { name: "Face pull", sets: 2, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 2, reps: "2", percent: 0.88, rpe: "8-9", isMain: true, lift: "deadlift" },
        oneFiveDeadlift(40),
        { name: "Reverse hyper", sets: 1, reps: "10" },
        { name: "Jefferson curl", sets: 1, reps: "6" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Competition-style bench", sets: 3, reps: "2", percent: 0.83, rpe: "7-8", isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 2, reps: "10" },
        { name: "Lateral raise", sets: 2, reps: "15" },
        { name: "Curl", sets: 2, reps: "10" },
        { name: "Pallof press", sets: 2, reps: "10/side" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 2, reps: "2", percent: 0.75, plus: 10, intensity: "75% + 10 lb", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 1, reps: "10" },
        { name: "GHR or Nordic curl", sets: 2, reps: "8" }
      ] }
    ]
  },
  // Week 10
  {
    week: 10,
    phase: "Deload",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.60, rpe: "7-8 cap", notes: DELOAD_TOP_NOTE, isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 3, reps: "2", percent: 0.65, rpe: 6, notes: "Deload", isMain: true, lift: "squat" },
        { name: "Split squat", sets: 2, reps: "6-8/leg" },
        { name: "Leg curl", sets: 2, reps: "8" },
        { name: "Copenhagen plank", sets: 2, reps: "15sec/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 5, reps: "2", percent: 0.65, rpe: 6, isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 2, reps: "5" },
        { name: "Incline DB press", sets: 2, reps: "8" },
        { name: "Face pull", sets: 2, reps: "15" },
        { name: "Pallof press", sets: 2, reps: "8/side" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 2, reps: "2", percent: 0.60, rpe: 6, isMain: true, lift: "deadlift" },
        oneFiveDeadliftDeload,
        { name: "Reverse hyper", sets: 2, reps: "10" },
        { name: "Jefferson curl", sets: 1, reps: "6" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Light paused bench", sets: 3, reps: "2", percent: 0.60, rpe: 6, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 2, reps: "10" },
        { name: "Lateral raise", sets: 2, reps: "12-15" },
        { name: "Curl", sets: 2, reps: "10" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 2, reps: "2", percent: 0.60, intensity: "60% — deload", notes: SECONDARY_DELOAD_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 1, reps: "10" }
      ] }
    ]
  },
  // Week 11
  {
    week: 11,
    phase: "Peak / Realization",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.90, rpe: "8-9", isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 2, reps: "1", percent: 0.82, rpe: "6-7", notes: "Crisp", isMain: true, lift: "squat" },
        { name: "Copenhagen plank", sets: 2, reps: "15sec/side" },
        { name: "Pallof press", sets: 2, reps: "8/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench — top single", sets: 1, reps: "1", percent: 0.90, rpe: "8-9 cap", isMain: true, lift: "bench" },
        { name: "Bench — back-off", sets: 4, reps: "1", percent: 0.82, notes: "Crisp reps, stop if speed drops", isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 2, reps: "3" },
        { name: "Face pull", sets: 2, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 1, reps: "1", percent: 0.88, rpe: "8-9", isMain: true, lift: "deadlift" },
        oneFiveDeadlift(50),
        { name: "Reverse hyper", sets: 2, reps: "10" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Competition-style bench", sets: 2, reps: "2", percent: 0.75, rpe: 7, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 2, reps: "8-10" },
        { name: "Lateral raise", sets: 2, reps: "12-15" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 2, reps: "2", percent: 0.75, plus: 15, intensity: "75% + 15 lb (resume progression)", rpe: "≤8", notes: SECONDARY_SQUAT_NOTE, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 1, reps: "10" }
      ] }
    ]
  },
  // Week 12
  {
    week: 12,
    phase: "Taper",
    days: [
      { day: 1, notes: "Monday — Squat", exercises: [
        { name: "Squat — top single", sets: 1, reps: "1", percent: 0.80, rpe: "7 cap", notes: "Crisp only", isMain: true, lift: "squat" },
        { name: "Squat — back-off", sets: 2, reps: "1", percent: 0.82, rpe: "6-7", notes: "Taper volume", isMain: true, lift: "squat" },
        { name: "Pallof press", sets: 1, reps: "8/side" }
      ] },
      { day: 2, notes: "Tuesday — Bench", exercises: [
        { name: "Bench", sets: 5, reps: "1", percent: 0.85, rpe: "7-8", isMain: true, lift: "bench" },
        { name: "Close-grip bench", sets: 1, reps: "3", notes: "light" },
        { name: "Face pull", sets: 1, reps: "15" }
      ] },
      { day: 3, notes: "Thursday — Deadlift", exercises: [
        { name: "Deadlift", sets: 2, reps: "1", percent: 0.82, rpe: 7, isMain: true, lift: "deadlift" },
        oneFiveDeadlift(55),
        { name: "Reverse hyper", sets: 1, reps: "10" }
      ] },
      { day: 4, notes: "Friday — Bench variant / upper body", exercises: [
        { name: "Bench lockout support", sets: 2, reps: "3", percent: 0.65, isMain: true, lift: "bench" },
        { name: "Lat pulldown", sets: 1, reps: "8" }
      ] },
      { day: 5, notes: "Saturday — Squat variant + Bent-over row", exercises: [
        { name: "High-bar squat", sets: 2, reps: "3", percent: 0.60, isMain: true, lift: "squat" },
        bentOverRow,
        { name: "Reverse hyper", sets: 1, reps: "10" }
      ] }
    ]
  },
  // Week 13
  {
    week: 13,
    phase: "Testing",
    days: [
      { day: 1, notes: "Day 1 — Light activation", exercises: [
        { name: "Squat activation", sets: 2, reps: "3", percent: 0.50, rpe: "≤5", notes: "Crisp only", isMain: true, lift: "squat" },
        { name: "Bench activation", sets: 2, reps: "3", percent: 0.50, rpe: "≤5", notes: "Crisp only", isMain: true, lift: "bench" }
      ] },
      { day: 2, notes: "Day 2 — Bench PR test", exercises: [
        { name: "Bench PR attempts", sets: 3, reps: "1", percent: 0.90, intensity: "Opener ~90%", notes: "Opener ~90% of max; next attempts only if clean.", isMain: true, lift: "bench" }
      ] },
      { day: 3, notes: "Day 3 — Rest", exercises: [
        { name: "No lifting / recovery", isRest: true, notes: REST_NOTE }
      ] },
      { day: 4, notes: "Day 4 — Squat PR test", exercises: [
        { name: "Squat PR attempts", sets: 3, reps: "1", percent: 0.90, intensity: "Opener ~90%", notes: "At least 48h after bench; no forced grinder.", isMain: true, lift: "squat" }
      ] },
      { day: 5, notes: "Day 5 — Rest / recovery", exercises: [
        { name: "No lifting / recovery", isRest: true, notes: REST_NOTE }
      ] },
      { day: 6, notes: "Day 6 — Rest / full recovery", exercises: [
        { name: "No lifting", isRest: true, notes: PRE_DL_REST_NOTE }
      ] },
      { day: 7, notes: "Day 7 — Rest / full recovery", exercises: [
        { name: "No lifting", isRest: true, notes: PRE_DL_REST_NOTE }
      ] },
      { day: 8, notes: "Day 8 — Deadlift PR test", exercises: [
        { name: "Deadlift PR attempts", sets: 3, reps: "1", percent: 0.90, intensity: "Opener ~90%", notes: "At least 72h after squat; opener ~90% of max; attempt increases only if clean.", isMain: true, lift: "deadlift" }
      ] }
    ]
  }
];
