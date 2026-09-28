# Arquitectura

## Límites

La app no tiene API, autenticación, cuentas ni sincronización. `src/routines.js` es la única fuente de la rutina semanal y del bloque reutilizable de movilidad. `src/exercise-mapping.js` es el límite entre los nombres de producto y el dataset externo. Los modelos usados en sesión y almacenamiento no dependen de su formato.

## Módulos

- `src/models.js`: tipos de datos independientes (`Exercise`, `Workout`, `WorkoutExercise`, `WorkoutSession` y `ExerciseSession`).
- `src/routines.js`: selección por día, siguiente entrenamiento y progreso semanal.
- `src/storage.js`: persistencia/versionado local, historial, preferencias y estadísticas.
- `src/timer.js`: temporizador reutilizable, pausado y testeable.
- `src/notifications.js`: permiso, configuración y recordatorio local del navegador.
- `src/app.js`: renderizado y orquestación de las pantallas.

El `service-worker.js` almacena el shell de la aplicación. No almacena datos personales: éstos permanecen en el almacenamiento local del dispositivo.

## Mapeo del dataset

Los identificadores de rutina son estables (por ejemplo `push-ups`) y los candidatos de importación están explícitos en `src/exercise-mapping.js`. Los candidatos son nombres de búsqueda, no una afirmación sobre archivos o IDs del repositorio. El importador compara campos de texto encontrados en JSON y sólo genera una asignación si halla una coincidencia; de lo contrario deja constancia en la salida y conserva la tarjeta local.

Esto evita acoplar la aplicación a una estructura que no se ha podido verificar y evita descargas en tiempo de uso.
