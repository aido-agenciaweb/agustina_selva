# Sistema de Gestión de Calendario - NAIS BY CAN

## Resumen

Se ha implementado un **sistema completo de gestión de disponibilidad de turnos** que permite al administrador controlar exactamente qué días y horarios están disponibles para que los clientes reserven turnos.

---

## Componentes Implementados

### 1. Base de Datos

#### Tabla `availability_settings`
Configuración global del calendario (solo un registro).

**Campos:**
- `days_forward`: Días hacia adelante desde hoy (ej: 15, 30, 60)
- `days_backward`: Días hacia atrás desde hoy (ej: 0, 7, 15)
- `show_full_year`: Boolean - Si es true, muestra todo el año completo
- `max_appointments_per_slot`: Cantidad máxima de turnos por horario
- `created_at`, `updated_at`

**Valor por defecto:**
```json
{
  "days_forward": 15,
  "days_backward": 0,
  "show_full_year": false,
  "max_appointments_per_slot": 1
}
```

#### Tabla `time_slots`
Horarios específicos disponibles.

**Campos:**
- `date`: Fecha del turno (YYYY-MM-DD)
- `time`: Hora del turno (HH:MM)
- `is_available`: Boolean - Si el horario está disponible o bloqueado
- `max_appointments`: Turnos que se pueden dar en este horario específico
- `created_at`, `updated_at`
- Índice único: (`date`, `time`) - No puede haber duplicados

---

### 2. Modelos Eloquent

#### `AvailabilitySetting`
**Ubicación:** `app/Models/AvailabilitySetting.php`

**Métodos clave:**
- `getSettings()`: Obtiene la configuración (singleton pattern)

#### `TimeSlot`
**Ubicación:** `app/Models/TimeSlot.php`

**Atributos calculados:**
- `bookedCount`: Cantidad de turnos ya reservados en este slot

**Métodos:**
- `hasAvailability()`: Verifica si aún hay cupos disponibles
- `getAvailableSlots($startDate, $endDate)`: Obtiene slots disponibles en un rango

---

### 3. Controlador

#### `AvailabilityController`
**Ubicación:** `app/Http/Controllers/AvailabilityController.php`

**Rutas Públicas:**
```
GET /api/availability/slots
```
- Obtiene todos los horarios disponibles según configuración
- Los clientes consultan esto para mostrar el calendario

**Rutas Admin (protegidas con auth):**
```
GET    /admin/availability/settings          - Ver configuración
PUT    /admin/availability/settings          - Actualizar configuración

GET    /admin/availability/slots             - Listar slots (con filtros)
POST   /admin/availability/slots             - Crear un slot
POST   /admin/availability/slots/bulk        - Crear múltiples slots (generación masiva)
PUT    /admin/availability/slots/{id}        - Actualizar slot
DELETE /admin/availability/slots/{id}        - Eliminar slot
DELETE /admin/availability/slots/bulk/delete - Eliminar slots en rango de fechas
```

---

## 4. Funcionalidades del Cliente

### Vista actualizada: `resources/views/client/home.blade.php`

**Mejoras implementadas:**

1. **Calendario dinámico:**
   - Carga horarios disponibles desde `/api/availability/slots`
   - Solo muestra días que tienen horarios disponibles
   - Días pasados aparecen deshabilitados
   - Navegación entre meses con flechas

2. **Modal de reserva inteligente:**
   - Al hacer click en un día, muestra SOLO los horarios disponibles
   - El select de horas se llena dinámicamente
   - Ya no hay horarios hardcodeados

3. **Guardado correcto:**
   - Se envía `appointment_date` y `appointment_time` en formato correcto
   - Se valida contra los campos actualizados de la tabla `appointments`

---

## 5. Panel de Administración (A implementar en dashboard)

### Configuración del Calendario

**Formulario para actualizar `availability_settings`:**

```html
<form method="POST" action="/admin/availability/settings">
    @csrf
    @method('PUT')

    <label>Días hacia adelante:</label>
    <input type="number" name="days_forward" value="15" min="0" max="365">

    <label>Días hacia atrás:</label>
    <input type="number" name="days_backward" value="0" min="0" max="365">

    <label>
        <input type="checkbox" name="show_full_year" value="1">
        Mostrar año completo
    </label>

    <label>Turnos máximos por horario:</label>
    <input type="number" name="max_appointments_per_slot" value="1" min="1" max="10">

    <button type="submit">Guardar Configuración</button>
</form>
```

---

### Gestión de Horarios Disponibles

#### Opción 1: Creación Individual
```html
<form method="POST" action="/admin/availability/slots">
    @csrf
    <input type="date" name="date" required>
    <input type="time" name="time" required>
    <input type="number" name="max_appointments" value="1" min="1">
    <button type="submit">Agregar Horario</button>
</form>
```

