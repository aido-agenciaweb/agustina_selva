# NAIS BY CAN - Tareas Pendientes

**Fecha de análisis:** 26 de Noviembre de 2025
**Versión del sistema:** 1.0 (En desarrollo)
**Tecnologías:** Laravel 11, PHP 8.2, MySQL 8.0, TailwindCSS

---

## 1. BACKEND - Base de Datos y Migraciones

### 1.1 Crear tabla `services`
- **Estado:** ❌ Falta migración
- **Descripción:** La tabla `services` está definida en `database.sql` pero NO existe migración Laravel
- **Campos necesarios:**
  - `id`, `title`, `price`, `active`, `created_at`, `updated_at`
- **Acción:** Crear migración `create_services_table.php`
- **Prioridad:** ALTA

### 1.2 Crear tabla `transactions`
- **Estado:** ❌ Falta migración
- **Descripción:** Existe el modelo `Transaction.php` pero NO hay migración correspondiente
- **Campos necesarios:**
  - `id`, `description`, `amount`, `type` (entrada/salida), `payment_method` (efectivo/digital), `appointment_id`, `transaction_date`, `created_at`, `updated_at`
- **Acción:** Crear migración `create_transactions_table.php`
- **Prioridad:** ALTA

### 1.3 Sincronizar estructura de `appointments`
- **Estado:** ⚠️ Discrepancia entre migración y database.sql
- **Problema:**
  - **Migración actual:** `date`, `time`, `service`, `location`, `request`
  - **database.sql:** `appointment_date`, `appointment_time`, `location_type`, `address`, `client_request`, `service_id`, `agreed_price`, `status`
- **Acción:** Actualizar la migración para que coincida con la estructura planificada en `database.sql`
- **Prioridad:** MEDIA

### 1.4 Agregar campo `role` a tabla `users`
- **Estado:** ❌ Falta campo
- **Descripción:** `database.sql` define `role` enum('admin','staff') pero la migración actual no lo incluye
- **Acción:** Crear migración para agregar campo `role`
- **Prioridad:** BAJA (sólo si se planea tener múltiples usuarios con roles)

---

## 2. BACKEND - Modelos Eloquent

### 2.1 Crear modelo `Service`
- **Estado:** ❌ No existe
- **Descripción:** Se usa `Service` en `AdminController.php:50` pero el archivo no existe
- **Ubicación:** `app/Models/Service.php`
- **Fillable:** `['title', 'price', 'active']`
- **Prioridad:** ALTA

### 2.2 Actualizar modelo `Appointment`
- **Estado:** ⚠️ Revisar fillable y relaciones
- **Acción:**
  - Verificar que los campos `fillable` coincidan con la migración actualizada
  - Agregar relación `belongsTo` con `Service`
  - Agregar relación `hasOne` con `Transaction`
- **Prioridad:** MEDIA

### 2.3 Actualizar modelo `Transaction`
- **Estado:** ⚠️ Falta relación
- **Acción:**
  - Agregar relación `belongsTo` con `Appointment`
- **Prioridad:** BAJA

---

## 3. BACKEND - Controladores

### 3.1 Crear `ServiceController`
- **Estado:** ❌ No existe
- **Descripción:** Se necesita un CRUD completo para Servicios
- **Métodos:** `index`, `store`, `update`, `destroy`
- **Prioridad:** ALTA

### 3.2 Crear `TransactionController`
- **Estado:** ❌ No existe
- **Descripción:** Gestión de movimientos de caja (entradas/salidas)
- **Métodos:** `index`, `store`, `destroy`, `getDailyReport`, `exportExcel`
- **Prioridad:** ALTA

### 3.3 Completar `AdminAppointmentController`
- **Estado:** ⚠️ Incompleto
- **Falta:**
  - Método `update` (cambiar estado de turno: pendiente → confirmado → completado)
  - Método `destroy` (cancelar turno)
  - Validación más estricta (verificar disponibilidad de fecha/hora)
- **Prioridad:** MEDIA

### 3.4 Implementar autenticación real en `AuthController`
- **Estado:** ⚠️ Existe pero no se usa
- **Problema:** `routes/web.php:18-20` tiene login sin validación, solo redirige
- **Acción:**
  - Conectar rutas POST `/admin/login` con `AuthController@authenticate`
  - Agregar middleware `auth` a rutas del admin
  - Crear ruta `/admin/logout` conectada a `AuthController@logout`
