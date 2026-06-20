# Blackterz - Plataforma de Entrenamiento Inteligente

## Descripción

Blackterz es una aplicación **Full Stack** para la gestión de entrenamientos físicos. Permite a los usuarios crear rutinas personalizadas, registrar series con peso y repeticiones, visualizar su progreso mediante gráficos estadísticos, y acceder a videos de ejercicios en bucle para una ejecución correcta. Todo el estado de las sesiones se persiste automáticamente, evitando pérdida de datos incluso si el usuario cierra el navegador.

## Tecnologías Utilizadas

- **Frontend:** Vanilla JavaScript, HTML5, CSS3.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL.
- **Seguridad:** JWT (JSON Web Tokens), Bcrypt.
- **Multimedia:** Integración con API externa (AscendAPI) para videos de ejercicios.
- **Gráficos:** Chart.js para visualización de progreso.

## Características Principales

- **Autenticación segura** — Registro, inicio de sesión y recuperación de contraseña por correo con JWT + Bcrypt.
- **CRUD de rutinas** — Crear, editar y eliminar rutinas con soft delete; soporte para rutinas recomendadas por defecto.
- **Sesión de entrenamiento en vivo** — Cards interactivas con inputs de peso/repeticiones por serie, check de completado y auto-guardado del progreso.
- **Catálogo de ejercicios multimedia** — 64 ejercicios con imágenes y videos MP4 en bucle, accesibles desde un panel de detalle con ficha técnica.
- **Gráficas de progreso** — Chart.js muestra la evolución del volumen total y peso máximo por ejercicio.
- **Perfil de usuario** — Avatar, datos biométricos (peso, altura, edad) y edición en línea.
- **Tours interactivos** — Onboarding guiado para nuevas funcionalidades.
- **Temporizador de descanso** — Barra global con cuenta regresiva, sonido y vibración al finalizar.
- **Responsive design** — Adaptado a dispositivos móviles y desktop.

## Instalación y Configuración

1. **Clonar el repositorio:**

```bash
git clone https://github.com/Blackterz2/Proyecto_5to_Semestre.git
cd Proyecto_5to_Semestre
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar la base de datos:**

Ejecutar las migraciones en orden desde la carpeta `docs/`. Primero el schema base y luego las migraciones incrementales:

```bash
mysql -u root -p < docs/migracion-activo.sql
mysql -u root -p < docs/migracion-gif-url.sql
# ... repetir para cada migración en docs/
```

4. **Configurar variables de entorno** (ver sección siguiente).

5. **Iniciar el servidor:**

```bash
npm start
```

## Variables de Entorno (.env)

Crear un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Servidor
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=blackterz

# JWT
JWT_SECRET=tu_secreto_jwt

# Correo (recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
APP_URL=http://localhost:3000

# AscendAPI (videos de ejercicios)
ASCENDAPI_KEY=tu_key_de_rapidapi
```

> **Nota:** La API de videos requiere una suscripción activa a ["EDB with Videos and Images by AscendAPI"](https://www.rapidapi.com) en RapidAPI. El plan gratuito incluye 2,000 requests por mes (suficiente para el catálogo completo de 64 ejercicios).

## Ejecución

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

El servidor se iniciará en `http://localhost:3000`.
