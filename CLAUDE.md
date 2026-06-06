# Fabrisio sin Humo — guía del proyecto

App SPA de consultoría/estrategia con IA, en español rioplatense. React 18 + Vite 6 + Tailwind v4 (config CSS-first en `src/index.css`, NO hay `tailwind.config.js`). Todo el front vive en `src/app.tsx` (monolítico, ~3000 líneas, navegación por `screen === 'X'`). Backend = Cloudflare Worker proxy (`worker.js`, deploy manual). Hosting Vercel, dominio `fabrisiosinhumo.com`.

## Comandos
- `npm run dev` — Vite dev server (suele levantar en http://localhost:5173)
- `npm run build` — `tsc -b && vite build`. Corré esto antes de dar algo por terminado.

## Reglas de código (importantes)
- **Rules of Hooks:** NUNCA metas `useState`/`useEffect`/hooks dentro de bloques `if (screen==='X')`. Los hooks van todos arriba, al tope del componente `App`. Dentro de un bloque condicional sí podés declarar `const` normales (variables, arrays, variantes de Motion).
- **Tipado pragmático:** preferí `: any` y casts antes que pelearte con tipos estrictos. No es una codebase que premie tipos perfectos.
- **Tailwind v4:** la config va en `@theme` dentro de `src/index.css`, no en JS. Si una librería pide pegar `keyframes`/`animation` en `tailwind.config.js`, traducílo a `@theme` + `@keyframes` en el CSS.
- **i18n:** todo texto visible sale de `t.es` / `t.en` (objeto `t` al tope de `app.tsx`), elegido por `lang`. No hardcodees strings nuevos sin agregarlos a ambos idiomas.

## Stack visual (rediseño en curso, 2026-06)
- `motion` (import `{ motion } from 'motion/react'`) para animación. `main.tsx` ya envuelve la app en `<MotionConfig reducedMotion="user">`, así que toda animación de Motion respeta `prefers-reduced-motion` automáticamente — no hace falta gatearla a mano.
- `shadcn/ui` configurado (preset radix-nova, `components.json` en raíz). Agregar componentes con `npx shadcn@latest add <nombre>` → caen en `src/components/ui/`. Helper `cn()` en `src/lib/utils.ts`.
- Fuente global **Geist** (`@fontsource-variable/geist`).
- `<html class="dark">` fija el tema oscuro (los tokens shadcn tienen `:root` = modo claro).
- MCP `chrome-devtools` disponible para sacar screenshots e iterar el diseño viéndolo.

## Sistema de diseño (OBLIGATORIO al tocar UI)
La marca es **directa, sin chamuyo, alto contraste**. Mantené esta identidad — no la diluyas en un SaaS genérico.

- **Paleta:** fondo `zinc-950` (casi negro). Acento ÚNICO = amarillo (`yellow-400`, con `yellow-300`/`amber-500` para gradientes y `yellow-500` para glows). Grises de apoyo: `zinc-900`/`zinc-800`/`zinc-700` (superficies y bordes), texto `white` / `zinc-400` / `zinc-600`. Estados: `emerald-400` (éxito), `red-400` (error).
- **Tipografía:** body en **Geist**. Los **títulos display del landing** (hero + títulos de sección + "Soy Fabrisio") van en **Fraunces** (serif editorial) vía la clase `font-heading` (mapeada en `@theme inline` de `index.css`). Las pantallas internas siguen en Geist. Headings grandes y bold con `tracking-tight` `leading-[1.05]`. Saltos de tamaño marcados (ej. `text-6xl md:text-7xl` en hero). Para frases de impacto usar texto con gradiente amarillo (`bg-gradient-to-r ... bg-clip-text text-transparent`).
- **Profundidad:** glassmorphism sutil (`bg-zinc-900/40 backdrop-blur-sm` + borde `zinc-800`). Glows con `shadow-*/30` y orbes `blur-[120px]`. Radios `rounded-xl`/`rounded-2xl`.
- **Movimiento:** entrada escalonada con Motion (variants `staggerChildren`), hover lift con spring (`whileHover={{y:-4}}`), easing `[0.23,1,0.32,1]` (matchea las curvas de Emil ya definidas en `index.css`: `--ease-out-strong` etc.). Animaciones < 600ms. Orbes de fondo "que respiran" vía clases `.orb-breathe` / `.orb-drift` del CSS.

### PROHIBIDO (esto es "AI slop", no lo hagas)
- Fuentes Inter / Roboto / Open Sans / system default — usá Geist.
- Gradientes violeta→azul o pasteles. El único gradiente de marca es amarillo→ámbar.
- Fondos blancos / tema claro. La app es oscura.
- Más de un color de acento. Amarillo manda; nada de meter celestes, rosas, etc.
- Animar `width`/`height`/`top`/`left` (jank). Solo `transform` y `opacity`.
- `transition: all`. Listá las propiedades.

## Flujo de trabajo visual (cuando se mejora la UI)
1. Una pantalla por vez (`screen === 'X'`), no toda la app de una.
2. `npm run dev` corriendo + screenshot (chrome-devtools MCP) para comparar contra referencia.
3. Pulido final de animación/interacción con la skill `emil-design-eng`.
4. `npm run build` antes de cerrar.