- **Prioridad:** ALTA (seguridad)

### 3.5 Actualizar `AdminController@dashboard`
- **Estado:** ⚠️ Usa modelo `Service` que no existe
- **Línea:** `AdminController.php:50`
- **Acción:** Descomentar cuando se cree el modelo `Service`
- **Prioridad:** MEDIA

---

## 4. RUTAS (routes/web.php)

### 4.1 Rutas faltantes para Services
- **Estado:** ❌ No existen
- **Rutas necesarias:**
  - `POST /admin/services` → store
  - `PUT /admin/services/{id}` → update
  - `DELETE /admin/services/{id}` → destroy
- **Prioridad:** ALTA

### 4.2 Rutas faltantes para Transactions
- **Estado:** ❌ No existen
- **Rutas necesarias:**
  - `GET /admin/transactions` → index (listado del día)
  - `POST /admin/transactions` → store (nuevo movimiento)
  - `DELETE /admin/transactions/{id}` → destroy
  - `GET /admin/transactions/export` → exportar a Excel
- **Prioridad:** ALTA

### 4.3 Rutas faltantes para Appointments
- **Estado:** ⚠️ Incompletas
- **Rutas necesarias:**
  - `PUT /admin/appointments/{id}` → update (cambiar estado)
  - `DELETE /admin/appointments/{id}` → destroy (cancelar)
- **Prioridad:** MEDIA

### 4.4 Implementar middleware de autenticación
- **Estado:** ❌ No hay protección
- **Acción:**
  - Agrupar rutas `/admin/*` con `middleware('auth')`
  - Exceptuar `/admin/login`
- **Prioridad:** ALTA (seguridad)

---

## 5. FRONTEND - Vistas (Blade Templates)

### 5.1 Completar sección "Servicios" en dashboard
- **Archivo:** `resources/views/admin/dashboard.blade.php:376-378`
- **Estado:** ⚠️ Placeholder ("Sección en desarrollo...")
- **Acción:** Crear CRUD visual completo (similar a Productos)
- **Prioridad:** ALTA

### 5.2 Completar sección "Caja" con datos dinámicos
- **Archivo:** `resources/views/admin/dashboard.blade.php:186-240`
- **Estado:** ⚠️ Valores hardcodeados ($15.000, $22.500, etc.)
- **Acción:**
  - Usar `$cashTotal`, `$digitalTotal`, `$netTotal` del controlador
  - Iterar sobre `$movements` en la tabla
  - Conectar botones "Nuevo Mov.", "Imprimir", "Excel"
- **Prioridad:** ALTA

### 5.3 Agregar formulario para nuevo movimiento de caja
- **Estado:** ❌ No existe
- **Acción:** Crear modal/formulario para registrar entradas/salidas
- **Prioridad:** ALTA

### 5.4 Mejorar calendario de turnos en sección Agenda
- **Archivo:** `resources/views/admin/dashboard.blade.php:146-178`
- **Estado:** ⚠️ Solo muestra tabla simple
- **Acción:**
  - Integrar vista de calendario semanal (FullCalendar.js según `Mejoras.html`)
  - Agregar botón para crear nuevo turno manualmente
  - Agregar acciones: Confirmar/Completar/Cancelar turno
- **Prioridad:** MEDIA

### 5.5 Corregir HTML malformado en dashboard.blade.php
- **Archivo:** `resources/views/admin/dashboard.blade.php`
- **Problema:** Estructura duplicada y etiquetas sin cerrar (líneas 240-444)
- **Acción:** Limpiar código duplicado y cerrar correctamente todas las etiquetas
- **Prioridad:** MEDIA

### 5.6 Crear vista de login real
- **Archivo:** `resources/views/admin/login.blade.php`
- **Estado:** ⚠️ No se ha verificado su contenido
- **Acción:** Verificar que tenga formulario con campos email/password y token CSRF
- **Prioridad:** ALTA

### 5.7 Integrar carrito de compras con backend
- **Archivo:** `resources/views/client/home.blade.php:172-307`
- **Estado:** ⚠️ Solo frontend, sin persistencia
- **Acción:**
  - Crear tabla `orders` y `order_items` para guardar pedidos
  - Crear controlador `OrderController`
  - Guardar pedido antes de redirigir a WhatsApp
- **Prioridad:** BAJA (funcionalidad extra)

---

## 6. FUNCIONALIDADES FALTANTES

