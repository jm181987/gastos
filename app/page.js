import { pool } from '../lib/db';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Home({searchParams}){
 const params=await searchParams;
 const check=await pool.query(`SELECT to_regclass('public.categories') ready, to_regclass('public.monthly_budgets') v3, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='expense' AND column_name='status') has_status, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='expense' AND column_name='deleted_at') has_deleted`);
 if(!check.rows[0].ready||!check.rows[0].has_status) return <main className="wrap"><div className="card"><h1>Actualización de base pendiente</h1><p>La aplicación está lista para la versión 2, pero falta ejecutar <code>db/migration_v2.sql</code> en PostgreSQL.</p><p className="muted">La pantalla se habilitará automáticamente al terminar la migración.</p></div></main>;
 if(!check.rows[0].v3||!check.rows[0].has_deleted) return <main className="wrap"><div className="card"><h1>Actualización v3 pendiente</h1><p>Ejecuta <code>db/migration_v3.sql</code> en PostgreSQL. Esta actualización agrega presupuesto mensual, recurrentes con fechas y eliminación reversible.</p></div></main>;
 return <Dashboard params={params}/>;
}