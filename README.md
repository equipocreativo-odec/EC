# Retos del Ecosistema Creativo — Validación por clave (sin servidor)

Esta versión permite que un **verificador humano** entregue una **clave** (token). Cuando el participante la ingresa, **recibe puntos y avanza de nivel**.

## Estructura
- `index.html` — interfaz con sección "Validación de reto con clave".
- `app.js` — lógica de niveles y validación de claves contra `data/valid_keys.json`.
- `data/valid_keys.json` — listado de claves válidas (edítalo para tu operación real).
- `data/retos.json` — catálogo de retos (informativo en esta versión).
- `assets/badges/*.svg` — insignias BRONCE → LEYENDA.

## Cómo usar
1. **Sube** todo a tu repo y activa **GitHub Pages**.
2. Entrega **claves** a los participantes (por evento, reto o persona).
3. Ellos ingresan la clave en la web y, si es válida, **reciben puntos**.

## Cómo administrar claves
- Edita `data/valid_keys.json` y publica. Ejemplo:
```json
{
  "EC-7421": { "retoId": "R1", "puntos": 20, "meta": "Evento" },
  "VISITA-ARTE-9922": { "retoId": "R2", "puntos": 50, "meta": "Video" }
}
```
- **Nota:** En modo estático, la misma clave podría reutilizarse por distintos usuarios. El sistema **evita que la misma persona la use dos veces** en el mismo dispositivo (con `usedKeys` en `localStorage`). Si necesitas **bloquear reutilización global**, usa la variante con **Apps Script** para marcar clave como usada en una hoja.

## Evolución a control total (opcional)
- Conéctalo a un **Web App de Google Apps Script** para:
  - Validar la clave contra una hoja y marcarla como **usada**.
  - Registrar quién la canjeó (nombre, fecha, reto, puntos).
  - Exponer un **CSV** resumido para el leaderboard.

## Personalización
- Ajusta los umbrales de niveles en `app.js` → `LEVELS`.
- Ajusta los puntos por tipo de reto (si los usas) en `PUNTOS`.
- Cambia el estilo en `styles.css`.

## Privacidad
- Esta versión no envía datos a servidores; todo se guarda **localmente** en el navegador.
