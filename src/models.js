/** Dataset-independent domain factories. */
export const exercise = (id, displayName, details = {}) => ({ id, name: id, displayName, gifPath: null, thumbnailPath: null, instructions: [], muscleGroups: [], equipment: [], ...details });
export const workoutExercise = (exerciseId, options = {}) => ({ exerciseId, sets: 1, repetitions: null, durationSeconds: null, restSeconds: null, notes: '', ...options });
export const workout = (id, name, type, options = {}) => ({ id, name, type, exercises: [], rounds: 1, ...options });
export const exerciseSession = (exerciseId, options = {}) => ({ exerciseId, completed: false, repetitions: null, duration: 0, ...options });
export const workoutSession = (workoutId, options = {}) => ({ id: crypto.randomUUID(), workoutId, startedAt: new Date().toISOString(), completedAt: null, completedExercises: [], ...options });
