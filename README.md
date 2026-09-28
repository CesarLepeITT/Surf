# Entrena — entrenador personal local

Aplicación web instalable, sin cuentas ni servidor, para guiar la rutina semanal personal. Los datos de sesiones y preferencias se guardan en `localStorage`; funciona sin red una vez instalada gracias al *service worker*.

## Decisión técnica

Se eligió una PWA estática con JavaScript estándar en vez de un backend o una arquitectura de estado compleja: se puede instalar desde un navegador móvil, es offline y el catálogo/rutina se modifica en archivos pequeños. La interfaz de notificaciones usa el API local del navegador; los recordatorios sólo pueden entregarse mientras la aplicación está abierta en navegadores web. Para recordatorios garantizados con la app cerrada, el mismo diseño permite añadir después un adaptador nativo (por ejemplo Capacitor) sin cambiar los modelos ni la UI.

## Ejecutar y probar

```bash
python3 -m http.server 4173
# Abrir http://localhost:4173
node --test tests/*.test.js
```

Para probar el modo offline, abra la app una vez, use el menú del navegador para instalarla y luego desactive la red. Las notificaciones necesitan permiso del sistema y la pestaña abierta para esta versión web.

## Dataset y atribución

El análisis remoto del repositorio `hasaneyldrm/exercises-dataset` no pudo completarse en este entorno: GitHub devolvió `CONNECT tunnel failed, response 403`. Por ello no se incluyeron GIFs, datos ni licencias no verificados y **no se adivinaron** rutas, campos o licencias.

`scripts/import-exercises-dataset.mjs` inspecciona una copia local del repositorio, busca documentos JSON, resuelve los candidatos declarados en `src/exercise-mapping.js`, copia exclusivamente los GIF/thumbnail referenciados y genera `src/generated-exercise-catalog.js` y `public/exercises/ATTRIBUTION.md`. Antes de distribuir, ejecútelo contra una clonación accesible y revise los mapeos que el script no pueda resolver:

```bash
node scripts/import-exercises-dataset.mjs /ruta/a/exercises-dataset
```

La pantalla **Acerca de** muestra la atribución generada. Hasta realizar la importación, la app usa tarjetas de ejercicio sin animación y lo indica claramente.

## Editar tu plan

En la pestaña **Editar** puedes crear, buscar, editar y eliminar ejercicios; definir nombre alternativo, instrucciones, músculos, equipo y notas; y cargar un GIF/WebP propio. El archivo se convierte a datos locales persistidos dentro de la aplicación, no se conserva una ruta del dispositivo. También puedes crear, duplicar y eliminar rutinas, reordenar ejercicios arrastrando, configurar el modo (repeticiones, por lado, tiempo, distancia o libre), series, descansos y rondas, y asignar las rutinas o un día libre en el calendario semanal.

Las sesiones guardan un *snapshot* de la rutina y de cada ejercicio al iniciarse, de modo que una modificación futura no cambia el historial. Desde Ajustes se puede exportar la configuración completa en JSON o restaurar el plan inicial. Los GIFs personalizados están limitados a 5 MB por las cuotas de almacenamiento habituales del navegador.
