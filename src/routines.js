import { exercise, workout, workoutExercise } from './models.js';

export const exercises = [
  exercise('push-ups', 'Push-ups', { muscleGroups: ['Pecho', 'Hombros', 'Tríceps'] }), exercise('air-squats', 'Air Squats', { muscleGroups: ['Piernas', 'Glúteos'] }),
  exercise('plank-shoulder-taps', 'Plank Shoulder Taps', { muscleGroups: ['Core', 'Hombros'] }), exercise('lunges', 'Lunges', { muscleGroups: ['Cuádriceps', 'Glúteos'] }), exercise('supermans', 'Supermans', { muscleGroups: ['Zona lumbar', 'Espalda alta'] }),
  exercise('cat-cow', 'Cat-Cow'), exercise('childs-pose', "Child's Pose"), exercise('lizard-pose', 'Lizard Pose'), exercise('hip-flexor-lunge-stretch', 'Hip Flexor Lunge Stretch'), exercise('90-90-stretch', '90/90 Stretch'), exercise('sumo-squat-stretch', 'Sumo Squat Stretch'), exercise('deep-squat-stretch', 'Deep Squat Stretch'), exercise('toe-touch', 'Toe Touch'), exercise('pigeon-pose', 'Pigeon Pose'), exercise('seated-forward-fold', 'Seated Forward Fold')
];
const fullBodyExercises = () => [workoutExercise('push-ups',{repetitions:'10–12'}),workoutExercise('air-squats',{repetitions:'15'}),workoutExercise('plank-shoulder-taps',{durationSeconds:30}),workoutExercise('lunges',{repetitions:'10 por pierna · 20 total'}),workoutExercise('supermans',{repetitions:'12',notes:'Pausa 1 segundo arriba'})];
export const mobility = workout('mobility', 'Mobility & Stretching', 'movilidad', { exercises:['cat-cow','childs-pose','lizard-pose','hip-flexor-lunge-stretch','90-90-stretch','sumo-squat-stretch','deep-squat-stretch','toe-touch','pigeon-pose','seated-forward-fold'].map(id=>workoutExercise(id,{durationSeconds:30,notes:id.includes('lizard')||id.includes('flexor')||id.includes('90')||id.includes('pigeon')?'Por lado':''})) });
export const weeklyWorkouts = [
  workout('full-body','Full Body','fuerza',{rounds:3, exercises:fullBodyExercises(), restBetweenExercises:45, restBetweenRounds:60}),
  workout('running','Running','running',{description:'Correr y mantener el ritmo habitual.',isActivity:true}),
  workout('full-body','Full Body','fuerza',{rounds:3, exercises:fullBodyExercises(),restBetweenExercises:45,restBetweenRounds:60}),
  workout('running','Running','running',{description:'Correr y mantener el ritmo habitual.',isActivity:true}),
  workout('full-body','Full Body','fuerza',{rounds:3, exercises:fullBodyExercises(),restBetweenExercises:45,restBetweenRounds:60}),
  workout('pool','Piscina','piscina',{description:'Practica en alberca: confianza con el agua y flotación.',isActivity:true}),
  workout('pool-recovery','Piscina / recuperación','piscina',{description:'Alberca, flotación, recuperación y movilidad opcional.',isActivity:true})
];
export const workoutForDate = date => weeklyWorkouts[(date.getDay()+6)%7];
export const nextWorkoutForDate = date => workoutForDate(new Date(date.getFullYear(),date.getMonth(),date.getDate()+1));
export const dateKey = date => date.toISOString().slice(0,10);
export const weeklyProgress = (sessions, date = new Date()) => { const monday=new Date(date); monday.setDate(date.getDate()-((date.getDay()+6)%7)); monday.setHours(0,0,0,0); const keys=new Set(sessions.filter(s=>s.completedAt&&new Date(s.completedAt)>=monday).map(s=>s.date)); return {completed:keys.size,total:5}; };
export const getExercise = id => exercises.find(item=>item.id===id);
