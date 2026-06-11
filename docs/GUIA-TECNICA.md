# 🏋️ Guía Técnica — Proyecto Blackterz

> Backend con Node.js + Express + MySQL | Frontend Vanilla JS
> Construido paso a paso con SDD (Spec-Driven Development)

---

## Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Hito 1 — Inicialización del Backend](#3-hito-1--inicialización-del-backend)
4. [Hito 3 — Arquitectura MVC (Modelo/Controlador/Ruta)](#4-hito-3--arquitectura-mvc)
5. [Hito 4 — Transacciones SQL](#5-hito-4--transacciones-sql)
6. [Hito 5 — Frontend Visual (Dark Mode)](#6-hito-5--frontend-visual-dark-mode)
7. [Hito 6 — Autenticación JWT + bcrypt](#7-hito-6--autenticación-jwt--bcrypt)
8. [Hito 7 — Protección de Rutas + Anti-Spoofing](#8-hito-7--protección-de-rutas--anti-spoofing)
9. [Hito 8 — Login Frontend + localStorage](#9-hito-8--login-frontend--localstorage)
10. [Hito 9 — Inputs por Serie + Guardar Entrenamiento](#10-hito-9--inputs-por-serie--guardar-entrenamiento)
11. [Hito 10 — Dashboard + Historial de Entrenamientos](#11-hito-10--dashboard--historial-de-entrenamientos)
12. [Hito 11 — Correcciones UX (3 partes)](#12-hito-11--correcciones-ux-3-partes)
13. [Tarea Especial — Seed Scraper y Catálogo en Español](#13-tarea-especial--seed-scraper-y-catálogo-en-español)
14. [Bugfix + Buscador de Ejercicios](#14-bugfix--buscador-de-ejercicios)
15. [Hito 12 — Navegación 3 vistas + Perfil + Temporizador + Burbuja Flotante](#15-hito-12--navegación-3-vistas--perfil--temporizador--burbuja-flotante)
16. [Hito 12.5 — Interfaz de Registro de Usuarios](#16-hito-125--interfaz-de-registro-de-usuarios)
17. [Hito 12.6 — Soft Delete de Cuenta (Borrado Lógico)](#17-hito-126--soft-delete-de-cuenta-borrado-lógico)
18. [Hito 12.7 — Avatar Real con Multer + MySQL](#18-hito-127--avatar-real-con-multer--mysql)
19. [Glosario de Conceptos](#19-glosario-de-conceptos)
20. [Resumen de APIs](#20-resumen-de-apis)

---

## 1. Resumen del Proyecto

**Blackterz** es una API REST para gestión de rutinas de entrenamiento físico. Permite:

- Ver rutinas con sus ejercicios asignados
- Registrar sesiones de entrenamiento completas (con ejercicios y series)
- Autenticación segura con JWT
- Frontend visual para consumir la API desde el navegador

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework HTTP** | Express 4.21 |
| **Base de Datos** | MySQL (driver mysql2/promise) |
| **Auth** | bcrypt (hasheo) + jsonwebtoken (JWT) |
| **Subida de archivos** | multer (fotos de perfil) |
| **Frontend** | HTML5 + CSS3 + Vanilla JS |
| **Entorno** | dotenv para variables de entorno |

### Base de Datos

La base de datos real se llama **`fitness_app`** (no `blackterz`). Fue creada en un proyecto anterior y reutilizada acá. Contiene las tablas:

- `usuarios` — id, nombre, email, password, created_at, **activo** (soft delete), **avatar_url** (foto de perfil)
- `rutinas` — id, usuario_id, nombre, descripcion, notas
- `ejercicios` — id, nombre, descripcion, categoria, imagen_url
- `ejercicios_rutinas` — id, rutina_id, ejercicio_id, orden, series, repeticiones, peso
- `sesiones_entrenamiento` — id, usuario_id, rutina_id, fecha, notas, **duracion_minutos**
- `sesion_ejercicios` — id, sesion_id, ejercicio_id, notas
- `sesion_series` — id, sesion_ejercicio_id, numero_serie, repeticiones, peso

---

## 2. Estructura de Archivos

```
Proyecto_Blackterz/
├── .env                          ← Variables de entorno (NO se sube a git)
├── .env.example                  ← Template de variables (sí se sube)
├── .gitignore
├── package.json
├── seedScraper.js                ← Scraper de strengthlevel.es (español)
├── seed.sql                      ← SQL generado con 64 ejercicios
├── docs/
│   ├── GUIA-TECNICA.md           ← Este archivo 🎯
│   ├── migracion-activo.sql      ← Migración: columna activo (soft delete)
│   └── migracion-avatar.sql      ← Migración: columna avatar_url
├── public/                       ← Frontend (estático)
│   ├── index.html                ← Página principal con login + registro + rutina + perfil + modales
│   ├── styles.css                ← Dark mode + cards + buscador + responsive + floating timer
│   ├── app.js                    ← Fetch + DOM + eventos + buscador + temporizador
│   └── images/
│       ├── *.avif                ← Imágenes de ejercicios (64)
│       └── avatars/              ← Fotos de perfil subidas por usuarios
└── src/
    ├── server.js                 ← Entry point (Express + MIME types)
    ├── config/
    │   └── db.js                 ← Pool de conexiones MySQL
    ├── middlewares/
    │   └── authMiddleware.js     ← Verificación de JWT
    ├── models/                   ← Capa de datos (SQL)
    │   ├── rutinaModel.js        ← Rutina + ejercicios (JOIN)
    │   ├── sesionModel.js        ← Guardar sesión (transacción)
    │   ├── authModel.js          ← Usuarios: crear + buscar + activo
    │   ├── ejercicioModel.js     ← Catálogo con grupos musculares
    │   └── usuarioModel.js       ← Gestión de cuenta (desactivar, perfil, avatar)
    ├── controllers/              ← Capa de lógica HTTP
    │   ├── rutinaController.js
    │   ├── sesionController.js
    │   ├── authController.js     ← register + login (verifica activo)
    │   ├── ejercicioController.js← GET /api/ejercicios
    │   └── usuarioController.js  ← eliminarCuenta, obtenerPerfil, subirAvatar (multer)
    └── routes/                   ← Capa de enrutamiento
        ├── health.js
        ├── rutinaRoutes.js
        ├── sesionRoutes.js
        ├── authRoutes.js
        ├── ejercicioRoutes.js
        └── usuarioRoutes.js      ← GET /me, DELETE /me, POST /avatar    ← Rutas del catálogo
```

---

## 3. Hito 1 — Inicialización del Backend

### Qué se hizo

Se creó la estructura base del proyecto Node.js + Express con conexión a MySQL:

1. `package.json` con dependencias: express, mysql2, dotenv, cors
2. `.env.example` con variables para conectar a MySQL
3. `src/config/db.js` con un Pool de conexiones a MySQL
4. `src/server.js` con Express, middlewares básicos y listener en puerto 3000
5. `GET /api/health` que ejecuta `SELECT 1` para verificar que la DB responda

### Decisiones técnicas

**Pool de conexiones (no una conexión única):**

```
En vez de:
  const connection = mysql.createConnection(...)
  connection.query(...)
  connection.end()

Hacemos:
  const pool = mysql.createPool({ connectionLimit: 10, ... })
  pool.execute(...)  ← toma y libera conexiones automáticamente
```

Un pool mantiene N conexiones abiertas y las reutiliza. Ventajas:
- Si llegan 20 requests simultáneas, no se encolan esperando una sola conexión
- Si una conexión se cae, el pool la descarta y crea una nueva
- Configuración: `connectionLimit: 10` (máximo 10 abiertas)

**mysql2/promise en vez de mysql:**

```js
const mysql = require('mysql2/promise');
// vs
const mysql = require('mysql');
```

`mysql2` es un fork con mejor rendimiento, soporte nativo de Promises (async/await) y prepared statements reales. El `mysql` original requiere callbacks o un wrapper extra.

**dotenv al inicio de server.js:**

```js
require('dotenv').config();  ← PRIMERA línea (antes de cualquier otro require)
```

Si dotenv se ejecuta DESPUÉS de importar `db.js`, las variables de entorno como `DB_HOST` van a ser `undefined` cuando el pool intente conectarse.

### Flujo de una request

```
Cliente → GET /api/health
                │
                ▼
          Express recibe la request
                │
                ▼
          cors() → permite cross-origin
                │
                ▼
          express.json() → parsea el body (no aplica acá)
                │
                ▼
          Route: GET /api/health
                │
                ▼
          pool.execute('SELECT 1')
                │
                ├── OK → { status: "ok", db: "conectada" }
                │
                └── Error → next(error) → Error middleware → 500
```

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias y scripts start/dev |
| `.env.example` | Template de variables de entorno |
| `.gitignore` | Excluye node_modules/ y .env |
| `src/config/db.js` | Pool de conexiones MySQL (mysql2/promise) |
| `src/server.js` | Entry point: Express + middlewares + rutas |
| `src/routes/health.js` | Endpoint GET /api/health |

---

## 4. Hito 3 — Arquitectura MVC

### Qué se hizo

Se implementó el patrón **MVC (Modelo-Vista-Controlador)** para el endpoint de rutinas:

1. `src/models/rutinaModel.js` — Capa de datos (SQL con JOIN)
2. `src/controllers/rutinaController.js` — Capa de lógica HTTP
3. `src/routes/rutinaRoutes.js` — Capa de enrutamiento
4. `GET /api/rutinas/:id` — Devuelve rutina + ejercicios anidados

### Las 3 capas explicadas

```
CLIENTE                                           SERVIDOR
   │                                                 │
   │  GET /api/rutinas/42                            │
   │─────────────────────────────────────────────────▶│
                                                     │
                                          ┌──────────▼──────────┐
                                          │  RUTA (routes)      │
                                          │  "GET /:id ejecuta  │
                                          │   getRutina"        │
                                          └──────────┬──────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │  CONTROLADOR        │
                                          │  - Valida req.params│
                                          │  - Llama al modelo  │
                                          │  - Arma res.json()  │
                                          └──────────┬──────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │  MODELO             │
                                          │  - Ejecuta SQL      │
                                          │  - JOIN 3 tablas    │
                                          │  - Reestructura a   │
                                          │    JSON anidado     │
                                          └──────────┬──────────┘
                                                     │
                                                     ▼
                                                 MYSQL
```

**Regla de oro:** Cada capa tiene UNA responsabilidad y NO se mete en la de las otras.
- El modelo NO sabe qué es HTTP. Solo recibe datos, ejecuta SQL, devuelve datos.
- El controlador NO sabe qué es SQL. Solo recibe req, llama al modelo, arma res.
- La ruta NO tiene lógica. Solo mapea URLs a controladores.

### La consulta SQL (JOIN de 3 tablas)

```sql
SELECT
  r.id          AS rutina_id,
  r.nombre      AS rutina_nombre,
  e.id          AS ejercicio_id,
  e.nombre      AS ejercicio_nombre,
  er.orden,
  er.series,
  er.repeticiones,
  er.peso
FROM rutinas r
LEFT JOIN ejercicios_rutinas er ON r.id = er.rutina_id
LEFT JOIN ejercicios e ON er.ejercicio_id = e.id
WHERE r.id = ?
ORDER BY er.orden ASC
```

**LEFT JOIN** — Si una rutina no tiene ejercicios, igual la devolvemos (con lista vacía). Con `INNER JOIN` se perdería.

**El `?` es un placeholder** — mysql2 lo reemplaza escapando el valor. Previene inyección SQL.

### Reestructuración de tabular a jerárquico

El JOIN devuelve una fila por ejercicio:

```
rutina_id | rutina_nombre | ejercicio_id | ejercicio_nombre | orden
----------+---------------+--------------+------------------+-------
1         | Pecho         | 4            | Press Banca      | 1
1         | Pecho         | 1            | Press Hombros    | 2
```

En JavaScript lo transformamos a:

```json
{
  "id": 1,
  "nombre": "Rutina de Pecho",
  "ejercicios": [
    { "id": 4, "nombre": "Press Banca", "orden": 1, "series": 4, "repeticiones": 10 },
    { "id": 1, "nombre": "Press Hombros", "orden": 2, "series": 3, "repeticiones": 12 }
  ]
}
```

Esto se hace iterando las filas: la primera fila da los datos de la rutina, y cada fila agrega un ejercicio al array.

### Validación en el controlador

```js
const rutinaId = Number(req.params.id);
if (isNaN(rutinaId)) {
  return res.status(400).json({ status: 'error', message: '...' });
}
```

El controlador valida que el ID sea un número ANTES de llamar al modelo. Esto evita mandar `NaN` a la base de datos.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/models/rutinaModel.js` | SQL con JOIN, reestructuración a JSON |
| `src/controllers/rutinaController.js` | Validación de ID, llamada al modelo, respuesta |
| `src/routes/rutinaRoutes.js` | GET /:id → controlador |

### Por qué el health route NO sigue MVC

El endpoint `GET /api/health` quedó con todo inline en la ruta. **¿Por qué?** Porque es trivial: no tiene lógica de negocio, no tiene modelos, no tiene validación. Forzar MVC ahí sería sobrediseño. La regla es: **MVC para endpoints de dominio, simple para endpoints de infraestructura**.

---

## 5. Hito 4 — Transacciones SQL

### Qué se hizo

Endpoint `POST /api/sesiones` que guarda una sesión de entrenamiento completa usando una **transacción SQL** para garantizar integridad atómica.

### El problema que resuelve

Guardar una sesión requiere insertar en **3 tablas distintas**:

```
sesiones_entrenamiento  → 1 fila (la sesión)
    └── sesion_ejercicios  → N filas (los ejercicios de esa sesión)
          └── sesion_series → M filas (las series de cada ejercicio)
```

Sin transacción, si el servidor se cae después de insertar la sesión pero antes de los ejercicios, queda una **sesión huérfana** — datos inconsistentes.

### Cómo funciona una transacción

```
BEGIN;                     ← Acá arranca
INSERT INTO sesiones...;   ← 1. Inserta sesión
INSERT INTO sesion_ejercicios...; ← 2. Inserta ejercicios
INSERT INTO sesion_series...;     ← 3. Inserta series
COMMIT;                    ← Todo OK → guarda PERMANENTE

Si algo falla en el medio:
ROLLBACK;                  ← Borra TODO como si nunca hubiera pasado
```

**Propiedades ACID:**
- **Atomicidad**: Pasa TODO o pasa NADA
- **Consistencia**: Los datos siempre están válidos
- **Aislamiento**: Nadie ve los datos hasta el COMMIT
- **Durabilidad**: Después del COMMIT, los datos son persistentes

### El patrón de transacción en Node.js

```javascript
const connection = await pool.getConnection();   // 1. Pedir conexión DEDICADA
try {
  await connection.beginTransaction();           // 2. Iniciar transacción

  const [r1] = await connection.execute(...);    // 3. INSERT sesión
  const sesionId = r1.insertId;                  // ← insertId: el AUTO_INCREMENT generado

  for (const ejercicio of datos.ejercicios) {
    const [r2] = await connection.execute(...);  // 4. INSERT ejercicio
    const sesionEjercicioId = r2.insertId;

    for (const serie of ejercicio.series) {
      await connection.execute(...);             // 5. INSERT series
    }
  }

  await connection.commit();                     // 6. ✅ CONFIRMAR
} catch (error) {
  await connection.rollback();                   // 7. ❌ REVERTIR
  throw error;
} finally {
  connection.release();                          // 8. SIEMPRE liberar la conexión
}
```

**⚠️ Detalle clave:** Las transacciones requieren UNA conexión específica (`pool.getConnection()`). No se pueden hacer con `pool.execute()` directo porque cada llamada podría ir a una conexión distinta.

### `insertId` — Cómo mysql2 devuelve el ID generado

```js
const [resultado] = await connection.execute('INSERT INTO ...');
// resultado.insertId → el valor del AUTO_INCREMENT generado
// resultado.affectedRows → 1 (si se insertó 1 fila)
```

### Validación en el controlador

El controlador valida ANTES de llamar al modelo:
- ¿Vino el body?
- ¿Tiene `usuario_id`, `rutina_id`, `fecha`?
- `ejercicios` ¿es un array no vacío?
- Cada ejercicio, ¿tiene `ejercicio_id` y `series`?

Si la validación falla, responde 400 — nunca llega a la transacción.

### ¡El problema que encontramos!

Cuando probamos el POST, falló porque las **columnas reales de la DB no coincidían** con las que asumimos:

| Asumimos | Realidad |
|----------|----------|
| `sesion_ejercicios.observaciones` | ❌ → `sesion_ejercicios.notas` |
| `sesion_series.rpe` | ❌ → no existe |

**Lección:** Siempre verificá la estructura real de las tablas con `DESCRIBE nombre_tabla` antes de escribir queries. No asumas nada.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/models/sesionModel.js` | Transacción con getConnection/beginTransaction/commit/rollback |
| `src/controllers/sesionController.js` | Validación exhaustiva, respuesta 201 Created |
| `src/routes/sesionRoutes.js` | POST / → controlador |

---

## 6. Hito 5 — Frontend Visual (Dark Mode)

### Qué se hizo

Frontend básico con HTML, CSS y Vanilla JavaScript servido como archivos estáticos por Express:

1. `express.static('public')` en server.js
2. `index.html` con estructura semántica
3. `styles.css` con dark mode, tarjetas (cards), responsive
4. `app.js` que hace fetch a `/api/rutinas/1` y renderiza las cards

### Cómo funciona express.static()

```js
app.use(express.static(path.join(__dirname, '..', 'public')));
```

Cualquier archivo en `/public` se sirve automáticamente:
- `/public/index.html` → `http://localhost:3000/`
- `/public/styles.css` → `http://localhost:3000/styles.css`
- `/public/app.js` → `http://localhost:3000/app.js`

Express busca `index.html` automáticamente cuando visitás la raíz.

### Arquitectura del frontend

```
index.html            ← Estructura (header, login, rutina, footer)
    │
    ├── styles.css    ← Estilos (dark mode + cards + login)
    │
    └── app.js        ← Lógica (fetch + createElement + eventos)
```

No hay frameworks, no hay bundlers, no hay dependencias. Solo JavaScript del navegador con `fetch`, `createElement`, y `addEventListener`.

### El fetch() desde el frontend

```js
const respuesta = await fetch('/api/rutinas/1');
//   ↑ ruta RELATIVA porque el frontend está en el mismo
//     servidor (localhost:3000). Si estuviera en otro puerto,
//     necesitaría: http://localhost:3000/api/rutinas/1
```

### Dark Mode con CSS Variables

```css
:root {
  --bg-primary: #0f0f0f;       /* Fondo negro */
  --bg-card: #16213e;          /* Fondo de tarjetas */
  --text-primary: #e0e0e0;     /* Texto claro */
  --accent: #e94560;           /* Rojo fitness */
  --success: #00d2aa;          /* Verde para datos */
}
```

Las **variables CSS** permiten cambiar el tema completo tocando solo el bloque `:root`.

### Se agregó `er.peso` a la consulta

El modelo `rutinaModel.js` original no traía el peso de los ejercicios. Lo agregamos porque el frontend lo muestra en las cards.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `public/index.html` | Estructura HTML con secciones |
| `public/styles.css` | Dark mode, cards, responsive |
| `public/app.js` | Fetch, createElement, renderizado |

---

## 7. Hito 6 — Autenticación JWT + bcrypt

### Qué se hizo

Sistema de autenticación completo:
1. `POST /api/auth/register` — Crear cuenta (hash de contraseña con bcrypt)
2. `POST /api/auth/login` — Iniciar sesión (devuelve JWT)
3. `src/middlewares/authMiddleware.js` — Verificar token en rutas protegidas

### También:
- Se agregó la columna `password` a la tabla `usuarios` (no existía)
- Se instalaron los paquetes `bcrypt` y `jsonwebtoken`

### bcrypt — Cómo funciona el hasheo de contraseñas

```
Password: "123456"
    │
    ▼
bcrypt.hash("123456", 10)
    │
    ├── Genera un SALT aleatorio: "$2b$10$AbCdEfGhIjKlMnOpQrStU"
    │   (22 caracteres aleatorios)
    │
    ├── Aplica el algoritmo 2^10 = 1024 veces
    │
    ▼
Resultado: "$2b$10$AbCdEfGhIjKlMnOpQrStU.8x...hash..."
            ↑      ↑                     ↑
          alg    rounds      salt      hash + salt
```

¿Por qué el salt es importante?
- Sin salt: `hash("123456")` → SIEMPRE el mismo resultado
- Con salt: `hash("123456" + "aB3x...")` → DISTINTO cada vez
- Esto evita **ataques de rainbow table** (tablas precomputadas de hashes)

¿Por qué 10 rounds?
- 2^10 = 1024 iteraciones del algoritmo
- Más rounds = más seguro pero más lento
- 10 es el balance ideal: ~100ms por hash

### bcrypt.compare() — Cómo se verifica

```js
const valida = await bcrypt.compare(password_ingresada, hash_almacenado);
```

Internamente:
1. Extrae el salt del hash almacenado
2. Hashea la password ingresada con ESE mismo salt
3. Compara: `hash(ingresada) === hash_almacenado`

### JWT — Cómo funciona

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c3VhcmlvX2lkIjoxfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
├─────────────────────┴──────────────────────┴──────────────────────────────────────────────┤
        HEADER                    PAYLOAD                        SIGNATURE
```

**HEADER:** `{"alg": "HS256", "typ": "JWT"}` — Algoritmo y tipo

**PAYLOAD:** `{"usuario_id": 1, "iat": 1680000000, "exp": 1680604800}` — Los datos
- `iat` = issued at (cuándo se emitió)
- `exp` = expiration (cuándo expira)
- **Solo datos NO sensibles** — el payload se ve en base64

**SIGNATURE:** `HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)`

La firma es lo que hace seguro al JWT. Si alguien modifica el payload, la firma no coincide y `jwt.verify()` da error.

### Flujo de login

```
Cliente → POST /api/auth/login { email, password }
                │
                ▼
    buscarUsuarioPorEmail(email)
                │
                ├── No existe → 401 "Credenciales inválidas"
                │
                └── Existe → bcrypt.compare(password, usuario.password)
                                │
                                ├── No coincide → 401
                                │
                                └── Coincide → jwt.sign({ usuario_id }, JWT_SECRET, { expiresIn: '7d' })
                                                │
                                                ▼
                                          Devolver { token, usuario: { id, nombre, email } }
```

### El middleware de autenticación

```js
function verificarToken(req, res, next) {
  // 1. Leer header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  // 2. Validar formato
  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ status: 'error', message: '...' });
  }

  // 3. Verificar firma y expiración
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Guardar usuario en la request
  req.usuario = decoded;  // { usuario_id: 1, iat: ..., exp: ... }

  // 5. Pasar al controlador
  next();
}
```

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/models/authModel.js` | crearUsuario(), buscarUsuarioPorEmail() |
| `src/middlewares/authMiddleware.js` | verificarToken() |
| `src/controllers/authController.js` | register() + login() |
| `src/routes/authRoutes.js` | POST /register, POST /login |

---

## 8. Hito 7 — Protección de Rutas + Anti-Spoofing

### Qué se hizo

Se protegieron las rutas de la API usando el middleware `verificarToken` y se eliminó la dependencia del `usuario_id` del body en la creación de sesiones.

### ID Spoofing — La vulnerabilidad

**Sin protección**, un endpoint que crea sesiones podría recibir:

```json
// Lo que envía el cliente legítimo:
{ "usuario_id": 1, "ejercicios": [...] }

// Lo que envía un ATACANTE (interceptó y modificó):
{ "usuario_id": 999, "ejercicios": [...] }
// ↑ La sesión se crea para otro usuario sin que se detecte
```

### La defensa: JWT + pisar el body

```
Middleware verificarToken (se ejecuta PRIMERO)
    │
    ├── Lee el token del header Authorization
    ├── Verifica la firma (jwt.verify)
    ├── Decodifica el payload → { usuario_id: 1 }
    └── Guarda en req.usuario
                │
                ▼
Controlador crearSesion (se ejecuta DESPUÉS)
    │
    ├── Lee req.usuario.usuario_id (del JWT, firmado)
    ├── IGNORA el usuario_id que venga en req.body
    └── datosSesion.usuario_id = req.usuario.usuario_id
```

La línea clave:

```js
// El body puede venir con usuario_id: 999 (spoofeado)
// Pero lo pisamos con el ID REAL del token:
datosSesion.usuario_id = req.usuario.usuario_id;
//                    ↑ ahora vale 1 (el verdadero)
```

### Cómo se aplica el middleware en las rutas

```js
// Antes (sin protección):
router.post('/', crearSesion);
router.get('/:id', getRutina);

// Después (protegido):
router.post('/', verificarToken, crearSesion);
router.get('/:id', verificarToken, getRutina);
```

Express ejecuta los middlewares en orden: primero `verificarToken`, después `crearSesion`. Si el token falta o es inválido, `verificarToken` responde con 401 y `crearSesion` nunca se ejecuta.

### Resumen de lo que cambió

| Archivo | Cambio |
|---------|--------|
| `src/routes/sesionRoutes.js` | Agregado `verificarToken` a POST / |
| `src/routes/rutinaRoutes.js` | Agregado `verificarToken` a GET /:id |
| `src/controllers/sesionController.js` | `usuario_id` leído de `req.usuario.usuario_id` en vez de `req.body` |

---

## 9. Hito 8 — Login Frontend + localStorage

### Qué se hizo

Se actualizó el frontend para incluir autenticación:

1. **Formulario de login** en HTML
2. **Estilos del formulario** (card centrada, inputs oscuros, errores visibles)
3. **Lógica de login** en app.js: fetch a `/api/auth/login`, guardar token en localStorage
4. **Requests autenticadas**: el fetch a la rutina incluye `Authorization: Bearer <token>`
5. **Manejo de expiración**: si el servidor responde 401, se borra el token y se muestra el login
6. **Logout**: botón para borrar el token y volver al login

### Flujo completo del frontend

```
1. Abrís http://localhost:3000/
         │
         ▼
2. app.js verifica: ¿hay token en localStorage?
         │
         ├── NO → Muestra formulario de LOGIN
         │         │
         │         ▼
         │    Usuario completa email + password
         │         │
         │         ▼
         │    fetch POST /api/auth/login
         │         │
         │         ├── OK → localStorage.setItem('token', token)
         │         │         → fetch GET /api/sesiones (con token)
         │         │         → Dashboard con HISTORIAL 📋
         │         │         → Usuario elige: [Historial] ↔ [Entrenar]
         │         │              │
         │         │              └── "Entrenar" → GET /api/rutinas/1
         │         │                             → Inputs por serie
         │         │                             → "Finalizar Entrenamiento"
         │         │                             → POST /api/sesiones
         │         │
         │         └── Error → Muestra "Credenciales incorrectas" en rojo
         │
         └── SÍ → fetch GET /api/sesiones (con token)
                     │
                     ├── 200 → Dashboard con HISTORIAL 📋
                     │
                     └── 401 → Token expirado
                               → localStorage.removeItem('token')
                               → Muestra login nuevamente
```

### localStorage vs SessionStorage vs Cookies

| Mecanismo | Persiste al cerrar navegador | Accesible desde JS | Envío automático |
|-----------|------------------------------|--------------------|------------------|
| **localStorage** | ✅ Sí | ✅ Sí | ❌ No |
| **sessionStorage** | ❌ No | ✅ Sí | ❌ No |
| **Cookies (httpOnly)** | ✅ Sí | ❌ No | ✅ Sí |

Usamos **localStorage** porque es simple y didáctico. En producción se recomiendan cookies `httpOnly` (no accesibles desde JavaScript) para prevenir robo de token por XSS.

### Cómo se inyecta el token en el fetch

```js
const token = localStorage.getItem('token');

const respuesta = await fetch('/api/rutinas/1', {
  headers: {
    'Authorization': 'Bearer ' + token,
  },
});
```

### Estados visuales de la UI

| Estado | Qué se ve |
|--------|-----------|
| **Sin token** | Formulario de login centrado |
| **Cargando login** | Botón dice "Entrando..." y se deshabilita |
| **Error de login** | Mensaje rojo debajo del formulario |
| **Login exitoso** | Formulario desaparece, aparecen las cards |
| **Token expirado** | Vuelve al formulario automáticamente |
| **Logout** | Token borrado, vuelve al formulario |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `public/index.html` | Formulario de login + botón cerrar sesión + .hidden toggle |
| `public/styles.css` | Estilos del login, inputs, botón, errores, .hidden |
| `public/app.js` | Login submit, localStorage, Authorization header, 401 handling, logout |

---

## 10. Hito 9 — Inputs por Serie + Guardar Entrenamiento

### Qué se hizo

Se actualizó el frontend para permitir al usuario ingresar los datos REALES de su entrenamiento (peso y repeticiones por serie) y enviar la sesión completada al endpoint `POST /api/sesiones`.

### Cambios en los archivos

**`public/index.html`**
- Agregado botón `#btn-finalizar` dentro de un `.finalizar-wrapper` al final de la vista de ejercicios
- El botón aparece oculto (`.hidden`) por defecto

**`public/styles.css`**
- `.series-inputs` / `.serie-row` / `.serie-label` — contenedor y filas para los inputs
- `.input-serie` — inputs numéricos oscuros, sin flechitas (Chrome/Firefox), con foco rojo
- `.btn-finalizar` — botón grande con gradient rojo, sombra, hover y active states
- `.alert-success` — banner verde con animación `fadeIn`
- Responsive: inputs se achican en mobile

**`public/app.js`**
- Cada tarjeta de ejercicio ahora tiene `dataset.ejercicioId` para identificar el ejercicio al recorrer el DOM
- Por cada serie planificada se generan **inputs numéricos** de peso y repeticiones, precargados con valores planificados
- El botón finalizar se muestra SOLO cuando la rutina cargó
- **Event Listener `btnFinalizar`**:
  1. DOM traversal: recorre `.card` → `.serie-row` → `input[data-campo="peso"]` y `data-campo="repeticiones"]`
  2. Arma JSON: `{ rutina_id, fecha, ejercicios: [{ ejercicio_id, series: [{ numero_serie, peso, repeticiones }] }] }`
  3. `fetch POST /api/sesiones` con `Authorization: Bearer <token>`
  4. `201` → banner verde + limpia inputs (recarga rutina)
  5. `400` → alerta con mensaje del servidor
  6. `401` → borra token, redirige al login
- Funciones nuevas: `mostrarExito(mensaje)` y `limpiarInputs()`

### Conceptos nuevos

| Concepto | Explicación |
|----------|-------------|
| **DOM Traversal** | Recorrer el árbol del DOM para extraer datos de inputs. Alternativa vanilla JS a frameworks como React. |
| **data-atributos** | Atributos HTML como `data-ejercicio-id` que almacenan datos personalizados en elementos del DOM. Accesibles via `.dataset`. |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `public/index.html` | Botón Finalizar Entrenamiento |
| `public/styles.css` | Inputs de serie, botón finalizar, alerta de éxito, responsive |
| `public/app.js` | Inputs por serie, DOM traversal, fetch POST, manejo de respuestas |

---

## 11. Hito 10 — Dashboard + Historial de Entrenamientos

### Qué se hizo

Se creó un nuevo endpoint protegido `GET /api/sesiones` que devuelve el historial del usuario autenticado, y una interfaz Dashboard en el frontend para visualizar estos datos con navegación entre vistas.

### Backend

**`src/models/sesionModel.js`**
- Nueva función `obtenerHistorialUsuario(usuario_id)`:
  ```sql
  SELECT se.id, se.fecha, se.notas, se.created_at, r.nombre AS rutina_nombre
  FROM sesiones_entrenamiento se
  LEFT JOIN rutinas r ON se.rutina_id = r.id
  WHERE se.usuario_id = ?
  ORDER BY se.fecha DESC, se.id DESC
  ```

**`src/controllers/sesionController.js`**
- Nueva función `getHistorial(req, res)`:
  - Extrae `usuario_id` de `req.usuario` (JWT)
  - Llama al modelo, devuelve `{ status: 'ok', data: [...] }`

**`src/routes/sesionRoutes.js`**
- Agregado `router.get('/', verificarToken, getHistorial)` — GET protegido en la misma ruta que el POST

### Frontend

**`public/index.html`**
- Nuevo `<div id="app-content">` como wrapper post-login
- Barra de navegación con pestañas: `📋 Historial` y `🏋️ Entrenar`
- Nueva `#dashboard-view` con header y `#historial-container`
- Vista `#entrenar-view` con la rutina (refactor de lo que era `rutina-content`)

**`public/styles.css`**
- `.nav-tabs` / `.nav-tab` / `.nav-tab--active` — barra tipo iOS con pestaña activa roja
- `.historial-table` — tabla con filas clickeables (hover con glow), bordes redondeados
- `.rutina-badge` — badge verde para nombre de rutina
- `.historial-empty` — estado sin datos con botón "Ir a entrenar"
- Responsive: oculta columna Notas en mobile

**`public/app.js`**
- Nuevas referencias: `appContent`, `btnTabHistorial`, `btnTabEntrenar`, `dashboardView`, `entrenarView`, `historialContainer`
- `mostrarLogin()` → oculta `appContent`
- `mostrarApp()` → reemplaza a `mostrarRutina()` como wrapper general
- `mostrarDashboard()` / `mostrarEntrenar()` → cambian entre vistas + pestaña activa
- **Nueva `cargarHistorial()`**:
  1. `fetch GET /api/sesiones` con `Authorization: Bearer`
  2. Si 401 → borra token, redirige al login
  3. Si historial vacío → mensaje + botón "Ir a entrenar"
  4. Renderiza tabla con fecha formateada (ej: "7 de junio, 2026")
- **Tabs de navegación**: event listeners con guard para evitar recargas innecesarias
- **Login handler**: ahora llama a `cargarHistorial()` en vez de `cargarRutina()`
- **`DOMContentLoaded`**: arranca con `cargarHistorial()` si hay token

### Nuevo flujo del usuario

```
Login → Dashboard 📋 (historial)
         │
         ├── [Entrenar] → Rutina con inputs → Finalizar → POST /api/sesiones
         │                                                  → Éxito → Dashboard actualizado
         │
         └── [Historial] → Vuelve al dashboard
```

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/models/sesionModel.js` | Nueva función `obtenerHistorialUsuario()` |
| `src/controllers/sesionController.js` | Nueva función `getHistorial()` |
| `src/routes/sesionRoutes.js` | Nueva ruta `GET /` con `verificarToken` |
| `public/index.html` | Dashboard + navegación + refactor vistas |
| `public/styles.css` | Nav tabs, tabla historial, responsive |
| `public/app.js` | `cargarHistorial()`, navegación entre vistas |

---

## 12. Hito 11 — Correcciones UX (3 partes)

### Parte 1 — Entrenamiento Activo y Estados

**Qué se hizo:**

Se mejoró la experiencia del entrenamiento activo agregando controles de estado y gestión de series:

1. **Checkbox de completado** en cada fila de serie — el usuario marca qué series completó
2. **Botón eliminar serie individual** — cada fila tiene un 🗑️ que la elimina y re-enumera las restantes
3. **Botón "Descartar Entreno"** — con `confirm()` y limpieza completa del estado
4. **Filtro inteligente v2** — al finalizar, solo envía series con checkbox marcado
5. **Redirección post-éxito** — después de guardar, redirige al Dashboard a los 1.5s

**Nuevas funciones en app.js:**

| Función | Propósito |
|---------|-----------|
| `limpiarVistaEntrenamiento()` | Resetea estado y redirige al Dashboard |
| `renderizarImagenEjercicio(ej)` | Muestra `<img>` si hay imagen, sino placeholder |

### Parte 2 — Rediseño del Catálogo de Ejercicios

**Qué se hizo:**

Se reemplazó el viejo `<select>` con una **lista visual estilo app móvil**:

- Modal más grande: `640px` (casi pantalla completa en mobile)
- Cada ejercicio muestra: imagen (o placeholder) + nombre + categoría
- Botón `+` para agregar a la rutina
- Panel "Agregar ejercicio extra" idéntico al modal, también visual

**Nuevos estilos CSS:**
- `.ejercicio-list` / `.ejercicio-list-item` — lista vertical tipo app
- `.ejercicio-img-placeholder` / `.img-ejercicio-thumb` — manejo de imágenes
- `.ejercicio-nombre` / `.ejercicio-categoria` — info del ejercicio
- `.btn-agregar-ejercicio` — botón `+` redondo
- `.extra-ejercicio-wrapper` — panel contenedor del extra

### Parte 3 — Pulido de Estado, Filtros e Imágenes

**Qué se hizo:**

- **Bugfix:** `limpiarVistaEntrenamiento()` ahora resetea `rutinaActualId = null`
- **Bugfix:** `cargarRutina()` maneja `null` mostrando "Seleccioná una rutina"
- **Anti-duplicados:** `obtenerIdsEjerciciosActivos()` escanea el DOM y excluye del panel extra los ejercicios que ya están visibles
- **Anti-duplicados v2:** al agregar un ejercicio extra, se refresca la lista automaticamente
- **Renderizado de imágenes:** si `imagen_url` existe, muestra `<img>`; si no, placeholder
- **Botón eliminar ejercicio completo** en el header de cada tarjeta (con confirm)

### Backend nuevo para Hito 11

| Archivo | Propósito |
|---------|-----------|
| `src/models/ejercicioModel.js` | `obtenerTodos()` — SELECT con JOIN a grupos musculares |
| `src/controllers/ejercicioController.js` | `getEjercicios()` — GET /api/ejercicios |
| `src/routes/ejercicioRoutes.js` | Ruta protegida GET /api/ejercicios |

### Archivos modificados (Hito 11 completo)

| Archivo | Cambio |
|---------|--------|
| `public/index.html` | Modal grande, lista visual, panel extra, checkboxes |
| `public/styles.css` | .ejercicio-list, .check-serie, .btn-eliminar-ejercicio, responsive |
| `public/app.js` | Checkboxes, +Serie, descartar, anti-duplicados, imágenes, delete ejercicio |
| `src/server.js` | Montado router de ejercicios |

---

## 13. Tarea Especial — Seed Scraper y Catálogo en Español

### Problema

La base de datos tenía solo **3 grupos musculares** (Hombros, Tríceps, Pecho) y **4 ejercicios**. Insuficiente para una app fitness real.

### Solución

Se escribió `seedScraper.js`, un script en Node.js que:
1. Scrapea `https://strengthlevel.es/estandares-de-fuerza` (versión española)
2. Extrae **64 ejercicios** organizados por equipo (Barra, Peso corporal, Mancuerna, Máquina, Polea)
3. Mapea cada ejercicio a sus grupos musculares (principal/secundario)
4. Descarga las **imágenes grandes a color** en formato `.avif`
5. Genera `seed.sql` con todos los INSERTs listos para MySQL

### Arquitectura del scraper

```
seedScraper.js
    │
    ├── scrapeExercises() → fetch a strengthlevel.es
    │       │
    │       └── cheerio + axios
    │
    ├── ES_TO_EN{} → mapea nombre español → inglés
    │       │
    │       └── necesario para: muscle mapping + URL de imagen
    │
    ├── EXERCISE_MUSCLE_MAP{} → qué músculos trabaja cada ejercicio
    │
    ├── generateSQL() → escribe seed.sql con INSERTs
    │       │
    │       └── grupos_musculares (15) + ejercicios (64) + relaciones (188)
    │
    └── downloadImages() → descarga .avif a public/images/
```

### Spanish → English mapping

Del scraper, se usa el nombre español para mostrar en la app y el nombre inglés para la URL de la imagen:

```
Press de banca       → Bench Press      → bench-press.avif
Sentadilla           → Squat            → squat.avif
Peso muerto          → Deadlift         → deadlift.avif
Elevaciones laterales → Dumbbell Lateral Raise → dumbbell-lateral-raise.avif
...64 en total
```

### Imágenes

- **Formato:** `.avif` (moderno, ~12 KB c/u)
- **Color:** A full color, no iconos B/N
- **Origen:** `https://static.strengthlevel.com/images/exercises/{slug}/{slug}-400.avif`
- **Destino:** `public/images/{slug}.avif`

### Resultado

| Item | Antes | Después |
|------|-------|---------|
| Grupos musculares | 3 | **15** |
| Ejercicios | 4 | **64** |
| Relaciones | 0 | **188** |
| Imágenes | 1 | **64** (.avif a color) |

### Cómo re-ejecutar

```bash
node seedScraper.js
# y luego importar seed.sql a MySQL
```

---

## 14. Bugfix + Buscador de Ejercicios

### Bug corregido: ejercicios extra fuera del contenedor

**Problema:** Al agregar un ejercicio extra durante el entrenamiento activo, la card se insertaba con `insertBefore()` como **hermano** de `#contenedor-ejercicios`, no como hijo. Esto causaba:

1. ❌ **No se podía eliminar** — el event delegation (`click` sobre `contenedorEl`) no capturaba clicks fuera del contenedor
2. ❌ **Aparecían duplicados** — `obtenerIdsEjerciciosActivos()` busca dentro de `#contenedor-ejercicios` y no veía la card fuera
3. ❌ **Estaban muy juntos** — al estar fuera del grid, no recibían los estilos CSS

**Solución:**
```js
// Antes (mal):
extraEjercicioWrapper.parentNode.insertBefore(card, extraEjercicioWrapper);

// Después (bien):
contenedorEl?.appendChild(card);
```

### Nuevo: Buscador en tiempo real

Se agregó un campo de búsqueda en **dos lugares**:

| Ubicación | Id del input | Filtra |
|-----------|-------------|--------|
| Modal "Nueva Rutina" | `#buscador-modal-ejercicios` | Por nombre y grupo muscular |
| Panel "Agregar Extra" | `#buscador-extra-ejercicios` | Por nombre y grupo muscular |

**Cómo funciona:**

1. El backend ahora devuelve `musculos` en `GET /api/ejercicios` via `GROUP_CONCAT`:
   ```sql
   GROUP_CONCAT(DISTINCT gm.nombre ORDER BY gm.nombre SEPARATOR ', ') AS musculos
   ```
   Ejemplo: `"Pecho, Hombros, Tríceps"`

2. El frontend filtra **cliente-side** con cada pulsación de tecla:
   ```js
   function filtrarCatalogo(termino) {
     return catalogoEjercicios.filter(ej =>
       ej.nombre.includes(termino) || ej.musculos.includes(termino)
     );
   }
   ```

3. Los buscadores se limpian al abrir el modal o cargar una rutina nueva

**MIME type .avif:** Se agregó `setHeaders` en `express.static()` para que Express sirva `.avif` con `Content-Type: image/avif` correcto.

---

## 15. Hito 12 — Navegación 3 vistas + Perfil + Temporizador + Burbuja Flotante

> **Objetivo:** Restructurar la navegación de 2 a 3 vistas, crear vista de perfil con email desde JWT, agregar temporizador de entrenamiento con burbuja flotante y modal de conflicto.

### Navegación

| Antes | Después |
|-------|---------|
| `📋 Historial` \| `🏋️ Entrenar` | `🏋️ Rutinas` \| `👤 Perfil` \| `🎯 Entrenar` |

Se crearon 3 vistas independientes manejadas por `mostrarVistaRutinas()`, `mostrarVistaPerfil()` y `mostrarEntrenar()`. Cada una oculta las otras con la clase `.hidden`.

### Vista Perfil

- Avatar circular con borde accent (`perfil-avatar`)
- Email del usuario extraído del JWT
- Placeholder de progreso (`📊 Próximamente: Gráficos de Progreso`)
- Sección de historial de entrenamientos
- Responsive: se adapta a mobile

### Temporizador de Entrenamiento

Cuando se inicia un entrenamiento, un cronómetro `mm:ss` aparece en el header de la vista Entrenar:

```js
function iniciarTemporizador() {
  detenerTemporizador();
  segundosTranscurridos = 0;
  horaInicio = Date.now();
  // setInterval actualiza el display cada 1 segundo
}

function detenerTemporizador() {
  clearInterval(intervaloReloj);
  ocultarFloatingTimer();
}
```

### Burbuja Flotante (Floating Timer Badge)

- **Visible solo cuando NO estás en la vista Entrenar** pero hay un training activo
- Posición fixed abajo a la derecha con animación `floatIn`
- Se sincroniza con el cronómetro inline cada 1 segundo
- **Click →** navega a la vista Entrenar
- Estilos: `floating-timer`, `floating-timer-icon`, `floating-timer-display`

### Modal de Conflicto

Cuando el usuario hace clic en una rutina mientras hay un entrenamiento activo:

```
╔══════════════════════════════╗
║  ⚠️ Entrenamiento activo     ║
║                              ║
║  Ya tenés un entrenamiento   ║
║  en curso: "Full Body"       ║
║  ⏱️ 12:34                    ║
║                              ║
║  [🗑️ Descartar y empezar    ║
║   nueva]                     ║
║  [↩️ Volver al entrenamiento ║
║   actual]                    ║
╚══════════════════════════════╝
```

### Bugs corregidos

- **Rutina sin ejercicios:** ahora muestra el panel de ejercicios extra + botones de acción
- **Estado residual:** se limpia el DOM al inicio de `cargarRutina()` (botones, panel extra)
- **Timer duplicado:** la burbuja flotante solo aparece cuando SALÍS de la vista Entrenar
- **Timer se reiniciaba:** el listener de pestaña ya no llama `cargarRutina()` si hay training activo
- **Logout dejaba estado colgado:** ahora resetea `entrenamientoActivo`, `rutinaActualId` y detiene el timer

### Backend

Se agregó `duracion_minutos` al INSERT y SELECT de `sesionModel.js` para persistir la duración del entrenamiento.

---

## 16. Hito 12.5 — Interfaz de Registro de Usuarios

> **Objetivo:** Permitir que los usuarios se registren desde el frontend sin tener que insertar datos manualmente en la DB.

### Flujo

1. El usuario ve el formulario de login por defecto
2. Hace clic en **"¿No tenés cuenta? Registrate aquí"**
3. Se muestra el formulario de registro con:
   - **Nombre** (opcional)
   - **Email** (obligatorio)
   - **Contraseña** (mínimo 6 caracteres)
4. Al hacer submit → `POST /api/auth/register`
5. **Éxito (201):** mensaje verde "✅ Cuenta creada con éxito" → redirige al login tras 2 segundos
6. **Error (409):** "❌ El email ya está registrado"

### Toggle de formularios

Ambos formularios comparten la misma `.login-card`. Se alternan con las funciones:

```js
function mostrarAuthLogin() {
  registerWrapper?.classList.add('hidden');
  loginWrapper?.classList.remove('hidden');
}

function mostrarAuthRegister() {
  loginWrapper?.classList.add('hidden');
  registerWrapper?.classList.remove('hidden');
}
```

### Backend

No se tocó — `POST /api/auth/register` ya existía y funcionaba correctamente (validación, bcrypt, inserción).

---

## 17. Hito 12.6 — Soft Delete de Cuenta (Borrado Lógico)

> **Objetivo:** Permitir que los usuarios eliminen su cuenta sin destruir datos históricos. En lugar de borrar la fila, se marca como `activo = FALSE`.

### Migración SQL

```sql
USE fitness_app;
ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT TRUE;
```

### Backend

**Modelo** (`usuarioModel.js`):
```js
async function desactivarUsuario(usuarioId) {
  await pool.execute('UPDATE usuarios SET activo = FALSE WHERE id = ?', [usuarioId]);
}
```

**Controlador** (`usuarioController.js`):
- `eliminarCuenta()` → llama a `desactivarUsuario()` con el ID del JWT

**Ruta** (`usuarioRoutes.js`):
- `DELETE /api/usuarios/me` → protegida con JWT

**Login modificado** (`authController.js`):
```js
if (!usuario.activo) {
  return res.status(403).json({
    message: 'Esta cuenta ha sido desactivada',
  });
}
```

### Frontend

- **Zona de Peligro** al final del perfil con botón rojo "Eliminar mi cuenta"
- **Prompt estricto:** el usuario debe escribir exactamente `ELIMINAR` para confirmar
- Al confirmar: `fetch DELETE /api/usuarios/me` → limpia localStorage → redirige al login

### ¿Por qué 403 y no 401?

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| **401** | No autenticado | Token faltante o inválido |
| **403** | Prohibido | Usuario existe pero su cuenta está desactivada |

---

## 18. Hito 12.7 — Avatar Real con Multer + MySQL

> **Objetivo:** Subir fotos de perfil reales al servidor y persistir la ruta en MySQL.

### Migración SQL

```sql
USE fitness_app;
ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
```

### Dependencia

```bash
npm install multer
```

### Backend — Multer

**Configuración de almacenamiento:**
```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/avatars/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.usuario.usuario_id}${ext}`);
  },
});
```

- Archivos guardados en `public/images/avatars/` →
  servidos automáticamente por `express.static`
- Nombre único: `avatar-{usuarioId}.jpg` (sobrescribe si ya existe)
- Filtro: solo imágenes (jpg, png, gif, webp)
- Límite: 2MB

**Nuevo endpoint público:**
```js
// GET /api/usuarios/me → { id, nombre, email, avatar_url }
router.get('/me', verificarToken, obtenerPerfil);

// POST /api/usuarios/avatar → subir foto (multipart/form-data)
router.post('/avatar', verificarToken, upload.single('avatar'), subirAvatar);
```

### Backend — JWT enriquecido

El payload del JWT ahora incluye `nombre` y `email` para usarlos en el frontend sin requests adicionales:
```js
const payload = {
  usuario_id: usuario.id,
  nombre:     usuario.nombre,
  email:      usuario.email,
};
```

### Frontend — Perfil

- **Avatar clickable:** el círculo del avatar es un `<label>` que dispara un `<input type="file">` oculto
- **Overlay:** al hacer hover sobre el avatar, aparece un ícono 📷 con fondo semitransparente
- **Subida:** `new FormData()` → `fetch POST /api/usuarios/avatar` → actualiza el `<img>` al instante
- **Nombre:** se muestra debajo del avatar con estilo destacado

```js
const formData = new FormData();
formData.append('avatar', file);

const respuesta = await fetch('/api/usuarios/avatar', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  // NO poner Content-Type — fetch lo setea solo
  body: formData,
});
```

### Flujo completo

```
Perfil → GET /api/usuarios/me → muestra nombre, email, avatar_url
Click en avatar → input file → seleccionás foto
  → FormData → POST /api/usuarios/avatar con JWT
  → multer guarda avatar-5.jpg
  → UPDATE usuarios SET avatar_url = ?
  → respuesta con URL → <img> se actualiza al toque
```

---

## 19. Glosario de Conceptos

### Arquitectura

| Concepto | Explicación |
|----------|-------------|
| **MVC** | Patrón que separa Modelo (datos), Vista (interfaz), Controlador (lógica). Acá no tenemos Vista clásica (el frontend es aparte), pero separamos Modelo/Controlador/Ruta. |
| **Middleware** | Función que se ejecuta en el medio del pipeline de Express. Puede modificar req/res, cortar la request o pasarla al siguiente. |
| **Pool de conexiones** | Grupo de conexiones a la DB que se reutilizan. Más eficiente que abrir/cerrar una conexión por request. |

### Base de Datos

| Concepto | Explicación |
|----------|-------------|
| **JOIN** | Combina filas de dos o más tablas basándose en una relación. `LEFT JOIN` = todas las filas de la tabla izquierda aunque no tengan match. |
| **Transacción** | Grupo de operaciones SQL que se ejecutan como una unidad atómica: pasa TODO o pasa NADA. |
| **COMMIT** | Confirma una transacción. Los cambios se vuelven permanentes y visibles para otros. |
| **ROLLBACK** | Revierte una transacción. La DB vuelve al estado anterior al BEGIN. |
| **insertId** | Propiedad que devuelve mysql2 después de un INSERT. Contiene el valor generado por AUTO_INCREMENT. |
| **AUTO_INCREMENT** | Columna que se incrementa automáticamente. MySQL asigna el siguiente número disponible. |
| **Prepared Statement** | Consulta SQL con placeholders (?). mysql2 escapa los valores automáticamente, previniendo inyección SQL. |
| **FK (Foreign Key)** | Columna que referencia la PK de otra tabla. Garantiza integridad referencial. |

### Almacenamiento de Archivos

| Concepto | Explicación |
|----------|-------------|
| **multer** | Middleware de Express para manejar `multipart/form-data` (subida de archivos). Configura almacenamiento en disco con `diskStorage()` y filtra por tipo de archivo / tamaño. |
| **FormData** | API del navegador para construir formularios con archivos. Se usa con `fetch()` para subir fotos. **Importante:** NO setear `Content-Type` manualmente — el navegador lo pone solo con el boundary correcto. |
| **express.static** | Middleware de Express que sirve archivos estáticos. Cualquier archivo en `public/` se sirve automáticamente. Multer guarda avatares en `public/images/avatars/` y se sirven sin configuración adicional. |

### Seguridad de Cuenta

| Concepto | Explicación |
|----------|-------------|
| **Soft Delete** | Borrado lógico: en vez de `DELETE FROM usuarios`, se hace `UPDATE usuarios SET activo = FALSE`. Los datos históricos (rutinas, sesiones) se conservan y el usuario puede ser restaurado. |
| **ID Spoofing** | Ataque donde el atacante modifica el ID de usuario en el body de la request para actuar como otro usuario. Se previene leyendo el ID del JWT en vez del body. |

### Autenticación

| Concepto | Explicación |
|----------|-------------|
| **bcrypt** | Algoritmo de hasheo de contraseñas. Incluye salt automático y es deliberadamente lento para frustrar ataques de fuerza bruta. |
| **Salt** | Cadena aleatoria que se agrega a la contraseña antes de hashearla. Garantiza que dos usuarios con la misma contraseña tengan hashes distintos. |
| **Salt Rounds** | Número de iteraciones del algoritmo (2^rounds). 10 rounds = 1024 iteraciones. |
| **JWT** | JSON Web Token. Token con formato `HEADER.PAYLOAD.SIGNATURE` que permite autenticación stateless (el servidor no guarda sesiones). |
| **Payload** | Los datos dentro del JWT (ej: `usuario_id`). Están en base64, no encriptados — cualquiera puede leerlos. |
| **Firma (Signature)** | HMAC del header + payload usando una clave secreta. Garantiza que el token no fue modificado. |
| **Bearer Token** | Formato estándar para enviar tokens: `Authorization: Bearer <token>`. |

### Frontend

| Concepto | Explicación |
|----------|-------------|
| **fetch()** | API nativa del navegador para hacer peticiones HTTP. Reemplaza a XMLHttpRequest. |
| **localStorage** | Almacenamiento clave-valor que persiste en el navegador aunque se cierre la pestaña. |
| **createElement()** | Método del DOM para crear elementos HTML desde JavaScript. |
| **CSS Variables** | Variables declaradas con `--nombre` que se reutilizan en todo el CSS. Permiten cambiar el tema fácilmente. |
| **Dark Mode** | Esquema de colores con fondo oscuro y texto claro. Reduce fatiga visual y ahorra batería en pantallas OLED. |

---

## 20. Resumen de APIs

| Método | Ruta | Auth | Descripción | Request Body | Response |
|--------|------|------|-------------|--------------|----------|
| `GET` | `/api/health` | ❌ | Verifica que el servidor y la DB estén vivos | - | `{ status: "ok", db: "conectada" }` |
| `POST` | `/api/auth/register` | ❌ | Crear una cuenta nueva | `{ nombre, email, password }` | `201` + `{ status: "ok", data: { id, nombre, email } }` |
| `POST` | `/api/auth/login` | ❌ | Iniciar sesión (devuelve JWT) | `{ email, password }` | `{ status: "ok", data: { token, usuario } }` |
| `GET` | `/api/ejercicios` | 🔒 | Catálogo completo de ejercicios con grupos musculares | - | `{ status: "ok", data: [{ id, nombre, descripcion, categoria, imagen_url, musculos }] }` |
| `POST` | `/api/rutinas/crear` | 🔒 | Crear rutina con ejercicios seleccionados | `{ nombre, ejercicios_ids: [1, 2, ...] }` | `201` + `{ status: "ok", data: { rutinaId } }` |
| `GET` | `/api/rutinas/:id` | 🔒 | Obtener rutina con ejercicios | - | `{ status: "ok", data: { id, nombre, ejercicios: [...] } }` |
| `GET` | `/api/sesiones` | 🔒 | Obtener historial del usuario autenticado | - | `{ status: "ok", data: [{ id, fecha, notas, rutina_nombre }, ...] }` |
| `POST` | `/api/sesiones` | 🔒 | Guardar sesión de entrenamiento | `{ rutina_id, fecha, notas, ejercicios: [...] }` | `201` + `{ status: "ok", data: { sesionId } }` |
| `GET` | `/api/usuarios/me` | 🔒 | Obtener perfil del usuario autenticado (nombre, email, avatar_url) | - | `{ status: "ok", data: { id, nombre, email, avatar_url } }` |
| `DELETE` | `/api/usuarios/me` | 🔒 | Desactivar (soft delete) la cuenta del usuario autenticado | - | `{ status: "ok", message: "Cuenta desactivada" }` |
| `POST` | `/api/usuarios/avatar` | 🔒 | Subir foto de perfil (multipart/form-data) | `FormData { avatar: File }` | `{ status: "ok", data: { avatar_url } }` |
| `GET` | `/` | ❌ | Frontend (HTML/CSS/JS) | - | Página web |

### Códigos de respuesta

| Código | Significado | Causas comunes |
|--------|-------------|----------------|
| **200** | OK | Todo funcionó correctamente |
| **201** | Created | Recurso creado exitosamente (POST) |
| **400** | Bad Request | Faltan campos requeridos, ID inválido, formato incorrecto |
| **401** | Unauthorized | Token faltante, inválido o expirado |
| **403** | Forbidden | Cuenta desactivada (activo = FALSE), no se permite el acceso |
| **404** | Not Found | Recurso no existe (ej: rutina ID 999) |
| **409** | Conflict | Email ya registrado |
| **500** | Internal Server Error | Error interno (DB caída, error de sintaxis SQL, etc.) |

---

> 🧠 **Tips para seguir aprendiendo**
>
> 1. Si abrís una nueva sesión en OpenCode, mencioná este archivo:
>    *"Leé docs/GUIA-TECNICA.md para tener contexto del proyecto"*
>
> 2. También podés preguntar cosas específicas como:
>    *"¿Por qué usamos LEFT JOIN y no INNER JOIN en rutinaModel?"*
>    *"Explicame de nuevo cómo funciona bcrypt.compare()"*
>    *"Mostrame el flujo de la transacción en sesionModel"*
>
> 3. Engram también tiene memorias de cada hito. Si preguntás algo,
>    el agente puede buscar en Engram y en esta guía.

---

*Documentación generada durante el desarrollo del proyecto Blackterz.*
*Cada hito fue construido con SDD (Spec-Driven Development): primero la especificación, después el código.*
