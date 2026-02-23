// ===============================
// Configuración de niveles y puntos
// ===============================
const LEVELS = [
  { name: 'BRONCE',  min: 0,    color: '#b87333', badge: 'assets/badges/BRONCE.svg'  },
  { name: 'PLATA',   min: 200,  color: '#c0c0c0', badge: 'assets/badges/PLATA.svg'   },
  { name: 'ORO',     min: 500,  color: '#ffd700', badge: 'assets/badges/ORO.svg'     },
  { name: 'PLATINO', min: 900,  color: '#00d1b2', badge: 'assets/badges/PLATINO.svg' },
  { name: 'DIAMANTE',min: 1400, color: '#00e5ff', badge: 'assets/badges/DIAMANTE.svg'},
  { name: 'LEYENDA', min: 2000, color: '#8a4fff', badge: 'assets/badges/LEYENDA.svg' }
];

const PUNTOS = { diario: 20, semanal: 50, logro: 100 };
const BONUS_RACHA = 0.10; // +10% por racha semanal activa

// ===============================
// Estado local
// ===============================
const state = {
  perfil: {
    nombre: '',
    puntos: 0,
    rachaSemanas: 0
  },
  leaderboard: [
    { nombre: 'Ana', puntos: 260 },
    { nombre: 'Luis', puntos: 520 },
    { nombre: 'Camila', puntos: 940 },
    { nombre: 'Juan', puntos: 1520 }
  ],
  evidencias: []
};

function guardarState(){
  localStorage.setItem('ecc_state', JSON.stringify(state));
}
function cargarState(){
  const raw = localStorage.getItem('ecc_state');
  if(raw){
    try {
      const s = JSON.parse(raw);
      Object.assign(state, s);
    } catch(e){}
  }
}

// ===============================
// Utilidades de nivel
// ===============================
function nivelPorPuntos(p){
  let current = LEVELS[0];
  for(const lvl of LEVELS){
    if(p >= lvl.min) current = lvl;
  }
  return current;
}

// ===============================
// Render perfil
// ===============================
function renderPerfil(){
  const puntosEl = document.getElementById('puntos');
  const nivelNombreEl = document.getElementById('nivelNombre');
  const rachaEl = document.getElementById('racha');
  const nombreInput = document.getElementById('nombre');
  const badgeImg = document.getElementById('nivelBadge');

  puntosEl.textContent = state.perfil.puntos;
  rachaEl.textContent = state.perfil.rachaSemanas;
  nombreInput.value = state.perfil.nombre || '';

  const nivel = nivelPorPuntos(state.perfil.puntos);
  nivelNombreEl.textContent = nivel.name;
  badgeImg.src = nivel.badge;
  badgeImg.alt = `Badge ${nivel.name}`;
}

// ===============================
// Render leaderboard
// ===============================
function renderLeaderboard(){
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = '';
  const merged = [...state.leaderboard];

  // incluir al usuario si tiene nombre
  if(state.perfil.nombre){
    const i = merged.findIndex(p => p.nombre === state.perfil.nombre);
    if(i >= 0){ merged[i].puntos = state.perfil.puntos; }
    else { merged.push({ nombre: state.perfil.nombre, puntos: state.perfil.puntos }); }
  }

  merged.sort((a,b)=> b.puntos - a.puntos);
  merged.slice(0, 20).forEach((p,i)=>{
    const li = document.createElement('li');
    const lvl = nivelPorPuntos(p.puntos);
    li.innerHTML = `<strong>#${i+1}</strong> ${p.nombre} — ${p.puntos} pts <span style="color:${lvl.color}">[${lvl.name}]</span>`;
    lb.appendChild(li);
  });
}

// ===============================
// Render retos
// ===============================
async function renderRetos(){
  const cont = document.getElementById('retos');
  cont.innerHTML = 'Cargando retos...';

  let retos = [];
  try {
    const res = await fetch('data/retos.json');
    retos = await res.json();
  } catch(e) {
    retos = [
      { id:'R1', titulo:'Difusión diaria de evento', tipo:'diario',  puntos:PUNTOS.diario,  descripcion:'Comparte una historia o publicación del Ecosistema Creativo.' },
      { id:'R2', titulo:'Video semanal sobre iniciativa', tipo:'semanal', puntos:PUNTOS.semanal, descripcion:'Crea un Reel/TikTok/Short sobre una iniciativa del ecosistema.' },
      { id:'R3', titulo:'Invitar a 3 nuevos participantes', tipo:'logro', puntos:PUNTOS.logro,  descripcion:'Suma 3 jóvenes al programa y sube evidencia.' }
    ];
  }

  cont.innerHTML = '';
  retos.forEach(r=>{
    const card = document.createElement('div');
    card.className = 'reto';
    card.innerHTML = `
      <h3>${r.titulo}</h3>
      <div class="tipo">Tipo: ${r.tipo.toUpperCase()} • <span class="puntos">+${r.puntos} pts</span></div>
      <p>${r.descripcion}</p>
      <input type="url" placeholder="URL de evidencia (pública)" />
      <button class="btn btn-secondary">Marcar como realizado</button>
    `;
    const btn = card.querySelector('button');
    const input = card.querySelector('input[type="url"]');
    btn.addEventListener('click', () => completarReto(r, input.value.trim()));
    cont.appendChild(card);
  });
}

// ===============================
// Completar reto
// ===============================
function completarReto(reto, url){
  // validación simple de URL
  if(!/^https?:\/\/.+/i.test(url)){
    alert('Agrega una URL pública como evidencia.');
    return;
  }
  // puntos + bonus por racha si aplica (para semanales y logros)
  let puntos = reto.puntos;
  if(reto.tipo !== 'diario' && state.perfil.rachaSemanas > 0){
    puntos = Math.round(puntos * (1 + BONUS_RACHA));
  }
  state.perfil.puntos += puntos;
  state.evidencias.unshift({ fecha: new Date().toISOString(), url, reto: reto.id, puntos });

  // mantener pequeña la galería
  state.evidencias = state.evidencias.slice(0, 24);

  guardarState();
  renderPerfil();
  renderLeaderboard();
  renderGaleria();
  alert(`¡Listo! Sumaste ${puntos} pts por el reto ${reto.titulo}.`);
}

// ===============================
// Galería
// ===============================
function renderGaleria(){
  const g = document.getElementById('galeria');
  g.innerHTML = '';
  state.evidencias.forEach(ev=>{
    const d = document.createElement('div');
    d.className = 'item';
    d.innerHTML = `
      <div><strong>${new Date(ev.fecha).toLocaleString()}</strong></div>
      <div>Reto: ${ev.reto} • +${ev.puntos} pts</div>
      <a href="${ev.url}" target="_blank" rel="noopener">Ver evidencia</a>
    `;
    g.appendChild(d);
  });
}

// ===============================
// Init
// ===============================
function initPerfil(){
  const nombreInput = document.getElementById('nombre');
  const guardarBtn = document.getElementById('guardarPerfil');
  guardarBtn.addEventListener('click', ()=>{
    state.perfil.nombre = (nombreInput.value || '').trim() || 'Anónimo';
    guardarState();
    renderPerfil();
    renderLeaderboard();
  });
}

(function(){
  cargarState();
  initPerfil();
  renderPerfil();
  renderLeaderboard();
  renderRetos();
  renderGaleria();
})();
