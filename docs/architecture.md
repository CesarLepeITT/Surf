# Arquitectura

## Límites

La app no tiene API, autenticación, cuentas ni sincronización. La rutina editeda por el usuario vive en `state.configuration` (almacenamiento local) y se crea a partir de la semilla de `src/routines.js` la primera vez, o al pulsar «Restaurar rutina inicial». `src/editor.js` es el único módulo que modifica esa configuración; la UI no la muta directamente. `src/routines.js` sólo aporta la semilla y la selección por día. `src/exercise-mapping.js` es el límite entre los nombres de producto y el dataset externo. Los modelos usados en sesión y almacenamiento no dependen de su formato.

Una sesión en curso trabaja sobre una instantánea (`snapshotWorkout`) de la rutina: editar la rutina después de empezar no altera lo que se está entrenando.

## Módulos

- `src/models.js`: tipos de datos independientes (`Exercise`, `Workout`, `WorkoutExercise`, `WorkoutSession` y `ExerciseSession`).
- `src/routines.js`: semilla de la semana, bloque de movilidad y selección por día.
- `src/editor.js`: reglas de la configuración editable (validación, alta/edición/baja, duplicado, orden, calendario y migración).
- `src/editor-view.js`: pantallas del editor (rutinas, catálogo de ejercicios y semana). Recibe un contexto con `shell`, `getConfig`, `commit` y `render`; no importa `app.js`.
- `src/dom.js`: helpers de presentación compartidos por `app.js` y `editor-view.js` (escape de HTML e iconos).
- `src/storage.js`: persistencia/versionado local, migración de `configuration`, historial, preferencias y estadísticas.
- `src/timer.js`: temporizador reutilizable, pausado y testeable.
- `src/notifications.js`: permiso, configuración y recordatorio local del navegador.
- `src/app.js`: renderizado y orquestación de las pantallas de entrenamiento.

El `service-worker.js` almacena el shell de la aplicación. No almacena datos personales: éstos permanecen en el almacenamiento local del dispositivo. Pide la red primero y usa la caché sólo como respaldo (incluida `/index.html` para navegaciones sin conexión), de modo que una recarga trae siempre la versión vigente. En `install` llama a `skipWaiting()` para que una versión nueva tome el control de inmediato y en `activate` borra toda caché que no sea la vigente, para que un shell antiguo deje de servirse. `tests/service-worker.test.js` vigila ambas cosas.

## Mapeo del dataset

Los identificadores de rutina son estables (por ejemplo `push-ups`) y los candidatos de importación están explícitos en `src/exercise-mapping.js`. Los candidatos son nombres de búsqueda, no una afirmación sobre archivos o IDs del repositorio. El importador compara campos de texto encontrados en JSON y sólo genera una asignación si halla una coincidencia; de lo contrario deja constancia en la salida y conserva la tarjeta local.

Esto evita acoplar la aplicación a una estructura que no se ha podido verificar y evita descargas en tiempo de uso.
