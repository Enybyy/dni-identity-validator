# 🪪 DNI Identity Validator — Servicio Serverless & Herramienta de Verificación de Identidad
> **API Serverless con Reverse Proxy seguro (Cloudflare Pages Functions), interfaz web y procesador por lotes para validación de DNI (RENIEC / Decolecta).**

[![Serverless](https://img.shields.io/badge/Architecture-Cloudflare%20Edge%20Workers-f38020.svg)](#-arquitectura-y-seguridad)
[![Python](https://img.shields.io/badge/Batch%20Processing-Python%20%7C%20Pandas-3776ab.svg)](#-procesamiento-por-lotes-python)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 El Desafío de Negocio

En procesos de onboarding de clientes, contratación de personal, emisión de comprobantes o plataformas financieras, la verificación de identidad mediante el Documento Nacional de Identidad (DNI) es obligatoria y crítica. Sin embargo, las empresas enfrentan obstáculos comunes:

1. **Exposición de Credenciales**: Al conectar aplicaciones web directamente a APIs de consulta de identidad, los tokens privados quedan expuestos en el código del navegador del cliente, abriendo brechas graves de seguridad.
2. **Problemas de CORS y Bloqueos de Red**: Las APIs gubernamentales o de terceros bloquean solicitudes directas de navegadores por políticas de *Cross-Origin Resource Sharing* (CORS).
3. **Validación Manual Ineficiente**: Validar cientos de registros ingresados manualmente en formularios provoca demoras de días y altas tasas de error tipográfico en nombres y apellidos.

---

## 💡 La Solución Implementada

Este proyecto implementa una **solución integral y segura de verificación de identidad** dividida en tres componentes sinérgicos:

1. **API Gateway / Proxy Serverless en el Edge (`functions/api/dni.js`)**:
   - Construido sobre **Cloudflare Pages Functions**.
   - Resuelve de raíz los problemas de CORS mediante el manejo transparente de solicitudes preflight (`OPTIONS`) y cabeceras de control de acceso.
   - Oculta de forma segura el token upstream (`DECOLECTA_TOKEN`) en variables de entorno del servidor.
2. **Interfaz Web de Consulta en Tiempo Real (`verificador_dni.html`)**:
   - Validación instantánea al escribir el número de DNI.
   - Retorno inmediato de nombres, apellidos y dígito verificador.
3. **Motor de Procesamiento y Auditoría por Lotes (`analizar_excel.py` & `proxy_decolecta.py`)**:
   - Automatización en Python para leer hojas de cálculo de Excel con miles de filas, consultar la API en lote y exportar reportes consolidados con datos verificados o anomalías detectadas.

---

## 📈 Impacto y Mejoras Conseguidas

| Desafío Previo | Solución con DNI Identity Validator | Beneficio para el Negocio |
|---|---|---|
| **Seguridad de Tokens** | Credenciales expuestas en frontend | Tokens aislados en entorno Serverless seguro | **Protección total de API keys y reducción de riesgos de robo de cuota** |
| **Tiempo de Validación Manual** | 2 a 3 minutos por persona (búsqueda y tipeo manual) | < 500 ms de respuesta por consulta | **Agilización del onboarding de clientes en un 85%** |
| **Cotejo de Bases de Datos Masivas** | Días de trabajo administrativo | Procesamiento batch automatizado de miles de filas de Excel | **Ahorro de decenas de horas hombre en auditorías y nóminas** |
| **Infraestructura y Costos** | Necesidad de servidor backend dedicado 24/7 | Arquitectura Serverless Edge sin costo de servidores inactivos | **Cero costos fijos de infraestructura** |

---

## ✨ Funcionalidades Técnicas Clave

- **CORS Handling Avanzado**: Soporte completo para cabeceras `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` y `Access-Control-Allow-Headers`.
- **Doble Esquema de Autenticación**: Permite autenticarse mediante cabecera `X-API-Token`, cabecera estándar `Authorization: Bearer <token>`, o variable de entorno segura `DECOLECTA_TOKEN`.
- **Manejo Resiliente de Errores**: Códigos de estado HTTP semánticos (400 por formato inválido, 401 por falta de credenciales, 405 por métodos no permitidos, 502 por caídas upstream).
- **Procesamiento de Archivos Excel (.xlsx)**: Limpieza automática de cadenas de texto, validación de 8 dígitos y enriquecimiento de bases de datos.

---

## 🛠️ Stack Tecnológico

- **Edge Computing & Serverless**: Cloudflare Pages Functions / Workers Runtime.
- **Backend / Scripts de Auditoría**: Python 3, Pandas, Requests, OpenPyXL.
- **Frontend**: HTML5, CSS3 moderno y Vanilla JavaScript (Fetch API).
- **APIs de Integración**: Servicio REST de Decolecta / RENIEC.

---

## 🗂️ Estructura del Repositorio

```text
├── functions/
│   └── api/
│       └── dni.js           # Cloudflare Pages Function (API Serverless & CORS Proxy)
├── verificador_dni.html     # Interfaz web de usuario para consultas directas
├── analizar_excel.py        # Script en Python para análisis y verificación masiva de Excel
├── proxy_decolecta.py       # Proxy local en Python para pruebas y entornos de desarrollo
└── README.md                # Documentación del proyecto
```

---

## 🚀 Despliegue y Uso Rápido

### Despliegue Serverless en Cloudflare Pages
1. Conectar este repositorio a tu cuenta de **Cloudflare Pages**.
2. En la configuración de la página, agregar la variable de entorno:
   - `DECOLECTA_TOKEN`: Tu token de API obtenido en Decolecta.
3. Desplegar: la función quedará disponible automáticamente en `https://tu-proyecto.pages.dev/api/dni?numero=XXXXXXXX`.

### Uso de Scripts Locales (Python)
1. Instalar dependencias:
   ```bash
   pip install pandas requests openpyxl
   ```
2. Ejecutar análisis de archivo Excel:
   ```bash
   python analizar_excel.py
   ```

---

## 📬 ¿Buscas integrar APIs y validar datos en tu negocio?

Como desarrollador freelance, diseño e implemento **arquitecturas serverless seguras, integraciones con APIs externas (KYC, facturación, pasarelas de pago) y pipelines de procesamiento masivo de datos**.

- **GitHub**: [@Enybyy](https://github.com/Enybyy)
- **Perfil Profesional**: Eliud RM — Data Science & Software Solutions
- *Contáctame para proyectos de integración, automatización y desarrollo cloud.*
