import {pool} from '../../lib/db';
import {currentUser} from '../../lib/auth';
import {redirect} from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';
export const dynamic='force-dynamic';
const iso=d=>d.toISOString().slice(0,10);
const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
export default async function AnalyticsPage({searchParams}){
 const user=await currentUser();if(!user)redirect('/login');
 const p=await searchParams,now=new Date(),selectedYear=Number(p?.year)||now.getUTCFullYear(),selectedMonth=Number(p?.month)||now.getUTCMonth()+1,first=iso(new Date(Date.UTC(selectedYear,selectedMonth-1,1))),last=iso(new Date(Date.UTC(selectedYear,selectedMonth,0)));
 const start=valid(p?.start)?p.start:first,end=valid(p?.end)?p.end:(p?.month?last:iso(now));
 const compareStart=valid(p?.compareStart)?p.compareStart:iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)));
 const compareEnd=valid(p?.compareEnd)?p.compareEnd:iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),0)));
 const category=String(p?.category||''),account=String(p?.account||''),card=String(p?.card||''),status=String(p?.status||'');
 const rangeDays=(Date.parse(end)-Date.parse(start))/86400000;
 if(rangeDays<0||rangeDays>3660)return <main className="wrap"><a href="/analisis">Volver al análisis</a><p>Seleccioná un rango de hasta 10 años.</p></main>;
 const metaResults=await Promise.allSettled([
 pool.query('SELECT id,name FROM accounts WHERE user_id=$1 ORDER BY name',[user.id]),
 pool.query('SELECT id,name FROM credit_cards WHERE user_id=$1 ORDER BY name',[user.id]),
 pool.query('SELECT name FROM categories WHERE user_id=$1 ORDER BY name',[user.id])
 ]);
 const [accounts,cards,categories]=metaResults.map((r,i)=>{if(r.status==='fulfilled')return r.value;console.error('Analytics filter query failed',i,r.reason?.message);return {rows:[]}});
 const opts={start,end,compareStart,compareEnd,category,account,card,status};
 const expenseValues=(s,e)=>[user.id,s,e,category,account,card,status];
 const incomeValues=(s,e)=>[user.id,s,e,account,status];
 const filter=`user_id=$1 AND deleted_at IS NULL AND occurred_on >= $2::date AND occurred_on < ($3::date + INTERVAL '1 day') AND ($4::text='' OR category=$4::text) AND ($5::text='' OR account_id::text=$5::text) AND ($6::text='' OR credit_card_id::text=$6::text) AND ($7::text='' OR status=$7::text)`;
 const incFilter=`user_id=$1 AND deleted_at IS NULL AND occurred_on >= $2::date AND occurred_on < ($3::date + INTERVAL '1 day') AND ($4::text='' OR account_id::text=$4::text) AND ($5::text='' OR status=$5::text)`;
 const expenseSQL=`SELECT id,occurred_on::date AS date,concept,category,amount,status,account_id,credit_card_id FROM expense WHERE ${filter} ORDER BY occurred_on,id`;
 const incomeSQL=`SELECT id,occurred_on::date AS date,concept,source,amount,status,account_id FROM income WHERE ${incFilter} ORDER BY occurred_on,id`;
 const results=await Promise.allSettled([
 pool.query(expenseSQL,expenseValues(start,end)),pool.query(incomeSQL,incomeValues(start,end)),
 pool.query(expenseSQL,expenseValues(compareStart,compareEnd)),
 pool.query(incomeSQL,incomeValues(compareStart,compareEnd))
 ]);
 const [expenses,incomes,prevExpenses,prevIncomes]=results.map((r,i)=>{if(r.status==='fulfilled')return r.value;console.error('Analytics query failed',i,r.reason?.message);return {rows:[]}});
 const serialize=r=>r.rows.map(x=>({...x,date:iso(new Date(x.date)),amount:Number(x.amount)}));
 return <AnalyticsClient initial={opts} expenses={serialize(expenses)} incomes={serialize(incomes)} prevExpenses={serialize(prevExpenses)} prevIncomes={serialize(prevIncomes)} accounts={accounts.rows} cards={cards.rows} categories={categories.rows}/>;
}
