# **Elige+**

### MVP de Plataforma Digital para Reestructuración de Deudas

---

## 📌 Descripción general

**Elige+** es un **MVP (Minimum Viable Product)** de una plataforma web que permite a los usuarios **centralizar, evaluar y comparar opciones de refinanciamiento de deudas** a través de propuestas emitidas por distintas entidades financieras.

El proyecto busca funcionar como un **hub digital de intermediación**, donde el usuario registra una sola solicitud y recibe múltiples ofertas, reduciendo fricción, duplicidad de procesos y asimetrías de información.

---

## 🎯 Problema que resuelve

Actualmente, un usuario que desea refinanciar un crédito (por ejemplo, vehicular) debe:

* Contactar individualmente a varias entidades financieras
* Repetir procesos de evaluación crediticia
* Comparar manualmente tasas, cuotas, plazos y condiciones
* Afrontar procesos lentos y poco transparentes

**Elige+** centraliza este flujo permitiendo:

* Registrar **una única solicitud**
* Obtener **múltiples propuestas comparables**
* Elegir la alternativa más conveniente desde un solo canal digital

---

## 🧩 Alcance del MVP

Este MVP está diseñado para validar:

* La experiencia de usuario
* El flujo completo de solicitud → evaluación → propuestas
* La arquitectura técnica base
* La escalabilidad futura del modelo

No busca replicar un sistema bancario completo, sino **probar el valor del concepto**.

---

## 🏗️ Arquitectura del MVP

### Frontend

* **Angular** (Standalone Components)
* **Angular Material** para UI y formularios
* Formularios reactivos (`FormGroup`, `FormControl`)
* Control Flow moderno (`@if`, `@for`)
* Arquitectura basada en servicios
* Hosting previsto en **Vercel**

### Backend / Datos

* **Supabase**

  * **PostgreSQL** como base de datos
  * **Supabase Auth** para autenticación (UUID)
  * **Row Level Security (RLS)** basada en `user_id`
* Backend y base de datos alojados en **Supabase / Render**

---

## 🗄️ Modelo de datos (alto nivel)

### Entidades principales

* **profiles**

  * Información del usuario autenticado
  * Relación 1:1 con Supabase Auth (`UUID`)

* **solicitud**

  * Representa una solicitud de refinanciamiento
  * Pertenece a un usuario (`user_id`)
  * Contiene datos del crédito y perfil crediticio

* **propuesta**

  * Ofertas generadas por entidades financieras
  * Relación **1:N** con `solicitud`

### Tablas de catálogo

* `entidad_financiera`
* `moneda`
* `condicion_laboral`
* `fuente_ingresos`

Estas tablas permiten **escalabilidad sin cambios estructurales** en el core del sistema.

---

## 🔄 Flujo funcional del usuario

### 1️⃣ Autenticación

* Registro e inicio de sesión mediante **Supabase Auth**
* Identificación única por `UUID`
* Acceso a datos protegido por RLS

---

### 2️⃣ Dashboard — *Mis Solicitudes*

* Visualización de todas las solicitudes del usuario
* Cada fila representa una solicitud creada previamente
* Acceso al detalle y estado de cada solicitud
* Opción para crear una nueva solicitud

---

### 3️⃣ Nueva Solicitud

Formulario dividido en **dos secciones dentro de un mismo módulo**, con navegación controlada:

#### 3.1 Datos del Crédito

* Entidad financiera actual
* Moneda del crédito
* Monto total original
* Monto actual
* Valor del bien
* Plazo total
* Cuotas pagadas
* TCEA
* Placa del vehículo

#### 3.2 Perfil Crediticio

* Condición laboral
* Datos del empleador
* Antigüedad laboral
* Fuente principal de ingresos

📌 El formulario se envía como **una única transacción**, generando un registro en la tabla `solicitud`.

---

## 🚦 Estado actual del MVP

### Implementado ✅

* Autenticación de usuarios
* Creación automática de perfiles
* Catálogos base
* Creación de solicitudes
* Dashboard por usuario
* Persistencia en PostgreSQL
* Seguridad mediante RLS

### Pendiente / Próximos pasos 🚧

* Simulación de entidades financieras
* Motor de generación de propuestas
* Comparación visual de ofertas
* Selección de propuesta por el usuario
* Cierre y estados de solicitudes
* Validaciones avanzadas
* Auditoría y trazabilidad
* Optimización UX/UI

---

## 🧠 Principios de diseño

* **MVP-first**: funcionalidad antes que estética
* **Escalabilidad**: modelo extensible desde el inicio
* **Seguridad por diseño**: acceso basado en `user_id`
* **Separación de responsabilidades**:

  * UI
  * Servicios
  * Persistencia
* **Iteración rápida** y bajo acoplamiento

---

## 👨‍💻 Equipo y contexto académico

**Desarrollador principal**

* Andrés Evans

**Product Owners**

* Marcela Aparicio
* Manuel Ruiz
* Ayrton Mercado

📘 Proyecto desarrollado como parte de la
**Maestría en Negocios Digitales – UTEC**

---

## 🌐 Enlaces

* **Repositorio:** *(por definir)*
* **Producción (futuro):** [https://eligeplus.app](https://eligeplus.app) *(placeholder)*

---

## 📎 Notas finales

**Elige+** está diseñado como una base sólida para:

* Pruebas de concepto
* Iteraciones ágiles
* Evaluación de modelos de negocio
* Escalamiento técnico y funcional

La arquitectura actual permite incorporar nuevas entidades financieras, reglas de negocio y flujos avanzados **sin refactorizaciones mayores**.

---
