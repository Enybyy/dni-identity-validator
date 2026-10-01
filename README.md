# DNI Studio

Aplicación web para revisar el formato de DNIs, comparar nombres completos e importar listas CSV o Excel con datos ficticios de demostración.

![Consulta de una ficha ficticia en DNI Studio](assets/screenshots/portfolio-1000x750.png)

[Abrir demo](https://enybyy.github.io/dni-identity-validator/) · [Ver capturas](assets/screenshots/) · [Evidencia de pruebas](docs/verification.md)

## Ejecución local

Requiere Python 3 para servir los archivos. La aplicación no tiene dependencias de red, cuentas ni claves API.

```powershell
git clone https://github.com/Enybyy/dni-identity-validator.git
cd dni-identity-validator
python -m http.server 5082 --bind 127.0.0.1
```

Abre `http://127.0.0.1:5082`. Para publicar la misma aplicación, configura GitHub Pages sobre la raíz de la rama principal.

## Uso

- **Una ficha:** escribe exactamente ocho dígitos. Cada entrada genera siempre el mismo nombre ficticio; conserva ceros iniciales. Puedes comparar el nombre completo, copiar los datos o descargar JSON.
- **Una lista:** pega un DNI por línea o una tabla CSV con encabezados, importa `.csv` o `.xlsx`, selecciona la hoja y las columnas DNI y nombre completo, y pulsa **Revisar lista**.
- **Resultados:** distingue formato inválido, nombre por revisar, coincidencia con la demo y registros sin nombre para comparar. Señala los DNIs repetidos. Exporta CSV con la fuente ficticia identificada en cada fila.
- **Ejemplos:** el botón **Cargar ejemplo** presenta coincidencias, un nombre diferente, un duplicado y un DNI incompleto. También se incluyen [CSV](examples/registros.csv) y [Excel con dos hojas](examples/registros.xlsx).

La primera fila de cada archivo debe contener los encabezados. El nombre a comparar debe estar en una única columna con nombres y ambos apellidos. Se omiten diferencias de tildes, mayúsculas y espacios repetidos; no se considera suficiente que coincida solo el primer nombre.

Al usar Excel, guarda la columna DNI como texto. Si el libro ya perdió los ceros iniciales, la aplicación informa formato inválido en lugar de inventar los dígitos faltantes. Al volver a abrir un CSV en Excel, importa también esa columna como texto.

## Qué demuestra

Un flujo funcional de entrada, validación, revisión por lotes y exportación. **No consulta registros oficiales, no verifica que un DNI exista y no acredita identidades.** Todos los nombres y ubicaciones son ficticios; una coincidencia con la demo compara texto, no constituye una verificación real. El diseño de la ficha no representa un carné oficial.

El proyecto reemplaza las páginas anteriores y el proxy ligado a un proveedor específico por una aplicación estática independiente. La integración con un servicio real no forma parte de esta versión. Las claves de cualquier futura integración deben permanecer en un servidor propio.

## Pruebas

Las pruebas del núcleo requieren Node.js 18 o posterior y no requieren instalar paquetes.

```powershell
node --test tests/core.test.cjs
```

La prueba de navegador requiere Playwright y Chromium instalados. Con el servidor local activo:

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

Si Playwright está instalado fuera del proyecto, configura `PLAYWRIGHT_MODULE` con su ruta. El test genera las capturas reales de escritorio, listas y móvil. Para regenerar el libro de prueba, ejecuta `python tests/make_fixture.py`.

Se verificaron cinco pruebas del núcleo y el recorrido de navegador completo. Consulta [la evidencia y los límites](docs/verification.md).

## Estructura

```text
index.html                 aplicación y controles accesibles
assets/core.js             formato, datos ficticios, CSV y comparación
assets/xlsx.js             importador XLSX local y limitado
assets/app.js              interacción, mapeo y exportaciones
assets/style.css           diseño adaptable
assets/screenshots/        capturas reales para README y portafolio
examples/                  listas de demostración CSV y XLSX
tests/                     pruebas reproducibles
docs/                      diseño y evidencia
```

El importador XLSX lee cadenas compartidas, cadenas inline y valores guardados; no ejecuta macros, evalúa fórmulas ni utiliza estilos para transformar números. Admite hasta 5 MB de archivo, 20 MB de contenido interno, 2.000 registros y 100 columnas. Los libros `.xls` deben convertirse a `.xlsx`; en navegadores sin descompresión compatible puedes importar CSV.

Los datos se procesan en memoria del navegador; no se guardan en `localStorage` ni se envían a una API. El texto importado se inserta como texto, y el exportador neutraliza prefijos que podrían interpretarse como fórmulas en una hoja de cálculo.

## Capturas para portafolio

| Archivo | Uso |
| --- | --- |
| [portfolio-1000x750.png](assets/screenshots/portfolio-1000x750.png) | Vista 4:3 de la ficha, para la galería del portafolio |
| [desktop.png](assets/screenshots/desktop.png) | Aplicación completa de escritorio |
| [batch.png](assets/screenshots/batch.png) | Revisión de lista y exportación |
| [mobile.png](assets/screenshots/mobile.png) | Interfaz móvil, captura completa a 390 px |

Descripción sugerida: «DNI Studio: demo web de revisión de registros, con importación CSV/Excel, comparación de nombres completos, detección de duplicados y exportación. Datos ficticios; no consulta registros oficiales.»
