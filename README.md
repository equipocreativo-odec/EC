# Retos del Ecosistema Creativo — Claves con bloqueo global (Apps Script)

Este paquete integra **validación de claves** con un **Web App de Google Apps Script** y una **Hoja de Google** para:

- Validar claves únicas y **marcarlas como usadas** (bloqueo global).
- Acreditar puntos a la persona.
- Registrar en `Evidencias`.
- Mantener `Leaderboard` con suma incremental.
- (Opcional) Publicar `Leaderboard` como **CSV** y consumirlo en el frontend.

## 1) Preparar la Hoja de Google
1. Crea un Spreadsheet y copia su **ID** (lo verás en la URL).
2. Crea 3 pestañas con estos nombres exactos:
   - `Keys` (cabeceras fila 1): `key, retoId, puntos, meta, usado_por, usado_fecha`
   - `Evidencias` (cabeceras fila 1): `timestamp, nombre, retoId, puntos, meta`
   - `Leaderboard` (cabeceras fila 1): `nombre, puntos`
3. Agrega algunas **claves** de prueba en `Keys`.

## 2) Desplegar el Web App en Apps Script
1. En la misma hoja: **Extensiones → Apps Script**.
2. Crea el archivo `apps-script-keys.gs` y pega el contenido de `server/apps-script-keys.gs`.
3. Cambia `SHEET_ID` por el ID de tu hoja. Si deseas, define `SHARED_TOKEN`.
4. **Deploy → New deployment → Type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copia la URL que termina en **/exec**.

> Si tras cambios no ves efecto en `/exec`, recuerda **publicar una nueva versión** del Web App. 

## 3) Configurar el frontend
Edita `app.js`:
```js
const APPS_SCRIPT_KEYS_ENDPOINT = 'https://script.google.com/macros/s/XXX/exec';
const SHARED_TOKEN = 'opcional_mi_token'; // igual al del backend si lo usas
```

## 4) (Opcional) Leaderboard global
- Publica la pestaña `Leaderboard` como **CSV**: en la hoja, `Archivo → Compartir → Publicar en la web` y elige formato CSV. Copia la URL y pégala en `app.js`:
```js
const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/ID/pub?output=csv';
```

## 5) Flujo de uso
- Un verificador entrega una **clave**.
- El/la joven la digita y pulsa **Validar y acreditar puntos**.
- El backend verifica que exista y no esté usada, acredita puntos y **marca la clave**.
- El frontend actualiza el progreso local y puede refrescar el leaderboard global.

## 6) GitHub Pages
- Sube todo el contenido a tu repositorio y publica con **GitHub Pages** (fuente: rama `main` o carpeta `/docs`).

---

### Estructura del paquete
- `index.html`, `styles.css`, `app.js`
- `assets/badges/*.svg` – insignias BRONCE → LEYENDA
- `server/apps-script-keys.gs` – backend Apps Script
- `README.md` – esta guía

