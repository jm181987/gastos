'use server';
import { pool } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const back=(fd)=>{const y=fd.get('view_year'),m=fd.get('view_month');return y&&m?`/?year=${y}&month=${m}`:'/'};
const done=(fd)=>{revalidatePath('/');redirect(back(fd))};
const n=v=>Number(v||0), s=v=>String(v||'').trim();

export async function addIncome(fd){await pool.query('INSERT INTO income(concept,source,amount,occurred_on,status) VALUES($1,$2,$3,$4,$5)',[s(fd.get('concept')),s(fd.get('source'))||'extra',n(fd.get('amount')),s(fd.get('occurred_on')),s(fd.get('status'))||'pagado']);done(fd)}
export async function addExpense(fd){await pool.query('INSERT INTO expense(concept,category,amount,occurred_on,status) VALUES($1,$2,$3,$4,$5)',[s(fd.get('concept')),s(fd.get('category')),n(fd.get('amount')),s(fd.get('occurred_on')),s(fd.get('status'))||'pagado']);done(fd)}
export async function updateIncome(fd){await pool.query('UPDATE income SET concept=$1,source=$2,amount=$3,occurred_on=$4,status=$5 WHERE id=$6',[s(fd.get('concept')),s(fd.get('source')),n(fd.get('amount')),s(fd.get('occurred_on')),s(fd.get('status')),n(fd.get('id'))]);done(fd)}
export async function updateExpense(fd){await pool.query('UPDATE expense SET concept=$1,category=$2,amount=$3,occurred_on=$4,status=$5 WHERE id=$6',[s(fd.get('concept')),s(fd.get('category')),n(fd.get('amount')),s(fd.get('occurred_on')),s(fd.get('status')),n(fd.get('id'))]);done(fd)}
export async function deleteIncome(fd){await pool.query('DELETE FROM income WHERE id=$1',[n(fd.get('id'))]);done(fd)}
export async function deleteExpense(fd){await pool.query('DELETE FROM expense WHERE id=$1',[n(fd.get('id'))]);done(fd)}
export async function setBudget(fd){await pool.query(`INSERT INTO budgets(category_id,year,month,amount) VALUES($1,$2,$3,$4) ON CONFLICT(category_id,year,month) DO UPDATE SET amount=EXCLUDED.amount`,[n(fd.get('category_id')),n(fd.get('view_year')),n(fd.get('view_month')),n(fd.get('amount'))]);done(fd)}
export async function addCategory(fd){await pool.query('INSERT INTO categories(name,sort_order) VALUES($1,(SELECT COALESCE(MAX(sort_order),0)+1 FROM categories)) ON CONFLICT(name) DO UPDATE SET active=true',[s(fd.get('name'))]);done(fd)}
export async function toggleCategory(fd){await pool.query('UPDATE categories SET active=NOT active WHERE id=$1',[n(fd.get('id'))]);done(fd)}
export async function addRecurring(fd){await pool.query('INSERT INTO recurring_items(kind,concept,category,source,amount,day_of_month,status) VALUES($1,$2,$3,$4,$5,$6,$7)',[s(fd.get('kind')),s(fd.get('concept')),s(fd.get('category'))||null,s(fd.get('source'))||null,n(fd.get('amount')),n(fd.get('day_of_month'))||1,s(fd.get('status'))||'pendiente']);done(fd)}
export async function deleteRecurring(fd){await pool.query('DELETE FROM recurring_items WHERE id=$1',[n(fd.get('id'))]);done(fd)}
export async function addGoal(fd){await pool.query('INSERT INTO savings_goals(name,target_amount,current_amount,target_date) VALUES($1,$2,$3,$4)',[s(fd.get('name')),n(fd.get('target_amount')),n(fd.get('current_amount')),s(fd.get('target_date'))||null]);done(fd)}
export async function updateGoal(fd){await pool.query('UPDATE savings_goals SET current_amount=$1,target_amount=$2,target_date=$3 WHERE id=$4',[n(fd.get('current_amount')),n(fd.get('target_amount')),s(fd.get('target_date'))||null,n(fd.get('id'))]);done(fd)}
export async function deleteGoal(fd){await pool.query('DELETE FROM savings_goals WHERE id=$1',[n(fd.get('id'))]);done(fd)}
export async function importCsv(fd){
 const raw=s(fd.get('csv')); if(!raw)return;
 const lines=raw.split(/\r?\n/).filter(Boolean); const header=lines.shift()?.toLowerCase().split(',').map(x=>x.trim())||[];
 for(const line of lines){const v=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));const row=Object.fromEntries(header.map((h,i)=>[h,v[i]||'']));
  if(row.tipo==='ingreso') await pool.query('INSERT INTO income(concept,source,amount,occurred_on,status) VALUES($1,$2,$3,$4,$5)',[row.concepto,row.origen||'extra',n(row.monto),row.fecha,row.estado||'pagado']);
  if(row.tipo==='gasto') await pool.query('INSERT INTO expense(concept,category,amount,occurred_on,status) VALUES($1,$2,$3,$4,$5)',[row.concepto,row.categoria||'Otros',n(row.monto),row.fecha,row.estado||'pagado']);
 } done(fd)
}
