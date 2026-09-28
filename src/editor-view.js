import { searchExercises, exerciseUsage, reorderWorkoutExercise, upsertWorkout, upsertExercise, deleteExercise, deleteWorkout, duplicateWorkout, setScheduleWorkout, scheduledDays, normalizedSchedule, initialConfiguration } from './editor.js';
import { esc, iconFor as emoji } from './dom.js';

const TYPES=['fuerza','running','piscina','movilidad'], DAYS='LMXJVSD';
let ui={tab:'workouts',draft:null,exercise:null,query:'',error:''};

const ebutton=(text,kind,secondary=true,extra='')=>`<button class="${secondary?'secondary':''}" data-edit="${kind}" ${extra}>${text}</button>`;
const field=(label,control)=>`<label class="field">${label} ${control}</label>`;
const numberField=(label,key,value,min=0)=>field(label,`<input data-field="${key}" type="number" min="${min}" value="${esc(value??'')}">`);
const list=value=>String(value??'').split(',').map(part=>part.trim()).filter(Boolean);
const uid=prefix=>`${prefix}-${crypto.randomUUID()}`;
const newItem=exerciseId=>({id:uid('workout-exercise'),exerciseId,order:0,enabled:true,mode:'reps',sets:1,repetitions:'10',durationSeconds:null,restSeconds:null,notes:'',showInstructions:true,showAnimation:true});
const blankWorkout=()=>({name:'Nueva rutina',type:'fuerza',description:'',isActivity:false,rounds:1,defaultRestSeconds:45,restBetweenRounds:60,exercises:[]});
const blankExercise=()=>({displayName:'',name:'',aliases:[],primaryMuscles:[],secondaryMuscles:[],equipment:[],notes:'',instructions:[]});
const notice=()=>ui.error?`<section class="error">${esc(ui.error)}</section>`:'';
const exerciseName=(config,id)=>config.exercises.find(e=>e.id===id)?.displayName||id;
const itemSummary=item=>item.mode==='time'?`${item.durationSeconds||0} s`:`${item.repetitions||'–'}${item.mode==='reps-per-side'?' por lado':''} · ${item.sets} ${item.sets>1?'series':'serie'}${item.restSeconds?` · ${item.restSeconds} s descanso`:''}`;
const readItem=scope=>({mode:scope.querySelector('[data-field="mode"]').value,sets:scope.querySelector('[data-field="sets"]').value,repetitions:scope.querySelector('[data-field="repetitions"]').value||null,durationSeconds:scope.querySelector('[data-field="durationSeconds"]').value===''?null:scope.querySelector('[data-field="durationSeconds"]').value,restSeconds:scope.querySelector('[data-field="restSeconds"]').value===''?null:scope.querySelector('[data-field="restSeconds"]').value,notes:scope.querySelector('[data-field="notes"]').value});

function workoutRows(ctx){
  const config=ctx.getConfig();
  const rows=config.workouts.map(w=>{const days=scheduledDays(config,w.id).map(day=>DAYS[day]).join(' ')||'sin días asignados';
    return `<div class="row"><div class="row-main"><b>${emoji(w.type)} ${esc(w.name)}</b><span>${esc(w.type)} · ${w.isActivity?'actividad libre':`${w.exercises.length} ejercicios · ${w.rounds} ${w.rounds>1?'rondas':'ronda'}`}</span><span>Días: ${days}</span></div><div class="row-actions">${ebutton('Editar','workout-edit',true,`data-id="${esc(w.id)}"`)}${ebutton('Duplicar','workout-duplicate',true,`data-id="${esc(w.id)}"`)}${ebutton('Borrar','workout-delete',true,`data-id="${esc(w.id)}"`)}</div></div>`;});
  return rows.join('')||'<p class="hint">No hay rutinas todavía.</p>';
}

function dayRow(config,day){
  const workout=config.workouts.find(w=>w.id===normalizedSchedule(config.schedule)[day]);
  return `<button class="day ${workout?'today':''}" data-edit="day-toggle" data-index="${day}"><b>${DAYS[day]}</b><span>${workout?emoji(workout.type):'—'}</span><small>${workout?esc(workout.name):'libre'}</small></button>`;
}

