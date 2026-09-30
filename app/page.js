import { pool } from '../lib/db';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Home({searchParams}){
 const params=await searchParams;
 const check=await pool.query(`SELECT to_regclass('public.categories') ready, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='expense' AND column_name='status') has_status`);
 if(!check.rows[0].ready||!check.rows[0].has_status) return <main className="wrap"><div className="card"><h1>Actualización de base pendiente</h1><p>La aplicación está lista para la versión 2, pero falta ejecutar <code>db/migration_v2.sql</code> en PostgreSQL.</p><p className="muted">La pantalla se habilitará automáticamente al terminar la migración.</p></div></main>;
 return <Dashboard params={params}/>;
}