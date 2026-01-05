# Elige+ — MVP de Reestructuración de Deudas

## Descripción general

**Elige+** es un MVP (Minimum Viable Product) de una plataforma web que permite a los usuarios
**centralizar, evaluar y refinanciar sus deudas** mediante propuestas ofrecidas por entidades financieras.

El objetivo principal del proyecto es servir como un **hub digital de comparación y selección de ofertas de refinanciamiento**, simplificando el proceso para el usuario final y permitiendo escalar gradualmente el número de entidades financieras participantes.

---

## Problema que resuelve

Actualmente, los usuarios con créditos (por ejemplo, vehiculares) deben:
- Contactar múltiples entidades financieras
- Comparar manualmente tasas, plazos y cuotas
- Repetir el mismo proceso de evaluación crediticia varias veces

Elige+ centraliza este flujo permitiendo:
- Registrar una **solicitud única**
- Recibir **múltiples propuestas**
- Elegir la mejor alternativa desde un solo lugar

---

## Arquitectura del MVP

### Frontend
- **Angular (Standalone Components)**
- **Angular Material** para formularios y UI básica
- Formularios reactivos (`FormGroup`, `FormControl`)
- Control Flow moderno (`@if`, `@for`)
- Hosting previsto en **Vercel**

### Backend / Data
- **Supabase**
  - PostgreSQL como base de datos
  - Auth (usuarios con UUID)
  - Row Level Security (RLS) orientado a `user_id`
- Hosting de backend y base de datos en **Render / Supabase**

---

## Modelo de datos (alto nivel)

### Entidades principales

- **profiles**
  - Usuarios autenticados (UUID)
- **solicitud**
  - Representa una solicitud de refinanciamiento
  - Pertenece a un usuario (`user_id`)
- **propuesta**
  - Ofertas realizadas por entidades financieras
  - Relación 1:N con `solicitud`

### Tablas de catálogo
- `entidad_financiera`
- `moneda`
- `condicion_laboral`
- `fuente_ingresos`

Estas tablas permiten crecimiento futuro sin cambios estructurales.

---

## Flujo funcional del usuario

### 1. Autenticación
- Registro e inicio de sesión usando Supabase Auth
- El usuario queda identificado por un `UUID`

### 2. Dashboard — “Mis Solicitudes”
- Lista todas las solicitudes del usuario autenticado
- Cada fila representa una solicitud creada previamente
- Opción para crear una nueva solicitud

### 3. Nueva Solicitud
Formulario dividido en **dos secciones dentro del mismo módulo**:

#### 3.1 Datos del Crédito
- Entidad financiera actual
- Moneda
- Montos (total, actual, bien)
- Plazo, cuotas pagadas, TCEA
- Placa del vehículo

#### 3.2 Datos del Perfil Crediticio
- Condición laboral
- Datos del empleador
- Antigüedad laboral
- Fuente principal de ingresos

El formulario se envía como **una sola transacción**, creando un registro en la tabla `solicitud`.

---

## Estado actual del MVP

### Implementado ✅
- Autenticación de usuarios
- Creación de perfiles
- Catálogos base (moneda, entidades financieras, etc.)
- Creación de solicitudes
- Dashboard con listado de solicitudes por usuario
- Persistencia en PostgreSQL (Supabase)

### Pendiente / Próximos pasos 🚧
- Simulación de entidades financieras
- Generación automática de propuestas
- Selección de propuesta por el usuario
- Cierre de solicitudes
- Mejoras visuales y UX
- Validaciones avanzadas
- Auditoría y trazabilidad

---

## Principios del diseño

- **MVP-first**: priorizar funcionalidad sobre estilo
- **Escalabilidad**: catálogos y relaciones extensibles
- **Seguridad**: acceso a datos basado en `user_id`
- **Separación clara de responsabilidades** (UI, servicios, datos)

---

## Notas finales

Este proyecto está diseñado como una base sólida para:
- Pruebas de concepto
- Iteraciones rápidas
- Escalamiento funcional y técnico

La estructura actual permite incorporar nuevas entidades financieras, reglas de negocio y flujos más complejos sin refactorizaciones mayores.

