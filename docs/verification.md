# Evidencia de verificación

Verificación local: 1 de octubre de 2026, Chromium con Playwright y Node.js. Ninguna consulta a registros de identidad.

## Resultado observado

`node --test tests/core.test.cjs`: 5 pruebas aprobadas. Se cubrieron ocho dígitos ASCII, ceros iniciales, entradas inválidas, perfiles deterministas, comparación del nombre completo, tildes y espacios, CSV con comillas/saltos de línea/semicolon/BOM y exportación que neutraliza fórmulas.

`node tests/browser.cjs`: aprobado. Se comprobaron ficha individual, error por dígitos Unicode, comparación coincidente y diferente, navegación de pestañas con teclado, descarga JSON, cinco filas del ejemplo, duplicados, descarga CSV, texto HTML tratado como texto, error de mapeo, XLSX real con dos hojas y ceros iniciales, selección de hoja, archivos corruptos y CSV con comillas sin cerrar.

La suite también comprobó ausencia de desbordamiento horizontal a 360, 390, 768, 1000 y 1440 px; no recibió errores de JavaScript ni solicitudes externas durante el recorrido local.

Las capturas de `assets/screenshots/` son salidas reales del navegador, con las animaciones finalizadas. Se inspeccionaron la ficha, la lista y la composición móvil. La ficha ficticia tiene la marca «Sin valor oficial».

## Límites

- La demo valida formato y compara con datos generados, no identidad real, existencia del DNI ni registros de RENIEC.
- Se probó el importador XLSX en Chromium. Utiliza `DecompressionStream('deflate-raw')`, disponible en navegadores modernos; si no está disponible, utiliza CSV.
- XLSX se limita a 5 MB comprimidos, 20 MB internos, 2.000 registros, 100 columnas y 1.000 partes ZIP. Solo lectura; no evalúa fórmulas ni interpreta estilos. `.xls`, libros cifrados y ZIP multipartes no se admiten.
- Las capturas no prueban el despliegue remoto. La publicación y accesibilidad de GitHub Pages se verifican separadamente.