### 6.1 Sistema de Notificaciones
- **Estado:** ❌ No implementado
- **Descripción:** Según `Mejoras.html`, se requiere:
  - Envío de email de confirmación al crear turno (Laravel Notifications)
  - Recordatorio de WhatsApp 24hs antes del turno (WhatsApp Business API)
- **Prioridad:** MEDIA

### 6.2 Exportación a Excel
- **Estado:** ❌ No implementado
- **Descripción:** Botón "Excel" en sección Caja
- **Acción:**
  - Instalar `maatwebsite/laravel-excel`
  - Crear export class para `Transaction`
  - Conectar botón con ruta `/admin/transactions/export`
- **Prioridad:** MEDIA

### 6.3 Generación de PDF para tickets
- **Estado:** ❌ No implementado
- **Descripción:** Botón de ticket en cada movimiento de caja
- **Acción:**
  - Instalar `dompdf/dompdf` o `barryvdh/laravel-dompdf`
  - Crear plantilla de ticket
  - Formato para impresoras térmicas 80mm
- **Prioridad:** BAJA

### 6.4 Sistema de Backup
- **Estado:** ❌ No implementado
- **Descripción:** Según `Mejoras.html`, usar Laravel Backup
- **Acción:**
  - Instalar `spatie/laravel-backup`
  - Configurar backup automático a Google Drive o email
- **Prioridad:** BAJA

### 6.5 Sistema de Roles y Permisos
- **Estado:** ❌ No implementado
- **Descripción:** Diferenciar Dueña vs Empleada
- **Acción:**
  - Instalar `spatie/laravel-permission` (opcional)
  - Implementar lógica de roles básica con campo `role` en users
- **Prioridad:** BAJA

---

## 7. CONFIGURACIÓN Y DEPLOYMENT

### 7.1 Actualizar archivo `.env`
- **Estado:** ⚠️ Usando SQLite, docker-compose usa MySQL
- **Problema:** `.env.example` tiene `DB_CONNECTION=sqlite` pero `docker-compose.yml` levanta MySQL
- **Acción:**
  - Crear `.env` desde `.env.example`
  - Configurar correctamente:
    ```
    DB_CONNECTION=mysql
    DB_HOST=db
    DB_PORT=3306
    DB_DATABASE=nais_bycan
    DB_USERNAME=root
    DB_PASSWORD=<password>
    ```
- **Prioridad:** ALTA

### 7.2 Configurar Nginx
- **Estado:** ⚠️ Carpeta referenciada no existe
- **Problema:** `docker-compose.yml:53` monta `./docker-compose/nginx` pero no existe
- **Acción:**
  - Crear `docker-compose/nginx/default.conf` con configuración para Laravel
- **Prioridad:** ALTA

### 7.3 Generar APP_KEY
- **Estado:** ⚠️ `.env.example` tiene `APP_KEY=` vacío
- **Acción:** Ejecutar `php artisan key:generate` después de copiar `.env.example` a `.env`
- **Prioridad:** ALTA

### 7.4 Ejecutar migraciones
- **Estado:** ❌ Pendiente
- **Acción:**
  - Una vez creadas todas las migraciones faltantes: `php artisan migrate`
- **Prioridad:** ALTA

### 7.5 Crear Seeders
- **Estado:** ⚠️ Solo existe `ProductSeeder.php`
- **Falta:**
  - `ServiceSeeder` para servicios de ejemplo
  - `UserSeeder` para crear admin por defecto
- **Prioridad:** MEDIA

---

## 8. SEGURIDAD

### 8.1 Implementar validación CSRF en formularios
- **Estado:** ⚠️ Vista cliente tiene token pero no se valida
- **Acción:** Verificar que todos los formularios POST tengan `@csrf` y el middleware esté activo
- **Prioridad:** ALTA

### 8.2 Sanitizar inputs
- **Estado:** ⚠️ Validación básica en controladores
- **Acción:**
  - Agregar validaciones más estrictas en todos los `store()` y `update()`
  - Validar formatos de fecha, hora, email, etc.
- **Prioridad:** MEDIA

### 8.3 Proteger rutas admin con middleware
- **Estado:** ❌ No implementado
- **Acción:** Ver punto 4.4
- **Prioridad:** ALTA

### 8.4 Configurar CORS para producción
- **Estado:** ⚠️ Usando configuración por defecto
- **Acción:** Revisar `config/cors.php` si se planea usar API pública
- **Prioridad:** BAJA

