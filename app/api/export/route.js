import { pool } from '../../../lib/db';
export const dynamic='force-dynamic';
const esc=v=>`"${String(v??'').replaceAll('"','""')}"`;
export async function GET(req){
 const u=new URL(req.url),year=Number(u.searchParams.get('year')),month=Number(u.searchParams.get('month'));
 const from=`${year}-${String(month).padStart(2,'0')}-01`, next=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10);
 const [i,e]=await Promise.all([
  pool.query('SELECT occurred_on,concept,source,amount,status FROM income WHERE occurred_on >= $1 AND occurred_on < $2 ORDER BY occurred_on',[from,next]),
  pool.query('SELECT occurred_on,concept,category,amount,status FROM expense WHERE occurred_on >= $1 AND occurred_on < $2 ORDER BY occurred_on',[from,next])
 ]);
 const rows=['tipo,fecha,concepto,categoria,origen,monto,estado'];
 for(const x of i.rows) rows.push(['ingreso',String(x.occurred_on).slice(0,10),x.concept,'',x.source,x.amount,x.status].map(esc).join(','));
 for(const x of e.rows) rows.push(['gasto',String(x.occurred_on).slice(0,10),x.concept,x.category,'',x.amount,x.status].map(esc).join(','));
 return new Response('\uFEFF'+rows.join('\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="gastos-${year}-${String(month).padStart(2,'0')}.csv"`}});
}