function exerciseRows(ctx){
  const found=searchExercises(ctx.getConfig().exercises,ui.query);
  if(!found.length)return `<p class="hint">${ui.query?'Sin resultados.':'No hay ejercicios todavía.'}</p>`;
  return found.map(e=>`<div class="row"><div class="row-main"><b>${esc(e.displayName)}</b><span>${esc([...(e.primaryMuscles||[]),...(e.secondaryMuscles||[])].join(' · ')||'sin músculos definidos')}</span><span>${esc((e.aliases||[]).join(', ')||e.id)}</span></div><div class="row-actions">${ebutton('Editar','exercise-edit',true,`data-id="${esc(e.id)}"`)}${ebutton('Borrar','exercise-delete',true,`data-id="${esc(e.id)}"`)}</div></div>`).join('');
}

function editorHome(ctx){
  ctx.shell(`<div id="ed-root">
    <header><p class="eyebrow">EDITOR</p><h1>Tu rutina</h1></header>
    <section class="seg">${ebutton('Rutinas','tab-workouts',true,ui.tab==='workouts'?'data-active="1"':'')}${ebutton('Ejercicios','tab-exercises',true,ui.tab==='exercises'?'data-active="1"':'')}</section>
    ${notice()}
    ${ui.tab==='workouts'?`<section><h2>Semana</h2><p class="hint">Toca un día para asignarle o quitarle una rutina. Puedes repetir la misma rutina varios días.</p><div class="week">${[0,1,2,3,4,5,6].map(day=>dayRow(ctx.getConfig(),day)).join('')}</div></section>
      <section><h2>Rutinas</h2>${workoutRows(ctx)}${ebutton('+ Nueva rutina','workout-new')}</section>
      <section><h2>Zona de riesgo</h2><p class="hint">Vuelve al catálogo y a la semana iniciales, y descarta todos tus cambios.</p>${ebutton('Restaurar rutina inicial','config-reset')}</section>`
    :`<section><h2>Ejercicios</h2>${field('Buscar',`<input id="ex-search" type="search" value="${esc(ui.query)}" placeholder="nombre, músculo o equipo">`)}<div id="ex-list">${exerciseRows(ctx)}</div>${ebutton('+ Nuevo ejercicio','exercise-new')}</section>`}
  </div>`);
  const root=document.querySelector('#ed-root');
  root.addEventListener('click',event=>{const target=event.target.closest('[data-edit]');if(target)homeAction(ctx,target);});
  const search=document.querySelector('#ex-search');
  if(search)search.oninput=()=>{ui.query=search.value;document.querySelector('#ex-list').innerHTML=exerciseRows(ctx);};
}

function homeAction(ctx,target){
  const {edit,id,index}=target.dataset, config=ctx.getConfig();
  if(edit==='tab-workouts'||edit==='tab-exercises'){ui={...ui,tab:edit==='tab-workouts'?'workouts':'exercises',error:''};return ctx.render();}
  if(edit==='workout-new'){ui={...ui,draft:blankWorkout(),error:''};return ctx.render();}
  if(edit==='workout-edit'){ui={...ui,draft:structuredClone(config.workouts.find(w=>w.id===id)),error:''};return ctx.render();}
  if(edit==='workout-duplicate')return ctx.commit(duplicateWorkout(config,id));
  if(edit==='workout-delete'){const days=scheduledDays(config,id).map(day=>DAYS[day]).join(' ')||'ningún día';if(confirm(`¿Borrar esta rutina? Dejará de aparecer en ${days}.`))ctx.commit(deleteWorkout(config,id));return;}
  if(edit==='day-toggle')return assignDay(ctx,+index);
  if(edit==='exercise-new'){ui={...ui,exercise:blankExercise(),error:''};return ctx.render();}
  if(edit==='exercise-edit'){ui={...ui,exercise:structuredClone(config.exercises.find(e=>e.id===id)),error:''};return ctx.render();}
  if(edit==='exercise-delete'){const exercise=config.exercises.find(e=>e.id===id),used=exerciseUsage(config,id);if(confirm(`¿Borrar "${exercise.displayName}"?${used.length?`\n\nSe quitará de: ${used.join(', ')}.`:''}`))ctx.commit(deleteExercise(config,id));return;}
  if(edit==='config-reset'&&confirm('¿Restaurar la rutina inicial? Se pierden tus rutinas, ejercicios y asignaciones.'))ctx.commit(initialConfiguration());
}

