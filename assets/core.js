(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Identity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const first = ['Lucía', 'Mateo', 'Valeria', 'Gabriel', 'Camila', 'Sebastián', 'Elena', 'Nicolás', 'Mariana', 'Diego', 'Ana', 'Joaquín'];
  const last = ['Mendoza', 'Torres', 'Salazar', 'Rojas', 'Vargas', 'Castillo', 'Paredes', 'Navarro', 'Quispe', 'Luna', 'Flores', 'Delgado'];
  const places = ['Lima · Lima', 'Arequipa · Arequipa', 'Trujillo · La Libertad', 'Cusco · Cusco', 'Piura · Piura', 'Huancayo · Junín'];
  function validateDni(value) { return /^[0-9]{8}$/.test(String(value)); }
  function profile(dni) {
    dni = String(dni);
    if (!validateDni(dni)) throw new Error('Escribe exactamente 8 dígitos, sin espacios ni letras.');
    let seed = 2166136261;
    for (const ch of dni) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    const names = first[seed % first.length];
    const paternal = last[Math.floor(seed / 13) % last.length];
    const maternal = last[Math.floor(seed / 173) % last.length];
    return { dni, names, paternal, maternal, fullName: `${names} ${paternal} ${maternal}`, location: places[Math.floor(seed / 31) % places.length], source: 'Datos ficticios · Demo local' };
  }
  function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('es'); }
  function parseCsv(text) {
    text = text.replace(/^\uFEFF/, '');
    if (!text.trim()) throw new Error('El archivo está vacío.');
    let separator = ',', quoted = false;
    let commas = 0, semicolons = 0;
    for (let i = 0; i < text.length && (quoted || !/[\r\n]/.test(text[i])); i++) {
      if (text[i] === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; }
      else if (!quoted) { if (text[i] === ',') commas++; if (text[i] === ';') semicolons++; }
    }
    if (semicolons > commas) separator = ';';
    const rows = []; let row = [], cell = ''; quoted = false; let closed = false;
    function pushRow() {
      if (row.length > 100) throw new Error('La lista admite hasta 100 columnas.');
      rows.push(row);
      if (rows.length > 2001) throw new Error('Divide tu lista: el límite es de 2.000 registros.');
    }
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } } else cell += ch; }
      else if (ch === '"') { if (cell || closed) throw new Error('CSV inválido: comillas en una celda sin escapar.'); quoted = true; }
      else if (ch === separator) { row.push(cell); if (row.length > 100) throw new Error('La lista admite hasta 100 columnas.'); cell = ''; closed = false; }
      else if (ch === '\n' || ch === '\r') { row.push(cell); pushRow(); row = []; cell = ''; closed = false; if (ch === '\r' && text[i + 1] === '\n') i++; }
      else { if (closed && !/\s/.test(ch)) throw new Error('CSV inválido después de cerrar comillas.'); if (!closed) cell += ch; }
    }
    if (quoted) throw new Error('CSV inválido: hay comillas sin cerrar.');
    if (cell || row.length) { row.push(cell); pushRow(); }
    return rows;
  }
  function processRows(rows, dniColumn, nameColumn = -1) {
    const seen = new Set();
    return rows.map((row, i) => {
      const dni = String(row[dniColumn] ?? ''); const supplied = String(row[nameColumn] ?? '');
      const duplicate = seen.has(dni) && validateDni(dni); seen.add(dni);
      if (!validateDni(dni)) return { row: i + 2, dni, supplied, fullName: '', status: 'Formato inválido', duplicate: false };
      const data = profile(dni);
      return { row: i + 2, dni, supplied, fullName: data.fullName, status: !normalize(supplied) ? 'Sin comparar' : normalize(supplied) === normalize(data.fullName) ? 'Coincide con demo' : 'Revisar nombre', duplicate };
    });
  }
  function csvCell(value) {
    let str = String(value ?? '');
    // Neutralize spreadsheet formulas even after leading whitespace/control characters.
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(str)) str = "'" + str;
    return '"' + str.replace(/"/g, '""') + '"';
  }
  function exportCsv(results) {
    const rows = [['fila', 'dni', 'nombre_importado', 'nombre_ficticio', 'resultado_demo', 'duplicado', 'fuente']];
    results.forEach(r => rows.push([r.row, r.dni, r.supplied, r.fullName, r.status, r.duplicate ? 'Sí' : 'No', 'Datos ficticios; no verifica identidad']));
    return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  }
  return { validateDni, profile, normalize, parseCsv, processRows, exportCsv };
});
