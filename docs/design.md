# Dirección de diseño

**Proyecto:** DNI Studio, una herramienta local de revisión de formato y comparación de registros con datos ficticios.
**Público:** usuarios administrativos y visitantes de un portafolio técnico.
**Objetivo:** probar la ficha individual y entender la revisión de listas en la primera pantalla.

Colores: cobalto `#234BD7` para acciones; noche `#152650` para la ficha y texto; hielo `#EDF3FF` para el fondo; blanco `#FFFFFF` para el espacio de trabajo; acero `#56678A` para texto auxiliar; verde `#14694B` para coincidencias de formato.

Tipografía: Segoe UI en controles y Georgia en el nombre de la ficha. Fuentes locales, sin dependencias de red.

Composición alineada a la izquierda: entrada estrecha junto a una ficha horizontal; al cambiar a lista, el resultado pasa a tabla. En móvil los paneles se apilan.

```text
marca                                    código / instalación
titular de revisión                      aviso de datos ficticios
┌ entrada + pestañas ┬ ficha / tabla de revisión ┐
│ DNI / importar     │ nombre y DNI              │
│ comparar / mapeo   │ detalle / exportar         │
└───────────────────┴───────────────────────────┘
```

Principio: una ficha legible y memorables nombres serif representan el dato que se está revisando; no imita un documento oficial. Se eliminaron estadísticas inventadas, degradados y sellos de validación oficiales. Los controles y la jerarquía usan bordes simples; solo el resultado tiene una animación breve, desactivada con movimiento reducido.
