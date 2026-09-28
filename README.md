# Entrena — entrenador personal local

Aplicación web instalable, sin cuentas ni servidor, para guiar la rutina semanal personal. La rutina (rutinas, ejercicios y días asignados) se edita desde la pestaña **Editor** y se guarda en `localStorage` junto con las sesiones y preferencias; funciona sin red una vez instalada gracias al *service worker*.

## Decisión técnica

Se eligió una PWA estática con JavaScript estándar en vez de un backend o una arquitectura de estado compleja: se puede instalar desde un navegador móvil, es offline y el catálogo/rutina se modifica en archivos pequeños. La interfaz de notificaciones usa el API local del navegador; los recordatorios sólo pueden entregarse mientras la aplicación está abierta en navegadores web. Para recordatorios garantizados con la app cerrada, el mismo diseño permite añadir después un adaptador nativo (por ejemplo Capacitor) sin cambiar los modelos ni la UI.

## Ejecutar y probar

```bash
python3 -m http.server 4173
# Abrir http://localhost:4173
node --test tests/*.test.js
```

Para probar el modo offline, abra la app una vez, use el menú del navegador para instalarla y luego desactive la red. Las notificaciones necesitan permiso del sistema y la pestaña abierta para esta versión web.

El *service worker* consulta la red primero y sólo cae a la caché cuando no hay conexión, así que una recarga siempre trae la versión actual y no hace falta subir nada a mano. Si una app instalada se queda atrás, cierre todas sus pestañas y vuelva a abrirla, o borre los datos del sitio en el navegador.

## Editar la rutina

En la pestaña **Editor**:

- **Rutinas**: crear, renombrar, duplicar y borrar rutinas; reordenar sus ejercicios y ajustar series, repeticiones, duración, descanso y notas de cada uno; añadirlos desde el buscador del catálogo. Un día puede quedar libre (descanso) y la misma rutina puede ocupar varios días. Toca un día de la semana para asignarle o quitarle una rutina.
- **Ejercicios**: catálogo con buscador por nombre, músculo, equipo o alias. Al borrar un ejercicio en uso se avisa de en qué rutinas aparecerá y se quita de todas ellas.
- **Restaurar rutina inicial** devuelve el catálogo y la semana a la semilla y descarta los cambios.

Cada cambio se guarda al instante en este dispositivo: no hay nube ni sincronización, y «Exportar historial» sólo cubre las sesiones completadas.

## Dataset y atribución

El análisis remoto del repositorio `hasaneyldrm/exercises-dataset` no pudo completarse en este entorno: GitHub devolvió `CONNECT tunnel failed, response 403`. Por ello no se incluyeron GIFs, datos ni licencias no verificados y **no se adivinaron** rutas, campos o licencias.

`scripts/import-exercises-dataset.mjs` inspecciona una copia local del repositorio, busca documentos JSON, resuelve los candidatos declarados en `src/exercise-mapping.js`, copia exclusivamente los GIF/thumbnail referenciados y genera `src/generated-exercise-catalog.js` y `public/exercises/ATTRIBUTION.md`. Antes de distribuir, ejecútelo contra una clonación accesible y revise los mapeos que el script no pueda resolver:

```bash
node scripts/import-exercises-dataset.mjs /ruta/a/exercises-dataset
```

La pantalla **Acerca de** muestra la atribución generada. Hasta realizar la importación, la app usa tarjetas de ejercicio sin animación y lo indica claramente.
