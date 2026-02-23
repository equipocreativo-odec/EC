// ===============================
// Configuración
// ===============================
const APPS_SCRIPT_KEYS_ENDPOINT = 'PEGAR_AQUI_URL_WEB_APP_KEYS'; // termina en /exec
const LEADERBOARD_CSV_URL = ''; // (opcional) URL publicada de la hoja Leaderboard (CSV)
const SHARED_TOKEN = ''; // opcional, debe coincidir con el backend

// ===============================
// Niveles y puntos
// ===============================
const LEVELS = [
  { name: 'BRONCE',  min: 0,    color: '#b87333', badge: 'assets/badges/BRONCE.svg'  },
  { name: 'PLATA',   min: 200,  color: '#c0c0c0', badge: 'assets/badges/PLATA.svg'   },
  { name: 'ORO',     min: 500,  color: '#ffd700', badge: 'assets/badges/ORO.svg'     },
  { name: 'PLATINO', min: 900,  color: '#00d1b2', badge: 'assets/badges/PLATINO.svg' },
  { name: 'DIAMANTE',min: 1400, color: '#00e5ff', badge: 'assets/badges/DIAMANTE.svg'},
  { name: 'LEYENDA', min: 2000, color: '#8a4fff', badge: 'assets/badges/LEYENDA.svg' }
];

// ===============================
// Estado local
// ===============================
const state = {
  perfil: { nombre: '', puntos: 0, rachaSemanas: 0 },
  leaderboard: [ { nombre: 'Ana', puntos: 260 }, { nombre: 'Luis', puntos: 520 }, { nombre: 'Camila', puntos: 940 }, { nombre: 'Juan', puntos: 1520 } ],
  evidencias: []
};

function guardarState(){ localStorage.setItem('ecc_state_keys_cloud', JSON.stringify(state)); }
function cargarState(){ const raw = localStorage.getItem('ecc_state_keys_cloud'); if(raw){ try{ Object.assign(state, JSON.parse(raw)); }catch(e){} } }

// ===============================
// Utilidades
// ===============================
function nivelPorPuntos(p){ let current = LEVELS[0]; for(const lvl of LEVELS){ if(p >= lvl.min) current = lvl; } return current; }

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

async function fetchLeaderboardCSV(){
  if(!LEADERBOARD_CSV_URL) return null;
  try{
    const res = await fetch(LEADERBOARD_CSV_URL + (LEADERBOARD_CSV_URL.includes('?')?'&':'?') + '_=' + Date.now());
    if(!res.ok) return null;
    const text = await res.text();
    // CSV simple con cabeceras: nombre,puntos
    const lines = text.trim().split(/\r?\n/);
    const out = [];
    for(let i=1;i<lines.length;i++){
      const [nombre,puntos] = lines[i].split(',');
      if(nombre) out.push({ nombre: nombre.replace(/\"/g,''), puntos: Number(puntos||0) });
    }
    return out;
  }catch(e){ return null; }
}

async function renderLeaderboard(){
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = '';

  let data = await fetchLeaderboardCSV();
  if(!data){
    // fallback local
    data = [...state.leaderboard];
    if(state.perfil.nombre){
      const i = data.findIndex(p => p.nombre === state.perfil.nombre);
      if(i>=0) data[i].puntos = state.perfil.puntos;
      else data.push({ nombre: state.perfil.nombre, puntos: state.perfil.puntos });
    }
  }

  data.sort((a,b)=> b.puntos - a.puntos);
  data.slice(0, 50).forEach((p,i)=>{
    const li = document.createElement('li');
    const lvl = nivelPorPuntos(p.puntos);
    li.innerHTML = `<strong>#${i+1}</strong> ${p.nombre} — ${p.puntos} pts <span style="color:${lvl.color}">[${lvl.name}]</span>`;
    lb.appendChild(li);
  });
}

async function renderRetos(){
  const cont = document.getElementById('retos');
  cont.innerHTML = '';
  const retos = [
    { id:'R1', titulo:'Difusión diaria de evento', tipo:'diario',  puntos:20,  descripcion:'Difunde actividades del ecosistema.' },
    { id:'R2', titulo:'Video semanal sobre iniciativa', tipo:'semanal', puntos:50, descripcion:'Crea un Reel/TikTok/Short acerca de una iniciativa.' },
    { id:'R3', titulo:'Invitar a 3 nuevos participantes', tipo:'logro', puntos:100,  descripcion:'Suma 3 jóvenes a la comunidad.' }
  ];
  retos.forEach(r=>{
    const card = document.createElement('div');
    card.className = 'reto';
    card.innerHTML = `<h3>${r.titulo}</h3><div class="tipo">Tipo: ${r.tipo.toUpperCase()} • <span class="puntos">+${r.puntos} pts</span></div><p>${r.descripcion}</p>`;
    cont.appendChild(card);
  });
}

function renderGaleria(){
  const g = document.getElementById('galeria');
  g.innerHTML = '';
  state.evidencias.forEach(ev=>{
    const d = document.createElement('div');
    d.className = 'item';
    d.innerHTML = `<div><strong>${new Date(ev.fecha).toLocaleString()}</strong></div><div>Reto: ${ev.reto} • +${ev.puntos} pts</div><div>${ev.meta||''}</div>`;
    g.appendChild(d);
  });
}

async function validarClaveServidor(){
  const nombre = (document.getElementById('nombre').value||'').trim() || 'Anónimo';
  const keyRaw = (document.getElementById('claveReto').value||'').trim();
  if(!keyRaw){ alert('Ingresa una clave.'); return; }

  // POST al Apps Script Web App
  const fd = new FormData();
  fd.append('mode', 'redeem_key');
  fd.append('nombre', nombre);
  fd.append('key', keyRaw);
  fd.append('token', SHARED_TOKEN);

  let resp;
  try{
    const res = await fetch(APPS_SCRIPT_KEYS_ENDPOINT, { method:'POST', body: fd, redirect:'follow' });
    resp = await res.json();
  }catch(e){ alert('No se pudo conectar al servidor de validación.'); return; }

  if(!resp || !resp.ok){
    alert(resp && resp.error ? ('Error: ' + resp.error) : 'Clave inválida o ya usada.');
    return;
  }

  // Acreditar localmente también
  state.perfil.nombre = nombre;
  state.perfil.puntos = Number(resp.totalPuntos || (state.perfil.puntos + Number(resp.puntos||0)));
  state.evidencias.unshift({ fecha:new Date().toISOString(), reto: resp.retoId || 'R?', puntos: Number(resp.puntos||0), meta: resp.meta || '' });
  state.evidencias = state.evidencias.slice(0, 24);
  guardarState();

  renderPerfil();
  await renderLeaderboard();
  renderGaleria();

  alert(`¡Validación exitosa! +${resp.puntos} pts. Total: ${state.perfil.puntos} pts.`);
  document.getElementById('claveReto').value='';
}

function initPerfil(){
  const nombreInput = document.getElementById('nombre');
  const guardarBtn = document.getElementById('guardarPerfil');
  guardarBtn.addEventListener('click', ()=>{ state.perfil.nombre = (nombreInput.value||'').trim() || 'Anónimo'; guardarState(); renderPerfil(); renderLeaderboard(); });
}

(async function(){
  cargarState();
  initPerfil();
  renderPerfil();
  await renderLeaderboard();
  await renderRetos();
  renderGaleria();
  document.getElementById('validarClave').addEventListener('click', validarClaveServidor);
})();
