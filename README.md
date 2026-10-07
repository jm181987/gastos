# KNJ Finanzas — Gestor de finanzas personales

Aplicación web para organizar las finanzas personales en **pesos uruguayos (UYU)**. Permite registrar ingresos y gastos, administrar cuentas y tarjetas, planificar cuotas y deudas, definir presupuestos y consultar indicadores mensuales y anuales desde una interfaz adaptable a escritorio y móvil.

> **Estado:** proyecto en evolución. Algunas funciones avanzadas requieren migraciones de base de datos; los indicadores son cálculos sobre los movimientos registrados, no saldos bancarios consultados en tiempo real.

## Contenido

- [Qué permite hacer](#qué-permite-hacer)
- [Cómo se utiliza](#cómo-se-utiliza)
- [Cómo se calculan los indicadores](#cómo-se-calculan-los-indicadores)
- [Tecnologías](#tecnologías)
- [Instalación local](#instalación-local)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Seguridad y administración](#seguridad-y-administración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Limitaciones y recomendaciones](#limitaciones-y-recomendaciones)

## Qué permite hacer

### Resumen y análisis financiero

- Seleccionar **mes y año** para analizar un período.
- Consultar ingresos, gastos, cuotas de deuda, pagos realizados y obligaciones pendientes.
- Ver balances previstos y realizados, tasa de ahorro, comparaciones con el mes anterior y distribución por categorías.
- Revisar un **semáforo financiero** orientativo, compromisos y proyecciones.
- Consultar la evolución del año.

### Movimientos

- Crear, editar, duplicar y eliminar ingresos y gastos.
- Marcar ingresos como **recibidos / por recibir** y gastos como **pagados / pendientes**.
- Buscar movimientos, usar filtros rápidos y **ordenar haciendo clic en los encabezados** de la tabla (fecha, concepto, tipo, categoría, estado o monto).
- Asociar movimientos a cuentas o tarjetas cuando corresponda.
- Programar gastos para varios meses y administrar operaciones recurrentes.

### Cuentas, tarjetas y deudas

- Registrar cuentas con saldo inicial y movimientos asociados.
- Registrar transferencias entre cuentas.
- Gestionar tarjetas de crédito, compras divididas en cuotas y pagos agrupados por mes.
- Registrar deudas y préstamos con importe, cantidad de cuotas, cuotas previamente pagadas y vencimientos.
- Consultar cuotas individuales por deuda y cambiar su estado.
- Ver obligaciones del mes y cuotas vencidas pendientes.

### Planificación y herramientas

- Presupuestos por categoría y presupuesto mensual.
- Metas de ahorro y seguimiento del progreso.
- Etiquetas, comprobantes y otras herramientas de organización.
- Importación y exportación de datos según las opciones disponibles en la aplicación.
- Apariencia clara u oscura y diseño adaptable.

## Cómo se utiliza

1. **Crear una cuenta o iniciar sesión.** Cada usuario accede a su propio panel.
2. **Configurar las cuentas financieras.** Cargar efectivo, cuentas bancarias y sus saldos iniciales ayuda a obtener balances más útiles.
3. **Registrar ingresos.** Elegir concepto, origen, importe, fecha y estado.
4. **Registrar gastos.** Seleccionar categoría, importe, fecha y estado; asociar cuenta o tarjeta si corresponde.
5. **Cargar deudas y compras en cuotas.** Revisar el calendario generado y las cuotas ya pagadas antes de guardar.
6. **Actualizar los estados.** Marcar los pagos e ingresos efectivamente realizados para mantener coherentes los saldos.
7. **Consultar Resumen, Movimientos y Mi dinero.** Cambiar el mes para revisar períodos anteriores o próximos compromisos.

### Ejemplo de un mes

| Concepto | Importe |
| --- | ---: |
| Ingresos | $34.300 |
| Gastos normales | $26.550 |
| Cuotas de deuda del mes | $3.080 |
| **Gastos y cuotas** | **$29.630** |
| **Balance previsto** | **$4.670** |

Los valores del ejemplo son ilustrativos. Una cuota **pagada** sigue siendo parte del gasto del mes; su estado indica que ya fue abonada. Una cuota **pendiente** es una obligación que todavía debe atenderse. No debe contarse dos veces una misma operación si también tiene un gasto vinculado.

## Cómo se calculan los indicadores

| Indicador | Interpretación |
| --- | --- |
| Ingresos del mes | Total de ingresos registrados para el período |
| Gastos del mes | Gastos registrados más cuotas correspondientes al período, evitando duplicados vinculados |
| Balance previsto | Ingresos del mes menos gastos y cuotas del mes |
| Balance real | Ingresos recibidos menos gastos y cuotas ya pagados |
| Saldo de cuentas | Saldo inicial y movimientos efectivamente vinculados a cada cuenta |
| Dinero libre estimado | Saldo registrado menos obligaciones todavía pendientes consideradas por el cálculo |
| Semáforo | Evaluación orientativa del margen financiero y los compromisos |

**Importante:** el saldo de cuentas depende de la correcta asignación de movimientos y pagos. No representa una conexión en vivo con bancos. Los indicadores pueden variar al modificar fechas, estados, cuotas o cuentas asociadas. Para validar resultados, comparar el detalle de Movimientos con el Resumen del mismo período.

## Tecnologías

- **Next.js 15** (App Router).
- **React 19**.
- **PostgreSQL** como base de datos.
- **pg** para consultas SQL desde el servidor.
- **Vercel** como plataforma de despliegue prevista.

Las versiones exactas están definidas en `package.json`.

## Instalación local

### Requisitos

- Node.js compatible con Next.js 15 (se recomienda Node.js 20 o posterior).
- npm.
- PostgreSQL accesible y una base de datos creada.
- Credenciales de base de datos con permisos suficientes para crear y modificar el esquema.

### Pasos

```bash
git clone https://github.com/jm181987/gastos.git
cd gastos
npm install
```

Crear `.env.local` a partir de `.env.example` si está disponible, o crear el archivo manualmente:

```dotenv
DATABASE_URL=postgresql://USUARIO:CONTRASENA@SERVIDOR:5432/BASE_DE_DATOS
```

**No subir `.env.local`, contraseñas, tokens ni copias con datos personales al repositorio.** Algunas funciones (por ejemplo, notificaciones) pueden necesitar variables adicionales según la configuración del entorno.

Preparar la base de datos siguiendo la siguiente sección y ejecutar:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Otros comandos:

```bash
npm run build
npm run start
```

## Base de datos y migraciones

El proyecto utiliza scripts SQL versionados en `db/`. **Antes de actualizar una base con datos reales, crear un respaldo.** Las migraciones deben aplicarse en orden y revisarse según el estado del esquema existente.

1. Ejecutar `db/schema.sql` para la estructura inicial, cuando se trate de una instalación nueva.
2. Revisar y aplicar `db/migration_v2.sql`, `db/migration_v3.sql` y `db/migration_v4.sql`.
3. Aplicar `db/migration_v5.sql` y `db/migration_v6.sql` para cuentas, tarjetas, transferencias, deudas y vínculos con movimientos.
4. Aplicar `db/migration_v7.sql` y `db/migration_v7b.sql` para usuarios y separación de datos.
5. Aplicar `db/migration_v8.sql` para el esquema de cuotas de deuda.
6. Aplicar `db/migration_v9.sql` para pagos mensuales agrupados de tarjetas.

Ejemplo de ejecución de **un** script:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migration_v9.sql
```

La pantalla principal comprueba varias estructuras necesarias y puede mostrar avisos de migración pendiente. **No es un sistema automático de migraciones:** los scripts se ejecutan manualmente y algunos pueden requerir ajustes de permisos o compatibilidad en instalaciones existentes. No asumir que basta con ejecutar únicamente el último archivo.

## Despliegue en Vercel

1. Importar el repositorio desde GitHub en Vercel.
2. Configurar `DATABASE_URL` en **Project Settings → Environment Variables** para los entornos correspondientes.
3. Verificar que PostgreSQL acepta conexiones desde el entorno de despliegue y que el usuario de BD tiene permisos adecuados.
4. Aplicar las migraciones necesarias **antes** de utilizar funciones nuevas.
5. Desplegar y comprobar inicio de sesión, registro de movimientos, cuentas, cuotas y panel administrativo.

No utilizar `localhost` en `DATABASE_URL` de Vercel salvo que exista realmente una base accesible en ese entorno. El despliegue de código no ejecuta automáticamente los scripts SQL.

## Seguridad y administración

- Autenticación de usuarios y panel administrativo.
- Datos financieros vinculados a cada usuario mediante identificadores de propietario.
- Herramientas administrativas de gestión de cuentas y consulta de actividad.
- Registro de cambios y funciones de respaldo según la configuración del sistema.

Para entornos reales: usar contraseñas robustas, conexiones seguras, permisos mínimos en PostgreSQL, respaldos periódicos y revisión de acceso a las rutas administrativas. No usar cuentas compartidas para gestionar información privada.

## Estructura del proyecto

```text
app/
  page.js            Entrada y comprobaciones de esquema
  dashboard.js       Consultas e indicadores del panel
  Movements.js       Tabla de movimientos y acciones
  AdvancedFinance.js Cuentas, tarjetas y deudas
  actions.js         Operaciones de servidor
  globals.css        Estilos y diseño adaptable
db/
  schema.sql         Esquema inicial
  migration_v*.sql   Evolución de la base de datos
lib/
  db.js              Conexión PostgreSQL
public/              Recursos estáticos e identidad visual
package.json         Dependencias y comandos
```

## Limitaciones y recomendaciones

- Los cálculos dependen de **fechas, estados y vínculos** correctamente registrados.
- Las cuotas y los gastos asociados requieren cuidado para evitar contabilizaciones duplicadas.
- Los vencimientos de tarjetas y las cuotas deben revisarse al cargar o editar compras.
- Los saldos registrados **no equivalen necesariamente al saldo bancario real**.
- Antes de modificar migraciones, reglas financieras o acciones administrativas, probar con datos de ejemplo y verificar el resultado en el resumen mensual.
- Mantener la base de datos respaldada antes de despliegues con cambios de esquema.

---

Desarrollado por **KNJ** · [Sitio web](https://www.marketingknj.site/)
