const icons={fuerza:'🏋',running:'🏃',piscina:'🏊',movilidad:'🧘'};

export const iconFor = type => icons[type]||'•';
export const esc = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
