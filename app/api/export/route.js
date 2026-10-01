import {pool} from '../../../lib/db';
import {cookies} from 'next/headers';
export const dynamic='force-dynamic';
const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
export async function GET(req){
 const sid=(await cookies()).get('gastos_session')?.value;
 if(!sid)return new Response('No autorizado',{status:401});
 const sr=await pool.query('SELECT user_id FROM user_sessions WHERE id=$1 AND expires_at>NOW()',[sid]);
 if(!sr.rows[0])return new Response('No autorizado',{status:401});
 const uid=sr.rows[0].user_id,u=new URL(req.url),year=Number(u.searchParams.get('year')),month=Number(u.searchParams.get('month')),from=year+'-'+String(month).padStart(2,'0')+'-01',next=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10);
 const [i,e]=await Promise.all([pool.query('SELECT occurred_on,concept,source,amount,status FROM income WHERE user_id=$3 AND deleted_at IS NULL AND occurred_on >= $1 AND occurred_on < $2 ORDER BY occurred_on',[from,next,uid]),pool.query('SELECT occurred_on,concept,category,amount,status FROM expense WHERE user_id=$3 AND deleted_at IS NULL AND occurred_on >= $1 AND occurred_on < $2 ORDER BY occurred_on',[from,next,uid])]);
 const rows=['tipo,fecha,concepto,categoria,origen,monto,estado'];for(const x of i.rows)rows.push(['ingreso',String(x.occurred_on).slice(0,10),x.concept,'',x.source,x.amount,x.status].map(esc).join(','));for(const x of e.rows)rows.push(['gasto',String(x.occurred_on).slice(0,10),x.concept,x.category,'',x.amount,x.status].map(esc).join(','));
 return new Response('\uFEFF'+rows.join('\n'),{headers:{'Content-Type':'text/csv; charset=utf-8'}});
}