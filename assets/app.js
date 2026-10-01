'use strict';
const $ = id => document.getElementById(id);
let currentProfile = null, sheets = [], currentRows = [], results = [], importVersion = 0;
const setText = (id, text) => { $(id).textContent = text; };
function showMode(mode) {
  for (const name of ['single', 'batch']) {
    $(name + '-tab').setAttribute('aria-selected', String(name === mode));
    $(name + '-tab').tabIndex = name === mode ? 0 : -1;
    $(name + '-panel').hidden = name !== mode;
  }
  $('profile-view').hidden = mode !== 'single'; $('list-view').hidden = mode !== 'batch';
}
for (const name of ['single', 'batch']) {
  $(name + '-tab').addEventListener('click', () => showMode(name));
  $(name + '-tab').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); const next = e.key === 'Home' ? 'single' : e.key === 'End' ? 'batch' : name === 'single' ? 'batch' : 'single';
    showMode(next); $(next + '-tab').focus();
  });
}
function renderProfile(dni) {
  try {
    currentProfile = Identity.profile(dni); $('dni').setAttribute('aria-invalid', 'false');
    const p = currentProfile;
    for (const [id, value] of Object.entries({ 'full-name': p.fullName, 'card-dni': p.dni, names: p.names, paternal: p.paternal, maternal: p.maternal, location: p.location, initials: p.names[0] + p.paternal[0] })) setText(id, value);
    setText('lookup-error', ''); setText('copy-status', ''); setText('comparison', 'La comparación usa todos los nombres y apellidos.');
    const card = document.querySelector('.identity-card'); card.classList.remove('reveal'); void card.offsetWidth; card.classList.add('reveal');
  } catch (e) { setText('lookup-error', e.message); $('dni').setAttribute('aria-invalid', 'true'); $('dni').focus(); }
}
$('lookup').addEventListener('submit', e => { e.preventDefault(); renderProfile($('dni').value); });
document.querySelectorAll('[data-dni]').forEach(button => button.addEventListener('click', () => { $('dni').value = button.dataset.dni; renderProfile(button.dataset.dni); }));
$('compare').addEventListener('click', () => {
  if ($('dni').value !== currentProfile.dni) { setText('comparison', 'Consulta primero el DNI que acabas de escribir.'); return; }
  const supplied = Identity.normalize($('compare-name').value);
  setText('comparison', !supplied ? 'Escribe el nombre completo que quieres comparar.' : supplied === Identity.normalize(currentProfile.fullName) ? 'Coincide con todos los nombres de la ficha ficticia.' : 'El nombre completo difiere de la ficha ficticia. Revisa ambos apellidos.');
});
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('download-profile').addEventListener('click', () => download(JSON.stringify(currentProfile, null, 2), `ficha-demo-${currentProfile.dni}.json`, 'application/json'));
$('copy').addEventListener('click', async () => {
  const p = currentProfile;
  try { await navigator.clipboard.writeText(`${p.dni} — ${p.fullName}\n${p.source}\nSin valor oficial`); setText('copy-status', 'Ficha ficticia copiada.'); }
  catch { setText('copy-status', 'El navegador no permite copiar aquí. Usa «Descargar ficha JSON».'); }
});
function option(value, text) { const o = document.createElement('option'); o.value = String(value); o.textContent = text; return o; }
function clearImport() {
  sheets = []; currentRows = []; results = []; $('mapping').hidden = true; $('batch-results').hidden = true; $('empty-list').hidden = false;
  $('file').value = '';
  $('sheet').replaceChildren(); $('dni-column').replaceChildren(); $('name-column').replaceChildren(); setText('batch-error', '');
}
function validateRows(rows) {
  if (rows.length < 2) throw new Error('Añade un encabezado y al menos un registro.');
  if (rows.length > 2001) throw new Error('Divide tu lista: el límite es de 2.000 registros.');
  const width = Math.max(...rows.map(r => r.length));
  if (width > 100) throw new Error('La lista admite hasta 100 columnas.');
  const headers = Array.from({ length: width }, (_, i) => String(rows[0][i] || `Columna ${i + 1}`));
  if (rows.slice(1).some(r => r.length > rows[0].length)) throw new Error('Hay filas con más columnas que el encabezado. Revisa el archivo.');
  return headers;
}
function mapSheet() {
  try {
    const selected = sheets[Number($('sheet').value)]; const headers = validateRows(selected.rows); currentRows = selected.rows.slice(1);
    $('dni-column').replaceChildren(...headers.map((h, i) => option(i, h)));
    $('name-column').replaceChildren(option(-1, 'Sin comparar'), ...headers.map((h, i) => option(i, h)));
    const dni = headers.findIndex(h => /^(dni|documento|numero de documento|nro dni|numero dni)$/.test(Identity.normalize(h).toLowerCase()));
    const name = headers.findIndex(h => /^(nombre|nombre completo|nombres y apellidos)$/.test(Identity.normalize(h).toLowerCase()));
    $('dni-column').value = String(dni < 0 ? 0 : dni); $('name-column').value = String(name < 0 ? -1 : name);
    setText('row-info', `${currentRows.length} registros. DNI en texto; los números sin ceros iniciales no se rellenan automáticamente.`);
    setText('batch-error', ''); $('mapping').hidden = false;
    results = []; $('batch-results').hidden = true; $('empty-list').hidden = false;
  } catch (e) { $('mapping').hidden = true; setText('batch-error', e.message); }
}
function acceptSheets(imported) {
  sheets = imported; $('sheet').replaceChildren(...sheets.map((s, i) => option(i, s.name))); mapSheet();
}
$('sheet').addEventListener('change', mapSheet);
for (const id of ['dni-column', 'name-column']) $(id).addEventListener('change', () => { results = []; $('batch-results').hidden = true; $('empty-list').hidden = false; });
$('use-paste').addEventListener('click', () => {
  importVersion++; clearImport();
  try {
    const text = $('batch-text').value;
    if (new Blob([text]).size > 5 * 1024 * 1024) throw new Error('La lista supera 5 MB.');
    let rows = Identity.parseCsv(text);
    if (rows.every(row => row.length === 1) && !/^(dni|documento)$/i.test(rows[0][0])) rows = [['DNI'], ...rows];
    acceptSheets([{ name: 'Lista pegada', rows }]);
  } catch (e) { setText('batch-error', e.message); }
});
$('file').addEventListener('change', async () => {
  const file = $('file').files[0]; const version = ++importVersion; clearImport(); if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera 5 MB. Divide la lista y vuelve a importar.');
    setText('batch-error', 'Leyendo archivo…');
    let imported;
    if (/\.csv$/i.test(file.name)) imported = [{ name: file.name, rows: Identity.parseCsv(await file.text()) }];
    else if (/\.xlsx$/i.test(file.name)) imported = await readWorkbook(await file.arrayBuffer());
    else throw new Error('Usa un archivo .csv o .xlsx. Convierte los libros .xls a .xlsx.');
    if (version !== importVersion) return;
    acceptSheets(imported);
  } catch (e) { if (version === importVersion) setText('batch-error', e instanceof RangeError ? 'El archivo está dañado o incompleto.' : e.message); }
});
function appendText(parent, tag, value, className) { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; parent.append(node); return node; }
function renderResults() {
  $('results-body').replaceChildren(); const fragment = document.createDocumentFragment();
  for (const r of results) {
    const tr = document.createElement('tr'), d = document.createElement('td'), n = document.createElement('td'), s = document.createElement('td');
    appendText(d, 'strong', r.dni || 'Sin DNI'); appendText(d, 'small', `Fila ${r.row}`); if (r.duplicate) appendText(d, 'small', 'DNI repetido', 'duplicate');
    appendText(n, 'strong', r.fullName || 'Sin ficha'); if (r.supplied) appendText(n, 'small', `Importado: ${r.supplied}`);
    appendText(s, 'span', r.status, 'badge ' + (r.status === 'Coincide con demo' ? 'ok' : r.status === 'Formato inválido' ? 'invalid' : r.status === 'Revisar nombre' ? 'warn' : ''));
    tr.append(d, n, s); fragment.append(tr);
  }
  $('results-body').append(fragment); $('summary').replaceChildren();
  for (const [count, label] of [[results.length, 'registros'], [results.filter(r => r.status === 'Formato inválido' || r.status === 'Revisar nombre').length, 'por revisar'], [results.filter(r => r.duplicate).length, 'repetidos']]) {
    const item = document.createElement('span'); appendText(item, 'strong', String(count)); item.append(document.createTextNode(' ' + label)); $('summary').append(item);
  }
  $('empty-list').hidden = true; $('batch-results').hidden = false;
}
$('process').addEventListener('click', () => {
  const d = Number($('dni-column').value), n = Number($('name-column').value);
  if (d === n) { setText('batch-error', 'Elige columnas diferentes para DNI y nombre completo.'); return; }
  setText('batch-error', ''); results = Identity.processRows(currentRows, d, n); renderResults();
});
function loadSample() {
  importVersion++; clearImport(); showMode('batch');
  const rows = [['DNI', 'Nombre completo'], ['12345678', Identity.profile('12345678').fullName], ['00123456', Identity.profile('00123456').fullName], ['87654321', 'Lucía Salazar Rojas'], ['12345678', Identity.profile('12345678').fullName], ['1234567', 'Nombre incompleto']];
  $('batch-text').value = rows.map(r => r.join(',')).join('\n'); acceptSheets([{ name: 'Ejemplo ficticio', rows }]);
  $('process').click();
}
for (const id of ['sample', 'sample-empty']) $(id).addEventListener('click', loadSample);
$('export').addEventListener('click', () => download(Identity.exportCsv(results), 'revision-dni-demo.csv', 'text/csv;charset=utf-8'));
renderProfile('12345678');
