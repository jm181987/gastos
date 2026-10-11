'use server';
import {pool} from '../../lib/db';
import {requireUser,audit} from '../../lib/auth';
import {revalidatePath} from 'next/cache';

export async function assignMonthExpenses(fd){
 const admin=await requireUser();
 if(admin.role!=='admin')throw new Error('Acceso denegado');
 const userId=Number(fd.get('user_id'));
 const accountId=Number(fd.get('account_id'));
 const year=Number(fd.get('year'));
 const month=Number(fd.get('month'));
 if(!Number.isSafeInteger(userId)||userId<=0||!Number.isSafeInteger(accountId)||accountId<=0||!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(month)||month<1||month>12)throw new Error('Datos inválidos');
 if(fd.get('confirmation')!=='ASOCIAR')throw new Error('Escribí ASOCIAR para confirmar');
 const from=`${year}-${String(month).padStart(2,'0')}-01`;
 const to=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10);
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const acc=await client.query('SELECT id FROM accounts WHERE id=$1 AND user_id=$2 AND active=true',[accountId,userId]);
  if(!acc.rowCount)throw new Error('Cuenta inválida para el usuario');
  const changed=await client.query('UPDATE expense SET account_id=$1 WHERE user_id=$2 AND occurred_on >= $3::date AND occurred_on < $4::date AND deleted_at IS NULL AND credit_card_id IS NULL AND account_id IS DISTINCT FROM $1 RETURNING id',[accountId,userId,from,to]);
  await client.query('INSERT INTO audit_log(user_id,action,entity,entity_id,details) VALUES($1,$2,$3,$4,$5::jsonb)',[admin.id,'bulk_assign_expenses_account','app_users',userId,JSON.stringify({account_id:accountId,year,month,updated:changed.rowCount,expense_ids:changed.rows.map(x=>x.id)})]);
  await client.query('COMMIT');
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 revalidatePath('/');revalidatePath('/admin');
}
