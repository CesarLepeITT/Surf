import { exercises as seedExercises, weeklyWorkouts, mobility } from './routines.js';

const clone = value => structuredClone(value);
const id = prefix => `${prefix}-${crypto.randomUUID()}`;
export const initialConfiguration = () => {
  const full = clone(weeklyWorkouts[0]);
  const running = clone(weeklyWorkouts[1]);
  const pool = clone(weeklyWorkouts[5]);
  const recovery = clone(weeklyWorkouts[6]);
  const stretch = clone(mobility);
  [full, running, pool, recovery, stretch].forEach(w => { w.id = `${w.id}-default`; w.defaultRestSeconds = w.restBetweenExercises ?? 45; w.days = []; w.exercises = w.exercises.map((item, order) => ({ ...item, id: id('workout-exercise'), order, enabled: true, mode: item.durationSeconds ? 'time' : item.exerciseId === 'lunges' ? 'reps-per-side' : 'reps', sets: 1, restSeconds: item.restSeconds ?? null, showInstructions: true, showAnimation: true })); });
  full.days = [0, 2, 4]; running.days = [1, 3]; pool.days = [5]; recovery.days = [6];
  return { exercises: clone(seedExercises).map(item => ({ ...item, aliases: [], primaryMuscles: item.muscleGroups || [], secondaryMuscles: [], source: 'built-in', mediaId: null, notes: '' })), media: [], workouts: [full, running, pool, recovery, stretch], schedule: [full.id, running.id, full.id, running.id, full.id, pool.id, recovery.id], presets: [] };
};
export const migrateConfiguration = saved => saved?.configuration || initialConfiguration();
export const validateExercise = exercise => !exercise.displayName?.trim() ? 'El nombre no puede estar vacío.' : null;
export const validateWorkout = workout => !workout.name?.trim() ? 'El nombre no puede estar vacío.' : Number(workout.rounds) < 1 ? 'Las rondas deben ser al menos 1.' : Number(workout.restBetweenRounds ?? 0) < 0 ? 'El descanso no puede ser negativo.' : null;
export const validateWorkoutExercise = item => { if (!item.exerciseId) return 'Selecciona un ejercicio.'; if (Number(item.sets) < 1) return 'Las series deben ser al menos 1.'; if (Number(item.restSeconds ?? 0) < 0) return 'El descanso no puede ser negativo.'; if (item.mode === 'time' && Number(item.durationSeconds) < 1) return 'La duración debe ser al menos 1 segundo.'; if ((item.mode === 'reps' || item.mode === 'reps-per-side') && (!item.repetitions || Number(item.repetitions) < 1)) return 'Las repeticiones deben ser al menos 1.'; return null; };
export const searchExercises = (exercises, query) => { const q=query.trim().toLowerCase(); if(!q) return exercises; return exercises.filter(e => [e.displayName,e.name,...(e.aliases||[]),...(e.primaryMuscles||e.muscleGroups||[]),...(e.secondaryMuscles||[]),...(e.equipment||[]),e.category].filter(Boolean).join(' ').toLowerCase().includes(q)); };
export const upsertExercise = (config, draft) => { const error=validateExercise(draft);if(error)throw new Error(error); const item={...draft,id:draft.id||id('exercise'),name:draft.name||draft.displayName.toLowerCase().replace(/[^a-z0-9]+/gi,'-'),aliases:draft.aliases||[],primaryMuscles:draft.primaryMuscles||[],secondaryMuscles:draft.secondaryMuscles||[],equipment:draft.equipment||[]}; const exercises=config.exercises.some(e=>e.id===item.id)?config.exercises.map(e=>e.id===item.id?item:e):[...config.exercises,item];return {...config,exercises}; };
export const deleteExercise = (config, exerciseId) => { const removed=config.exercises.find(e=>e.id===exerciseId);const workouts=config.workouts.map(w=>({...w,exercises:w.exercises.filter(x=>x.exerciseId!==exerciseId)}));const liveMedia=new Set(config.exercises.filter(e=>e.id!==exerciseId).map(e=>e.mediaId).filter(Boolean));return {...config,exercises:config.exercises.filter(e=>e.id!==exerciseId),workouts,media:config.media.filter(m=>m.source!=='custom'||m.id!==removed?.mediaId||liveMedia.has(m.id))}; };
export const exerciseUsage = (config, exerciseId) => config.workouts.filter(w=>w.exercises.some(x=>x.exerciseId===exerciseId)).map(w=>w.name);
export const upsertWorkout = (config,draft) => { const error=validateWorkout(draft);if(error)throw new Error(error);const item={...draft,id:draft.id||id('workout'),rounds:Number(draft.rounds),defaultRestSeconds:Number(draft.defaultRestSeconds||0),restBetweenRounds:Number(draft.restBetweenRounds||0),exercises:(draft.exercises||[]).map((x,order)=>({...x,id:x.id||id('workout-exercise'),order}))};const exists=config.workouts.some(w=>w.id===item.id);return {...config,workouts:exists?config.workouts.map(w=>w.id===item.id?item:w):[...config.workouts,item]}; };
export const duplicateWorkout = (config, workoutId) => {const source=config.workouts.find(w=>w.id===workoutId);const copy=clone(source);copy.id=id('workout');copy.name=`${source.name} Copy`;copy.days=[];copy.exercises=copy.exercises.map((x,order)=>({...x,id:id('workout-exercise'),order}));return {...config,workouts:[...config.workouts,copy]};};
export const deleteWorkout = (config, workoutId) => ({...config,workouts:config.workouts.filter(w=>w.id!==workoutId),schedule:config.schedule.map(id=>id===workoutId?null:id)});
export const reorderWorkoutExercise = (workout, from, to) => { const items=[...workout.exercises];const [moved]=items.splice(from,1);items.splice(to,0,moved);return {...workout,exercises:items.map((x,order)=>({...x,order}))}; };
export const workoutForDate = (config,date) => config.workouts.find(w=>w.id===config.schedule[(date.getDay()+6)%7]) || null;
export const snapshotWorkout = (config, workout) => ({...clone(workout),exercises:workout.exercises.filter(x=>x.enabled!==false).map(x=>({...x,exercise:clone(config.exercises.find(e=>e.id===x.exerciseId))}))});
