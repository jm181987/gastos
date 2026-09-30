# Gestor de gastos

Aplicación web para gestionar ingresos y gastos mensuales/anuales con KPIs, análisis por categorías, evolución mensual y recomendaciones de mejora.

## Stack
- Next.js
- PostgreSQL
- pg

## Configuración
1. Copia `.env.example` a `.env.local`.
2. Define `DATABASE_URL`.
3. Ejecuta el SQL de `db/schema.sql`.
4. Instala dependencias con `npm install`.
5. Inicia con `npm run dev`.

## Funcionalidades
- Registro de ingresos: sueldo, comisión, bonus y extras.
- Registro de gastos con categoría y fecha.
- Dashboard mensual y anual.
- KPIs: ingresos, gastos, balance, tasa de ahorro y peso de cada categoría.
- Evolución mensual del año.
- Recomendaciones automáticas según hábitos de gasto.
