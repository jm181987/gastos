import {pool} from '../../lib/db';
import {currentUser} from '../../lib/auth';
import {redirect} from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';
export const dynamic='force-dynamic';
const iso=d=>d.toISOString().slice(0,10);
const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
export default async function AnalyticsPage({searchParams}){
 const user=await currentUser();if(!user)redirect('/login');
 const p=await searchParams,now=new Date(),first=iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)));
 const start=valid(p?.start)?p.start:first,end=valid(p?.end)?p.end:iso(now);
 const compareStart=valid(p?.compareStart)?p.compareStart:iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)));
 const compareEnd=valid(p?.compareEnd)?p.compareEnd:iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),0)));
 const category=String(p?.category||''),account=String(p?.account||''),card=String(p?.card||''),status=String(p?.status||'');
 const rangeDays=(Date.parse(end)-Date.parse(start))/86400000;
 if(rangeDays<0||rangeDays>3660)return <main className="wrap"><a href="/analisis">Volver al análisis</a><p>Seleccioná un rango de hasta 10 años.</p></main>;
 const [accounts,cards,categories]=await Promise.all([
 pool.query('SELECT id,name FROM accounts WHERE user_id=$1 ORDER BY name',[user.id]),
 pool.query('SELECT id,name FROM credit_cards WHERE user_id=$1 ORDER BY name',[user.id]),
 pool.query('SELECT name FROM categories WHERE user_id=$1 ORDER BY name',[user.id])
 ]);
 const opts={start,end,compareStart,compareEnd,category,account,card,status};
 const values=[user.id,start,end,category,account,card,status,compareStart,compareEnd];
 const filter=`user_id=$1 AND deleted_at IS NULL AND occurred_on >= $2::date AND occurred_on < ($3::date + INTERVAL '1 day') AND ($4='' OR category=$4) AND ($5='' OR account_id::text=$5) AND ($6='' OR credit_card_id::text=$6) AND ($7='' OR status=$7)`;
 const incFilter=`user_id=$1 AND deleted_at IS NULL AND occurred_on >= $2::date AND occurred_on < ($3::date + INTERVAL '1 day') AND ($5='' OR account_id::text=$5) AND ($7='' OR status=$7)`;
 const expenseSQL=`SELECT id,occurred_on::date AS date,concept,category,amount,status,account_id,credit_card_id FROM expense WHERE ${filter} ORDER BY occurred_on,id`;
 const incomeSQL=`SELECT id,occurred_on::date AS date,concept,source,amount,status,account_id FROM income WHERE ${incFilter} ORDER BY occurred_on,id`;
 const [expenses,incomes,prevExpenses,prevIncomes]=await Promise.all([
 pool.query(expenseSQL,values),pool.query(incomeSQL,values),
 pool.query(expenseSQL,[user.id,compareStart,compareEnd,category,account,card,status]),
 pool.query(incomeSQL,[user.id,compareStart,compareEnd,category,account,card,status])
 ]);
 const serialize=r=>r.rows.map(x=>({...x,date:iso(new Date(x.date)),amount:Number(x.amount)}));
 return <AnalyticsClient initial={opts} expenses={serialize(expenses)} incomes={serialize(incomes)} prevExpenses={serialize(prevExpenses)} prevIncomes={serialize(prevIncomes)} accounts={accounts.rows} cards={cards.rows} categories={categories.rows}/>;
}