function assignDay(ctx,day){
  const config=ctx.getConfig(), current=normalizedSchedule(config.schedule)[day];
  if(current){if(confirm(`¿Dejar ${DAYS[day]} sin rutina?`))ctx.commit(setScheduleWorkout(config,day,null));return;}
  if(!config.workouts.length)return alert('Primero crea una rutina.');
  const answer=prompt(`¿Qué rutina asignas a ${DAYS[day]}?\n\n${config.workouts.map(w=>`- ${w.name} (${w.type})`).join('\n')}`,config.workouts[0].name);
  if(answer===null)return;
  const match=config.workouts.find(w=>answer.trim().toLowerCase()===w.name.trim().toLowerCase())||config.workouts.find(w=>answer.trim().toLowerCase()===`${w.name} (${w.type})`.toLowerCase());
  if(!match)return alert('Ninguna rutina coincide con ese nombre.');
  ctx.commit(setScheduleWorkout(config,day,match.id));
}

function itemRow(config,item,index){
  return `<div class="row item" data-index="${index}"><div class="row-main"><b>${index+1}. ${esc(exerciseName(config,item.exerciseId))}</b><span>${esc(itemSummary(item))}</span></div>
    <div class="row-actions">${ebutton('↑','item-up',true,`data-index="${index}"`)}${ebutton('↓','item-down',true,`data-index="${index}"`)}${ebutton('✕','item-remove',true,`data-index="${index}"`)}</div>
    <div class="item-fields">
      ${field('Modo',`<select data-field="mode">${[['reps','Repeticiones'],['reps-per-side','Por lado'],['time','Tiempo']].map(([value,label])=>`<option value="${value}" ${item.mode===value?'selected':''}>${label}</option>`).join('')}</select>`)}
      ${field('Series',`<input data-field="sets" type="number" min="1" value="${esc(item.sets)}">`)}
      ${field('Repeticiones',`<input data-field="repetitions" value="${esc(item.repetitions??'')}" placeholder="10 o 10-12">`)}
      ${field('Duración (s)',`<input data-field="durationSeconds" type="number" min="0" value="${esc(item.durationSeconds??'')}">`)}
      ${field('Descanso (s)',`<input data-field="restSeconds" type="number" min="0" value="${esc(item.restSeconds??'')}">`)}
      ${field('Notas',`<input data-field="notes" value="${esc(item.notes??'')}" placeholder="opcional">`)}
    </div></div>`;
}

function workoutEditor(ctx){
  const draft=ui.draft;
  ctx.shell(`<div id="ed-root">
    <header><button class="back" data-edit="close">← Editor</button><p class="eyebrow">${draft.id?'EDITAR RUTINA':'NUEVA RUTINA'}</p><h1>${esc(draft.name||'Sin nombre')}</h1></header>
    ${notice()}
    <section>
      ${field('Nombre',`<input data-field="name" value="${esc(draft.name)}" placeholder="Full Body">`)}
      ${field('Tipo',`<select data-field="type">${TYPES.map(type=>`<option value="${type}" ${draft.type===type?'selected':''}>${type}</option>`).join('')}</select>`)}
      ${field('Descripción',`<input data-field="description" value="${esc(draft.description??'')}" placeholder="opcional">`)}
      ${numberField('Rondas','rounds',draft.rounds,1)}
      ${numberField('Descanso entre ejercicios (s)','defaultRestSeconds',draft.defaultRestSeconds)}
      ${numberField('Descanso entre rondas (s)','restBetweenRounds',draft.restBetweenRounds)}
    </section>
    <section><h2>Ejercicios (${draft.exercises.length})</h2>${draft.exercises.map((item,index)=>itemRow(ctx.getConfig(),item,index)).join('')||'<p class="hint">Añade ejercicios con el buscador de abajo.</p>'}
      ${field('Añadir ejercicio',`<input id="w-search" type="search" value="${esc(ui.query)}" placeholder="Buscar en el catálogo">`)}
      <div id="w-picker" class="picker"></div>
    </section>
    <section>${ebutton('Guardar rutina','save',false)}${ebutton('Cancelar','close')}</section>
  </div>`);
  const root=document.querySelector('#ed-root');
  const read=key=>root.querySelector(`[data-field="${key}"]`).value;
  const sync=()=>{const d=ui.draft;d.name=read('name');d.type=read('type');d.description=read('description');d.rounds=read('rounds');d.defaultRestSeconds=read('defaultRestSeconds');d.restBetweenRounds=read('restBetweenRounds');d.exercises=d.exercises.map((item,position)=>({...item,...readItem(root.querySelector(`.item[data-index="${position}"]`))}));};
  root.addEventListener('input',event=>{if(event.target.id!=='w-search')sync();});
  const search=document.querySelector('#w-search');
  const paint=()=>{const used=new Set(ui.draft.exercises.map(item=>item.exerciseId));const options=searchExercises(ctx.getConfig().exercises,search.value).filter(e=>!used.has(e.id)).slice(0,8);document.querySelector('#w-picker').innerHTML=options.map(e=>ebutton(`+ ${esc(e.displayName)}`,'item-add',true,`data-id="${esc(e.id)}"`)).join('')||'<p class="hint">Sin resultados.</p>';};
  search.oninput=()=>{ui.query=search.value;paint();};
  paint();
  root.addEventListener('click',event=>{const target=event.target.closest('[data-edit]');if(target){sync();draftAction(ctx,target);}});
}

