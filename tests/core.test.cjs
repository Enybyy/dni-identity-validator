const { test } = require('node:test');
const assert = require('node:assert/strict');
const I = require('../assets/core.js');
test('accepts exactly eight ASCII digits and preserves leading zeroes', () => {
  for (const value of ['00123456', '00000000', '99999999']) assert.equal(I.validateDni(value), true);
  for (const value of [' 12345678', '12345678 ', '1234567', '123456789', '１２３４５６７８', '١٢٣٤٥٦٧٨', '1234A678', '=12345678', '', null]) assert.equal(I.validateDni(value), false);
  assert.equal(I.profile('00123456').dni, '00123456'); assert.throws(() => I.profile('123'));
});
test('profiles are deterministic and explicitly fictional', () => {
  assert.deepEqual(I.profile('12345678'), I.profile('12345678'));
  assert.match(I.profile('12345678').source, /ficticios/);
  assert.notDeepEqual(I.profile('12345678'), I.profile('87654321'));
});
test('compares entire name rather than first token; normalizes accents and space', () => {
  const p = I.profile('12345678');
  const results = I.processRows([['12345678', '  ' + p.fullName.toUpperCase().replaceAll(' ', '   ')], ['12345678', p.names + ' Otro Otro'], ['00123456', ''], ['123', 'x']], 0, 1);
  assert.equal(results[0].status, 'Coincide con demo'); assert.equal(results[1].status, 'Revisar nombre');
  assert.equal(results[1].duplicate, true); assert.equal(results[2].status, 'Sin comparar'); assert.equal(results[3].status, 'Formato inválido');
  assert.equal(I.normalize('LUCÍA  PÉREZ'), 'LUCIA PEREZ');
});
test('CSV preserves quoted separators, multiline cells, BOM, CRLF and leading zeros', () => {
  assert.deepEqual(I.parseCsv('\uFEFFDNI;Nombre\r\n00123456;"Ana; Rojas"\r\n12345678;"Ana\n""Luna"""\r\n'), [['DNI', 'Nombre'], ['00123456', 'Ana; Rojas'], ['12345678', 'Ana\n"Luna"']]);
  assert.deepEqual(I.parseCsv('DNI,nombre\n12345678,'), [['DNI', 'nombre'], ['12345678', '']]);
  for (const value of ['', 'dni\n"123', 'dni\nabc"x"', 'dni\n"x"bad']) assert.throws(() => I.parseCsv(value));
  assert.throws(() => I.parseCsv('DNI\n' + '12345678\n'.repeat(2001)), /2.000/);
  assert.throws(() => I.parseCsv('column,'.repeat(100) + 'column'), /100 columnas/);
});
test('export neutralizes spreadsheet formulas and includes fictional source', () => {
  const csv = I.exportCsv(I.processRows([['=1+1', '\t=WEBSERVICE("x")'], ['12345678', '@SUM(1,1)']], 0, 1));
  const rows = I.parseCsv(csv);
  assert.equal(rows[1][1], "'=1+1"); assert.equal(rows[1][2], "'\t=WEBSERVICE(\"x\")");
  assert.equal(rows[2][2], "'@SUM(1,1)"); assert.match(rows[1][6], /no verifica identidad/);
});
