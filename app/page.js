import { pool } from '../lib/db';
import Dashboard from './dashboard';
import {currentUser} from '../lib/auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Home({searchParams}){
 const params=await searchParams;
 const user=await currentUser();
 if(!user) redirect('/login');
 const check=await pool.query(`SELECT to_regclass('public.categories') ready, to_regclass('public.monthly_budgets') v3, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='expense' AND column_name='status') has_status, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='expense' AND column_name='deleted_at') has_deleted, to_regclass('public.accounts') v5, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='debt_payments' AND column_name='expense_id') v6`);
 if(!check.rows[0].ready||!check.rows[0].has_status) return <main className="wrap"><div className="card"><h1>Actualización de base pendiente</h1><p>La aplicación está lista para la versión 2, pero falta ejecutar <code>db/migration_v2.sql</code> en PostgreSQL.</p><p className="muted">La pantalla se habilitará automáticamente al terminar la migración.</p></div></main>;
 if(!check.rows[0].v3||!check.rows[0].has_deleted) return <main className="wrap"><div className="card"><h1>Actualización v3 pendiente</h1><p>Ejecuta <code>db/migration_v3.sql</code> en PostgreSQL. Esta actualización agrega presupuesto mensual, recurrentes con fechas y eliminación reversible.</p></div></main>;
 if(!check.rows[0].v5) return <main className="wrap"><div className="card"><h1>Actualización v5 pendiente</h1><p>Ejecuta <code>db/migration_v5.sql</code> en PostgreSQL. Agrega cuentas, tarjetas, cuotas, transferencias, deudas, etiquetas, comprobantes y cierres mensuales.</p></div></main>;
 if(!check.rows[0].v6) return <main className="wrap"><div className="card"><h1>Actualización v6 pendiente</h1><p>Ejecuta <code>db/migration_v6.sql</code> en PostgreSQL para conectar cuentas, deudas y movimientos.</p></div></main>;
 return <Dashboard params={params} user={user}/>;
}