function draftAction(ctx,target){
  const edit=target.dataset.edit, draft=ui.draft, at=+target.dataset.index;
  if(edit==='close'){ui={...ui,draft:null,error:'',query:''};return ctx.render();}
  if(edit==='item-add')ui.draft={...draft,exercises:[...draft.exercises,newItem(target.dataset.id)]};
  else if(edit==='item-up'&&at>0)ui.draft=reorderWorkoutExercise(draft,at,at-1);
  else if(edit==='item-down'&&at<draft.exercises.length-1)ui.draft=reorderWorkoutExercise(draft,at,at+1);
  else if(edit==='item-remove')ui.draft={...draft,exercises:draft.exercises.filter((_,position)=>position!==at)};
  else if(edit==='save'){ui.error='';try{const saved=upsertWorkout(ctx.getConfig(),draft);ui={...ui,draft:null,query:''};return ctx.commit(saved);}catch(error){ui={...ui,error:error.message};return ctx.render();}}
  else return;
  return ctx.render();
}

function exerciseEditor(ctx){
  const exercise=ui.exercise;
  const muscles=key=>field(key==='aliases'?'Alias (separados por coma)':key==='primaryMuscles'?'Músculos principales':key==='secondaryMuscles'?'Músculos secundarios':'Equipo',`<input data-field="${key}" value="${esc(list(exercise[key]).join(', '))}">`);
  ctx.shell(`<div id="ed-root">
    <header><button class="back" data-edit="close">← Editor</button><p class="eyebrow">${exercise.id?'EDITAR EJERCICIO':'NUEVO EJERCICIO'}</p><h1>${esc(exercise.displayName||'Sin nombre')}</h1></header>
    ${notice()}
    <section>
      ${field('Nombre',`<input data-field="displayName" value="${esc(exercise.displayName)}" placeholder="Band Row">`)}
      ${muscles('primaryMuscles')}${muscles('secondaryMuscles')}${muscles('equipment')}${muscles('aliases')}
      ${field('Notas',`<input data-field="notes" value="${esc(exercise.notes??'')}" placeholder="opcional">`)}
      <p class="hint">${exercise.id?`ID interno: ${esc(exercise.id)}`:'Al guardar se genera un ID interno.'}</p>
    </section>
    <section>${ebutton('Guardar ejercicio','save',false)}${ebutton('Cancelar','close')}</section>
  </div>`);
  const root=document.querySelector('#ed-root');
  const sync=()=>{const read=key=>root.querySelector(`[data-field="${key}"]`).value;ui.exercise={...ui.exercise,displayName:read('displayName'),primaryMuscles:list(read('primaryMuscles')),secondaryMuscles:list(read('secondaryMuscles')),equipment:list(read('equipment')),aliases:list(read('aliases')),notes:read('notes')};};
  root.addEventListener('input',()=>sync());
  root.addEventListener('click',event=>{const target=event.target.closest('[data-edit]');if(!target)return;sync();const edit=target.dataset.edit;if(edit==='close'){ui={...ui,exercise:null,error:''};return ctx.render();}if(edit==='save'){ui.error='';try{const saved=upsertExercise(ctx.getConfig(),ui.exercise);ui={...ui,exercise:null};return ctx.commit(saved);}catch(error){ui={...ui,error:error.message};return ctx.render();}}});
}

export const editorScreen = ctx => ui.draft ? workoutEditor(ctx) : ui.exercise ? exerciseEditor(ctx) : editorHome(ctx);
