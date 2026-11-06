(function(){
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const store = { get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d }catch(e){ return d } }, set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} } };
  const MAP = window.GUIA_MAP || {}, IDX = window.GUIA_INDEX || [], TOTAL = window.GUIA_TOTAL || 0;
  const DESIGNS = { A:{mod:'cuanti', name:'Descriptivo', sec:'s22'}, B:{mod:'cuanti', name:'Correlacional', sec:'s23'}, C:{mod:'cuanti', name:'Cuasiexperimental', sec:'s24'}, D:{mod:'cuali', name:'Estudio de caso', sec:'s25'}, E:{mod:'cuali', name:'Fenomenológico', sec:'s26'} };
  const MODN = { all:'Todas las modalidades', cuanti:'Cuantitativa', cuali:'Cualitativa' };
  let state = store.get('gt-state', { mod:'all', design:null });
  const pageId = ($('main') || {}).dataset ? $('main').dataset.page : '';

  function apply(){
    $$('[data-mod]').forEach(el => { if (el.closest('.config') || el.id === pageId) return; el.hidden = state.mod !== 'all' && el.dataset.mod !== state.mod; });
    $$('[data-design]').forEach(el => { if (el.closest('.config') || el.id === pageId) return; if (state.design && el.dataset.design !== state.design) el.hidden = true; });
    $$('[data-setmod]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setmod === state.mod)));
    $$('[data-setdesign]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setdesign === state.design)));
    const filtered = state.mod !== 'all' || !!state.design;
    document.body.classList.toggle('filtered', filtered);
    const fp = $('#filterpill'); if (fp){ fp.hidden = !filtered; $('#filtertext').textContent = MODN[state.mod] + (state.design ? ' · ' + DESIGNS[state.design].name : ''); }
    if ($('#ruta')) renderRuta();
    store.set('gt-state', state);
  }
  $$('[data-setmod]').forEach(b => b.addEventListener('click', () => { state.mod = b.dataset.setmod; if (state.design && DESIGNS[state.design].mod !== state.mod) state.design = null; apply(); }));
  $$('[data-setdesign]').forEach(b => b.addEventListener('click', () => { const d = b.dataset.setdesign; if (state.design === d){ state.design = null; } else { state.design = d; state.mod = DESIGNS[d].mod; } apply(); }));
  const cf = $('#clearf'); if (cf) cf.addEventListener('click', () => { state = { mod:'all', design:null }; apply(); });

  function renderRuta(){
    const m = state.mod, cu = m === 'cuanti', cl = m === 'cuali';
    const steps = [
      ['s4', 'Antes de escribir: fija objetivos, dimensiones o subcategorías y arma la matriz de consistencia.'],
      ['s8', cl ? 'Embudo, preguntas «¿Cómo…?» y objetivos de comprensión; sin hipótesis.' : cu ? 'Embudo, preguntas, objetivos e hipótesis con las mismas palabras.' : 'Embudo, preguntas, objetivos e hipótesis (si corresponde).'],
      ['s9', 'Antecedentes con los cinco movimientos y postura teórica que define tus dimensiones o subcategorías.'],
      ['s10', 'Decisiones metodológicas con la fórmula D + R + A.'],
      ...(cl ? [['s17', 'Juicio de expertos de la guía, entrevista piloto y criterios de rigor.']] : cu ? [['s16', 'Juicio de expertos con V de Aiken, piloto de 30 casos y confiabilidad por dimensión.'], ['s30', 'Calcula la V de Aiken y la confiabilidad de tu piloto.']] : [['s16', 'Ruta cuantitativa de validación.'], ['s17', 'Ruta cualitativa de validación.']]),
      ...(cl ? [['s11-2', 'Fórmula ACI: aserto, cita codificada, triangulación, interpretación y cierre.']] : cu ? [['s11-1', 'Tabla, párrafo de lectura, normalidad y contrastación de hipótesis.']] : [['s11-1', 'Ruta cuantitativa de resultados.'], ['s11-2', 'Ruta cualitativa de resultados.']]),
      ['s12', 'Cinco movimientos por objetivo, discusión integradora y limitaciones.'],
      ['s13', 'Una conclusión por objetivo, con su dato, y una recomendación por conclusión.'],
      ['s14', 'Referencias APA 7 y los cuatro anexos.'],
      ['s5', 'Ajusta el título al final, cuando la variable y los participantes estén cerrados.'],
      ['s6', 'Escribe el resumen cuando los resultados estén terminados.'],
      ['s7', 'Traduce el resumen oración por oración.'],
      ['s29', 'Revisa coherencia, rigor, forma, ética y originalidad antes de entregar.'],
    ];
    const d = state.design ? DESIGNS[state.design] : null;
    const head = d ? 'Tu ruta: ' + MODN[d.mod].toLowerCase() + ', diseño ' + d.name.toLowerCase() : state.mod !== 'all' ? 'Tu ruta: modalidad ' + MODN[state.mod].toLowerCase() : 'Orden sugerido de escritura';
    const u = id => (MAP[id] || {}).u || '#';
    const model = d ? '<div class="modelcard"><span>Tesis modelo de tu diseño:</span><a href="' + u(d.sec) + '">Caso ' + state.design + ' · ' + d.name + '</a><a href="' + u('s27') + '">Comparar con otros diseños</a></div>' : '<div class="modelcard"><span>Elige un diseño para ver su tesis modelo completa, o revisa la</span><a href="' + u('s27') + '">comparación entre diseños</a></div>';
    $('#ruta').innerHTML = '<h3>' + head + '</h3><p class="sum">La tesis no se escribe en el orden en que se lee: el título, el resumen y el abstract se cierran al final.</p>' + model + '<ol>' + steps.map(([id, t]) => '<li class="chap-' + ((MAP[id] || {}).c || 'none') + '"><span class="dot"></span><div><a href="' + u(id) + '">' + ((MAP[id] || {}).t || id) + '</a><small>' + t + '</small></div></li>').join('') + '</ol>';
  }

  /* listas de verificación: el avance suma todas las páginas */
  let done = new Set(store.get('gt-checks', []));
  const boxes = $$('input[data-chk]');
  boxes.forEach(b => { b.checked = done.has(b.dataset.chk); b.addEventListener('change', () => { b.checked ? done.add(b.dataset.chk) : done.delete(b.dataset.chk); store.set('gt-checks', [...done]); prog(); }); });
  function prog(){ const n = done.size; const t = $('#ptext'); if (t){ t.textContent = n + ' / ' + TOTAL + ' verificados'; $('#pbar').style.width = (TOTAL ? 100 * n / TOTAL : 0) + '%'; } }
  prog();

  /* copiar fórmulas */
  document.addEventListener('click', e => {
    const b = e.target.closest('.copy'); if (!b) return;
    const ok = () => { b.textContent = 'Copiado'; b.classList.add('ok'); setTimeout(() => { b.textContent = 'Copiar'; b.classList.remove('ok'); }, 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(b.parentElement.querySelector('.ftext')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Seleccionado: Ctrl+C'; setTimeout(() => { b.textContent = 'Copiar'; }, 2400); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(ok, fallback); } catch(err){ fallback(); }
  });

  /* búsqueda en toda la guía */
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const idx = IDX.map(it => Object.assign({}, it, { n: norm(it.x) }));
  const q = $('#q'), res = $('#results');
  const escH = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function search(){
    const v = q.value.trim(); if (v.length < 3){ res.hidden = true; return; }
    const nv = norm(v), hits = [];
    for (const it of idx){ const p = it.n.indexOf(nv); if (p >= 0) hits.push({ it, p }); if (hits.length >= 16) break; }
    res.innerHTML = hits.length ? hits.map(({ it, p }) => { const a = Math.max(0, p - 50), b = Math.min(it.x.length, p + nv.length + 70); return '<a class="hit" href="' + it.u + '"><b>' + escH(it.t) + '</b><small>' + (a ? '…' : '') + escH(it.x.slice(a, p)) + '<mark>' + escH(it.x.slice(p, p + nv.length)) + '</mark>' + escH(it.x.slice(p + nv.length, b)) + '…</small></a>'; }).join('') : '<div class="empty">Sin resultados. Prueba con otra palabra.</div>';
    res.hidden = false;
  }
  if (q){ q.addEventListener('input', search); q.addEventListener('keydown', e => { if (e.key === 'Escape'){ q.value = ''; res.hidden = true; } }); }
  document.addEventListener('click', e => { if (res && !e.target.closest('.search')) res.hidden = true; });

  /* índice lateral en pantallas pequeñas */
  const nw = $('#navwrap'); if (nw && matchMedia('(max-width: 920px)').matches) nw.open = false;

  /* si el ancla de la URL está oculta por el filtro, se muestra todo */
  function checkHash(){ const id = location.hash.slice(1); const el = id && document.getElementById(id); if (el && (el.hidden || el.closest('[hidden]'))){ state = { mod:'all', design:null }; apply(); el.scrollIntoView(); } }
  window.addEventListener('hashchange', checkHash);

  if ($('#ak-table')) {
  /* ---------- formato numérico (APA en español) ---------- */
  const f2 = (x, d=2) => { if (!isFinite(x)) return '—'; const s = Math.abs(x).toFixed(d).replace('.', ','); return (x < 0 ? '−' : '') + (Math.abs(x) < 1 ? s.replace(/^0/, '') : s); };

  /* ---------- V de Aiken ---------- */
  const AK_EX = [[4,4,3,4,4],[3,4,3,3,4],[2,3,2,3,2]];
  let ak = store.get('gt-aiken', null) || { n:5, c:4, crit:0.70, rows: AK_EX.map(r => r.slice()) };
  const akN = $('#ak-n'), akC = $('#ak-c'), akCrit = $('#ak-crit');
  function ciPG(V, n, k){ const z = 1.96, nk = n * k; const a = 2 * nk * V + z * z, b = z * Math.sqrt(4 * nk * V * (1 - V) + z * z), c = 2 * (nk + z * z); return [(a - b) / c, (a + b) / c]; }
  function akRender(){
    akN.value = ak.n; akC.value = ak.c; akCrit.value = ak.crit.toFixed(2);
    ak.rows = ak.rows.map(r => { const x = r.slice(0, ak.n); while (x.length < ak.n) x.push(''); return x; });
    let html = '<table><thead><tr><th>Ítem</th>' + Array.from({ length: ak.n }, (_, j) => `<th>J${j + 1}</th>`).join('') + '<th>S</th><th>V</th><th>IC 95 %</th><th>Decisión</th></tr></thead><tbody>';
    let pass = 0, valid = 0;
    ak.rows.forEach((r, i) => {
      const k = ak.c - 1; let S = 0, okRow = true;
      const cells = r.map((v, j) => { const num = Number(v); const bad = v === '' || !(num >= 1 && num <= ak.c && Number.isInteger(num)); if (bad) okRow = false; else S += num - 1; return `<td><input class="akin${v !== '' && bad ? ' bad' : ''}" type="number" min="1" max="${ak.c}" step="1" id="ak-${i}-${j}" data-i="${i}" data-j="${j}" value="${v}" aria-label="Ítem ${i + 1}, juez ${j + 1}"></td>`; }).join('');
      let out = '<td>—</td><td>—</td><td>—</td><td class="hint">Completa las puntuaciones</td>';
      if (okRow){ const V = S / (ak.n * k); const [lo, hi] = ciPG(V, ak.n, k); const ok = V >= ak.crit - 1e-9; valid++; if (ok) pass++; out = `<td>${S}</td><td><b>${f2(V)}</b></td><td>[${f2(lo)}; ${f2(hi)}]</td><td class="${ok ? 'ok-t' : 'no-t'}">${ok ? 'Se mantiene' : 'Reformular o eliminar'}</td>`; }
      html += `<tr><td>${i + 1}</td>${cells}${out}</tr>`;
    });
    html += '</tbody></table>';
    $('#ak-table').innerHTML = html;
    $('#ak-sum').innerHTML = valid ? `<b>${pass} de ${valid}</b> ítems alcanzan V ≥ ${f2(ak.crit)}. Si el límite inferior del intervalo es bajo, el acuerdo es poco estable: conviene sumar jueces o revisar el ítem.` : '';
    store.set('gt-aiken', ak);
  }
  $('#ak-table').addEventListener('change', e => { const t = e.target; if (!t.classList.contains('akin')) return; ak.rows[+t.dataset.i][+t.dataset.j] = t.value; akRender(); const nx = document.getElementById(`ak-${t.dataset.i}-${+t.dataset.j + 1}`); });
  akN.addEventListener('change', () => { ak.n = +akN.value; akRender(); });
  akC.addEventListener('change', () => { ak.c = +akC.value; akRender(); });
  akCrit.addEventListener('change', () => { ak.crit = +akCrit.value; akRender(); });
  $('#ak-add').addEventListener('click', () => { ak.rows.push(Array(ak.n).fill('')); akRender(); });
  $('#ak-del').addEventListener('click', () => { if (ak.rows.length > 1){ ak.rows.pop(); akRender(); } });
  $('#ak-ex').addEventListener('click', () => { ak = { n:5, c:4, crit:0.70, rows: AK_EX.map(r => r.slice()) }; akRender(); });
  akRender();

  /* ---------- CVR ---------- */
  const LAWSHE = [[5,.99],[6,.99],[7,.99],[8,.75],[9,.78],[10,.62],[11,.59],[12,.56],[13,.54],[14,.51],[15,.49],[20,.42],[25,.37],[30,.33],[35,.31],[40,.29]];
  function cvr(){
    const N = Math.round(+$('#cvr-n').value), ne = Math.round(+$('#cvr-ne').value), o = $('#cvr-out');
    if (!(N >= 5 && N <= 40) || !(ne >= 0 && ne <= N)){ o.innerHTML = '<p class="hint">Ingresa entre 5 y 40 jueces, y un número de jueces «esencial» que no supere ese total.</p>'; return; }
    const v = (ne - N / 2) / (N / 2), v2 = ne / N;
    let crit = null; for (const [n, c] of LAWSHE){ if (n <= N) crit = c; }
    const exact = LAWSHE.some(([n]) => n === N);
    o.innerHTML = `<div class="kpis"><div><small>CVR de Lawshe</small><span class="big">${f2(v)}</span><span class="${v >= crit ? 'ok-t' : 'no-t'}">${v >= crit ? 'Aceptable' : 'No aceptable'} (mínimo ${f2(crit)}${exact ? '' : ', valor de la tabla para el N inmediato inferior'})</span></div><div><small>CVR′ de Tristán-López</small><span class="big">${f2(v2)}</span><span class="${v2 >= 0.5823 ? 'ok-t' : 'no-t'}">${v2 >= 0.5823 ? 'Aceptable' : 'No aceptable'} (mínimo ,58)</span></div></div>`;
  }
  ['#cvr-n', '#cvr-ne'].forEach(s => $(s).addEventListener('input', cvr)); cvr();

  /* ---------- confiabilidad ---------- */
  function lcg(seed){ let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
  function exLikert(){ const r = lcg(7), rows = []; for (let i = 0; i < 30; i++){ const t = r() * 2.6 - 1.3; const row = []; for (let j = 0; j < 6; j++){ const v = Math.round(3 + 1.25 * t + (r() - 0.5) * 1.9); row.push(Math.min(5, Math.max(1, v))); } rows.push(row.join('\t')); } return rows.join('\n'); }
  function exBin(){ const r = lcg(11), rows = [], diff = [-.9, -.6, -.3, -.1, 0, .2, .4, .6, .9, .3]; for (let i = 0; i < 30; i++){ const t = r() * 2.4 - 1.2; rows.push(diff.map(d => (t - d + (r() - 0.5) * 1.3 > 0 ? 1 : 0)).join('\t')); } return rows.join('\n'); }
  const ta = $('#rel-data');
  ta.value = store.get('gt-rel', null) || exLikert();
  function parse(txt){
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.map(l => { const semi = l.includes(';') || l.includes('\t'); const parts = l.split(semi ? /[;\t]+/ : /[\s,]+/).filter(x => x !== ''); return parts.map(x => Number(semi ? x.replace(',', '.') : x)); });
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const vari = (a, pop) => { const m = mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - (pop ? 0 : 1)); };
  const corr = (a, b) => { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0; for (let i = 0; i < a.length; i++){ n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db); };
  const interp = a => a >= .9 ? 'Excelente' : a >= .8 ? 'Bueno' : a >= .7 ? 'Aceptable' : a >= .6 ? 'Cuestionable' : a >= .5 ? 'Pobre' : 'Inaceptable';
  function coef(M, bin){ const k = M[0].length; const tot = M.map(r => r.reduce((s, x) => s + x, 0)); const cols = Array.from({ length: k }, (_, j) => M.map(r => r[j])); const iv = cols.map(c => vari(c, bin)); return (k / (k - 1)) * (1 - iv.reduce((s, x) => s + x, 0) / vari(tot, bin)); }
  function rel(){
    store.set('gt-rel', ta.value);
    const o = $('#rel-out'); let M;
    try { M = parse(ta.value); } catch(e){ M = []; }
    if (M.length < 3 || M[0].length < 2){ o.innerHTML = '<p class="hint">Pega al menos 3 filas y 2 columnas de datos numéricos.</p>'; return; }
    const k = M[0].length;
    if (M.some(r => r.length !== k || r.some(x => !isFinite(x)))){ o.innerHTML = `<p class="no-t">Hay filas con un número distinto de columnas o con valores no numéricos. Revisa que cada fila tenga ${k} valores.</p>`; return; }
    const bin = M.every(r => r.every(x => x === 0 || x === 1));
    const a = coef(M, bin), n = M.length;
    const tot = M.map(r => r.reduce((s, x) => s + x, 0));
    const rows = Array.from({ length: k }, (_, j) => { const col = M.map(r => r[j]); const rest = tot.map((t, i) => t - col[i]); const r = corr(col, rest); const M2 = M.map(rr => rr.filter((_, jj) => jj !== j)); const aDel = k > 2 ? coef(M2, bin) : NaN; const flag = (isFinite(r) && r < .30) || (isFinite(aDel) && aDel > a + .02); return `<tr><td>${j + 1}</td><td>${bin ? f2(mean(col)) : mean(col).toFixed(2).replace('.', ',')}</td><td>${f2(r)}</td><td>${f2(aDel)}</td><td class="${flag ? 'warn-t' : 'ok-t'}">${flag ? 'Revisar' : 'Adecuado'}</td></tr>`; }).join('');
    const notes = [];
    if (n < 30) notes.push(`El piloto tiene ${n} casos; se recomiendan al menos 30 (Johanson y Brooks, 2010).`);
    if (a > .90) notes.push('Un valor superior a ,90 puede indicar ítems redundantes (Streiner, 2003).');
    if (k < 3) notes.push('Con menos de tres ítems el coeficiente es poco informativo.');
    o.innerHTML = `<div class="kpis"><div><small>${bin ? 'KR-20' : 'Alfa de Cronbach'}</small><span class="big">${f2(a)}</span><span class="${a >= .7 ? 'ok-t' : a >= .6 ? 'warn-t' : 'no-t'}">${interp(a)}</span></div><div><small>Participantes</small><span class="big">${n}</span></div><div><small>Ítems</small><span class="big">${k}</span></div></div>${notes.map(t => `<p class="warn-t" style="font-weight:400">${t}</p>`).join('')}<div class="tw"><table><thead><tr><th>Ítem</th><th>${bin ? 'Dificultad (p)' : 'Media'}</th><th>Correlación ítem-total corregida</th><th>${bin ? 'KR-20' : 'Alfa'} si se elimina</th><th>Señal</th></tr></thead><tbody>${rows}</tbody></table></div><p class="hint">Revisar: correlación ítem-total menor de ,30 o coeficiente que sube al eliminar el ítem. Calcula el coeficiente también por dimensión, pegando solo las columnas de cada una.</p>`;
  }
  ta.addEventListener('input', rel);
  $('#rel-ex').addEventListener('click', () => { ta.value = exLikert(); rel(); });
  $('#rel-ex2').addEventListener('click', () => { ta.value = exBin(); rel(); });
  rel();


  }
  apply();
  checkHash();
})();