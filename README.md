# Retos del Ecosistema Creativo — Sitio estático

Este paquete contiene una app estática para el programa de gamificación (niveles BRONCE → LEYENDA) lista para publicarse en **GitHub Pages**.

## Cómo publicar en GitHub Pages

1. Crea un repositorio (por ejemplo, `retos-ecosistema`) y sube todos los archivos.
2. En GitHub, ve a **Settings → Pages** y elige la fuente de publicación:
   - `main / root` (si `index.html` está en la raíz)
   - o `main /docs` (si mueves todo dentro de la carpeta `docs/`).
3. Guarda y espera la URL pública (`https://usuario.github.io/retos-ecosistema/`).

> GitHub Pages busca un archivo de entrada como `index.html` en la fuente configurada y permite publicar desde `/docs`. Revisa la documentación oficial para más detalles.

## Insertar en otro sitio

Usa un `<iframe>` donde quieras mostrarlo:

```html
<iframe src="https://TU_USUARIO.github.io/retos-ecosistema/" style="width:100%;height:100vh;border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

## Activar analítica (opcional)

1. Crea una propiedad GA4 y obtén tu **Measurement ID** (formato `G-XXXX...`).
2. En `index.html` descomenta el bloque del Google tag, reemplaza el ID y publica.

## Personalización rápida

- Ajusta los rangos en `app.js` (constante `LEVELS`).
- Cambia puntajes por tipo de reto en `app.js` (`PUNTOS`).
- Edita/añade retos en `data/retos.json`.
- Reemplaza los SVG de `assets/badges/` si quieres otro estilo.

## Notas

- Todo se almacena **localmente** en el navegador (sin backend). Para moderación y leaderboard global, conéctalo a un formulario/hoja o una API.
- Los estilos usan la paleta Neón + Gaming + toque Caribe.
