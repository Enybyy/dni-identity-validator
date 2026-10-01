/* Minimal read-only OOXML import: no scripts, macros, formulas or network requests. */
window.readWorkbook = async function (buffer) {
  const view = new DataView(buffer); const bytes = new Uint8Array(buffer); let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) { end = i; break; }
  if (end < 0) throw new Error('El archivo no es un libro XLSX válido.');
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw new Error('No se admiten libros ZIP multipartes.');
  const entries = new Map(); let offset = view.getUint32(end + 16, true), total = 0;
  const decoder = new TextDecoder(); const count = view.getUint16(end + 10, true);
  if (count > 1000) throw new Error('El libro contiene demasiados archivos internos.');
  for (let i = 0; i < count; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('La estructura del libro está dañada.');
    const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true), compressed = view.getUint32(offset + 20, true), size = view.getUint32(offset + 24, true), nameLength = view.getUint16(offset + 28, true), extraLength = view.getUint16(offset + 30, true), commentLength = view.getUint16(offset + 32, true), local = view.getUint32(offset + 42, true);
    if (flags & 1) throw new Error('Exporta una copia sin contraseña para importar el libro.');
    total += size; if (total > 20 * 1024 * 1024) throw new Error('El contenido del libro supera 20 MB.');
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    entries.set(name, { method, compressed, size, local }); offset += 46 + nameLength + extraLength + commentLength;
  }
  async function xml(name) {
    const entry = entries.get(name); if (!entry) throw new Error('Falta una parte necesaria del libro.');
    const o = entry.local; if (view.getUint32(o, true) !== 0x04034b50) throw new Error('El libro está dañado.');
    const start = o + 30 + view.getUint16(o + 26, true) + view.getUint16(o + 28, true);
    if (start + entry.compressed > bytes.length) throw new Error('El libro está incompleto.');
    let data = bytes.slice(start, start + entry.compressed);
    if (entry.method === 8) {
      const reader = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      const chunks = []; let length = 0;
      while (true) { const { value, done } = await reader.read(); if (done) break; length += value.length; if (length > entry.size || length > 20 * 1024 * 1024) { await reader.cancel(); throw new Error('El libro supera el límite de descompresión.'); } chunks.push(value); }
      data = new Uint8Array(length); let pos = 0; for (const chunk of chunks) { data.set(chunk, pos); pos += chunk.length; }
    } else if (entry.method !== 0) throw new Error('Compresión no compatible. Guarda el archivo como XLSX estándar.');
    if (data.length !== entry.size) throw new Error('El tamaño interno del libro es inválido.');
    const doc = new DOMParser().parseFromString(decoder.decode(data), 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('El contenido XML del libro es inválido.');
    return doc;
  }
  const workbook = await xml('xl/workbook.xml'), rels = await xml('xl/_rels/workbook.xml.rels');
  const targets = new Map(Array.from(rels.getElementsByTagName('Relationship')).filter(r => r.getAttribute('TargetMode') !== 'External').map(r => [r.getAttribute('Id'), r.getAttribute('Target')]));
  const strings = entries.has('xl/sharedStrings.xml') ? Array.from((await xml('xl/sharedStrings.xml')).getElementsByTagName('si')).map(si => Array.from(si.getElementsByTagName('t')).map(t => t.textContent).join('')) : [];
  const sheets = [];
  for (const sheet of workbook.getElementsByTagName('sheet')) {
    const target = targets.get(sheet.getAttribute('r:id')); if (!target) continue;
    const path = target.startsWith('/') ? target.slice(1) : new URL(target, 'https://local.invalid/xl/').pathname.slice(1);
    const doc = await xml(path), rows = [];
    for (const row of doc.getElementsByTagName('row')) {
      const rowNumber = Number(row.getAttribute('r') || rows.length + 1);
      if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > 2001) throw new Error('Importa un máximo de 2.000 filas por hoja, con encabezados en la primera fila.');
      const values = [];
      for (const cell of row.getElementsByTagName('c')) {
        const ref = cell.getAttribute('r') || ''; let col = 0;
        for (const ch of (ref.match(/^[A-Z]+/) || ['A'])[0]) col = col * 26 + ch.charCodeAt(0) - 64;
        if (col > 100) throw new Error('Importa un máximo de 100 columnas por hoja.');
        const type = cell.getAttribute('t'), value = cell.getElementsByTagName('v')[0]?.textContent || '';
        values[col - 1] = type === 's' ? strings[Number(value)] ?? '' : type === 'inlineStr' ? Array.from(cell.getElementsByTagName('t')).map(t => t.textContent).join('') : value;
      }
      while (rows.length < rowNumber) rows.push([]);
      rows[rowNumber - 1] = values;
    }
    sheets.push({ name: sheet.getAttribute('name'), rows });
  }
  if (!sheets.length) throw new Error('No hay hojas disponibles en este libro.');
  return sheets;
};