---

## 9. UI/UX MEJORAS OPCIONALES (de Mejoras.html)

### 9.1 Implementar FullCalendar.js
- **Estado:** ❌ No implementado
- **Descripción:** Reemplazar calendario simple por drag-and-drop profesional
- **Prioridad:** BAJA

### 9.2 Integrar Laravel Livewire
- **Estado:** ❌ No implementado
- **Descripción:** Hacer dashboard dinámico sin JavaScript complejo
- **Prioridad:** BAJA

### 9.3 Integrar MercadoPago/Stripe
- **Estado:** ❌ No implementado
- **Descripción:** Permitir pagos de seña online
- **Prioridad:** BAJA

### 9.4 Dashboard con gráficos
- **Estado:** ❌ No implementado
- **Descripción:** Usar `laravel-charts` para visualizar ingresos
- **Prioridad:** BAJA

---

## 10. TESTING

### 10.1 Crear tests unitarios
- **Estado:** ❌ No implementado
- **Acción:**
  - Tests para modelos (relaciones, scopes)
  - Tests para controladores (CRUD)
- **Prioridad:** BAJA

### 10.2 Crear tests de integración
- **Estado:** ❌ No implementado
- **Acción:**
  - Test de flujo completo de reserva de turno
  - Test de flujo completo de movimiento de caja
- **Prioridad:** BAJA

---

## 11. DOCUMENTACIÓN

### 11.1 Actualizar README.md
- **Estado:** ⚠️ Es el README por defecto de Laravel
- **Acción:**
  - Documentar instalación del proyecto
  - Documentar cómo levantar Docker
  - Documentar estructura del proyecto
- **Prioridad:** MEDIA

### 11.2 Documentar API (si se planea)
- **Estado:** ❌ No aplica aún
- **Acción:** Si se crean endpoints JSON, documentar con Swagger/Postman
- **Prioridad:** BAJA

---

## RESUMEN DE PRIORIDADES

### 🔴 PRIORIDAD ALTA (Bloquean funcionalidad básica)
1. Crear migración `services`
2. Crear migración `transactions`
3. Crear modelo `Service`
4. Crear `ServiceController`
5. Crear `TransactionController`
6. Implementar autenticación real
7. Proteger rutas admin con middleware
8. Completar sección Servicios en dashboard
9. Completar sección Caja con datos dinámicos
10. Configurar `.env` correctamente (MySQL)
11. Crear configuración Nginx
12. Generar `APP_KEY`
13. Ejecutar migraciones

### 🟡 PRIORIDAD MEDIA (Mejoran funcionalidad)
1. Sincronizar estructura de `appointments`
2. Completar `AdminAppointmentController`
3. Mejorar calendario de turnos
4. Exportación a Excel
5. Sistema de Notificaciones por email
6. Crear Seeders
7. Actualizar README.md
8. Corregir HTML malformado en dashboard

### 🟢 PRIORIDAD BAJA (Nice to have)
1. Campo `role` en users
2. Sistema de Roles y Permisos
3. Generación de PDF
4. Sistema de Backup
5. Integración con MercadoPago
6. FullCalendar.js
7. Laravel Livewire
8. Testing
9. Carrito con persistencia en BD

---

## ARCHIVOS POR CREAR

```
database/migrations/
├── XXXX_XX_XX_create_services_table.php
├── XXXX_XX_XX_create_transactions_table.php
└── XXXX_XX_XX_update_appointments_table.php

app/Models/
└── Service.php

app/Http/Controllers/
├── ServiceController.php
└── TransactionController.php

database/seeders/
├── ServiceSeeder.php
└── UserSeeder.php

docker-compose/nginx/
└── default.conf

.env (copiar de .env.example y configurar)
```

---

## COMANDOS INICIALES NECESARIOS

```bash
# 1. Copiar archivo de entorno
cp .env.example .env

# 2. Generar clave de aplicación
php artisan key:generate

# 3. Levantar Docker
docker-compose up -d

# 4. Instalar dependencias
docker-compose exec app composer install

# 5. Ejecutar migraciones (después de crearlas todas)
docker-compose exec app php artisan migrate

# 6. Ejecutar seeders
docker-compose exec app php artisan db:seed

# 7. Compilar assets (si se usa Vite)
npm install
npm run build
```

---

**Nota:** Este documento refleja el estado del proyecto al 26/11/2025. Se recomienda actualizar conforme se completen las tareas.