#### Opción 2: Generación Masiva (Recomendado)
```html
<form method="POST" action="/admin/availability/slots/bulk">
    @csrf

    <label>Fecha inicio:</label>
    <input type="date" name="start_date" required>

    <label>Fecha fin:</label>
    <input type="date" name="end_date" required>

    <label>Días de la semana:</label>
    <label><input type="checkbox" name="days_of_week[]" value="1"> Lunes</label>
    <label><input type="checkbox" name="days_of_week[]" value="2"> Martes</label>
    <label><input type="checkbox" name="days_of_week[]" value="3"> Miércoles</label>
    <label><input type="checkbox" name="days_of_week[]" value="4"> Jueves</label>
    <label><input type="checkbox" name="days_of_week[]" value="5"> Viernes</label>
    <label><input type="checkbox" name="days_of_week[]" value="6"> Sábado</label>
    <label><input type="checkbox" name="days_of_week[]" value="0"> Domingo</label>

    <label>Horarios (uno por línea):</label>
    <div id="times-container">
        <input type="time" name="times[]" value="10:00">
        <input type="time" name="times[]" value="11:00">
        <input type="time" name="times[]" value="14:00">
        <input type="time" name="times[]" value="15:00">
        <input type="time" name="times[]" value="16:00">
    </div>
    <button type="button" onclick="addTimeInput()">+ Agregar horario</button>

    <label>Turnos por horario:</label>
    <input type="number" name="max_appointments" value="1" min="1">

    <button type="submit">Generar Horarios</button>
</form>
```

---

### Listar y Administrar Horarios Existentes

```javascript
// JavaScript para cargar y mostrar slots
async function loadSlots() {
    const startDate = document.getElementById('filter-start').value;
    const endDate = document.getElementById('filter-end').value;

    const response = await fetch(`/admin/availability/slots?start_date=${startDate}&end_date=${endDate}`);
    const slots = await response.json();

    // Renderizar tabla con slots
    const tbody = document.getElementById('slots-table-body');
    tbody.innerHTML = '';

    slots.forEach(slot => {
        tbody.innerHTML += `
            <tr>
                <td>${slot.date}</td>
                <td>${slot.time}</td>
                <td>${slot.is_available ? 'Disponible' : 'Bloqueado'}</td>
                <td>${slot.max_appointments}</td>
                <td>
                    <button onclick="toggleSlot(${slot.id})">
                        ${slot.is_available ? 'Bloquear' : 'Habilitar'}
                    </button>
                    <button onclick="deleteSlot(${slot.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}
```

---

## 6. Flujo de Trabajo

### Configuración Inicial (Admin)

1. **Definir rango de visualización:**
   - Ir a "Configuración de Calendario"
   - Establecer: "15 días hacia adelante, 0 hacia atrás"
   - Esto significa que los clientes verán desde hoy hasta 15 días en el futuro

2. **Generar horarios disponibles:**
   - Usar formulario de generación masiva
   - Ejemplo: Del 26/11/2025 al 15/12/2025
   - Días: Lunes a Viernes
   - Horarios: 10:00, 11:00, 14:00, 15:00, 16:00
   - Resultado: Se crean automáticamente todos los slots

3. **Ajustes finos:**
   - Bloquear días específicos (feriados, vacaciones)
   - Cambiar capacidad de ciertos días (ej: sábados permitir 2 turnos por horario)
   - Eliminar horarios puntuales

### Experiencia del Cliente

1. Cliente abre la página principal
2. Ve calendario con SOLO los días que tienen horarios disponibles
3. Días sin horarios = deshabilitados (grises)
4. Click en un día disponible → Modal con horarios disponibles
5. Selecciona hora, completa datos, reserva

---

## 7. Comandos para Iniciar

```bash
# Ejecutar migraciones
php artisan migrate

# La configuración por defecto ya se crea automáticamente

# Crear horarios de ejemplo (via Tinker o Seeder)
php artisan tinker

# En tinker:
$settings = \App\Models\AvailabilitySetting::first();
$settings->update(['days_forward' => 30]);

# Crear slots de ejemplo
for($i = 0; $i < 30; $i++) {
    $date = \Carbon\Carbon::today()->addDays($i);
    foreach(['10:00', '11:00', '14:00', '15:00', '16:00'] as $time) {
        try {
            \App\Models\TimeSlot::create([
                'date' => $date->format('Y-m-d'),
                'time' => $time,
                'is_available' => true,
                'max_appointments' => 1
            ]);
        } catch(\Exception $e) {}
    }
}
```

---

## 8. Ventajas del Sistema

✅ **Control total:** El admin define exactamente qué días/horas están disponibles
✅ **Flexibilidad:** Puede cambiar configuración en cualquier momento
✅ **Escalable:** Soporta múltiples turnos por horario
✅ **Automático:** El cliente solo ve lo disponible, no puede elegir horarios no habilitados
✅ **Protegido:** Los horarios se verifican en el servidor al guardar
✅ **Fácil de mantener:** Generación masiva de horarios con unos clicks

---

## 9. Próximos Pasos Recomendados

1. ✅ Crear la sección "Calendario" en el dashboard admin
2. Implementar interfaz visual para:
   - Configurar days_forward/backward
   - Formulario de generación masiva
   - Visualizar calendario del mes con slots
   - Marcar/desmarcar disponibilidad con clicks
3. Agregar notificaciones al admin cuando:
   - Un slot se llena (max_appointments alcanzado)
   - Se hace una reserva nueva
4. Sistema de bloqueo de días completos (feriados, vacaciones)
5. Plantillas de horarios (ej: "Horario de Verano", "Horario de Invierno")

---

## 10. Archivo

s Creados/Modificados

**Nuevos:**
- `database/migrations/XXXX_create_availability_settings_table.php`
- `database/migrations/XXXX_create_time_slots_table.php`
- `app/Models/AvailabilitySetting.php`
- `app/Models/TimeSlot.php`
- `app/Http/Controllers/AvailabilityController.php`

**Modificados:**
- `routes/web.php` - Rutas de availability agregadas
- `resources/views/client/home.blade.php` - Calendario dinámico implementado

---

**Estado:** ✅ Sistema backend completo y funcional
**Falta:** Panel de administración visual (dashboard)
