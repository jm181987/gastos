'use server';
import {pool} from '../lib/db';
import {hashPassword,verifyPassword,createSession,destroySession,currentUser,audit} from '../lib/auth';
import {redirect} from 'next/navigation';
const clean=v=>String(v||'').trim();
async function notifyNewRegistration(id,email,whatsapp){
 const token=process.env.TELEGRAM_BOT_TOKEN,chatId=process.env.TELEGRAM_ADMIN_CHAT_ID;
 if(!token||!chatId)return;
 const text=['🆕 Nuevo registro en KNJ Finanzas','ID interno: '+id,'Email: '+email,'WhatsApp: '+whatsapp,'Fecha/hora: '+new Date().toISOString(),'Cuenta creada correctamente'].join('\n');
 try{
  const r=await fetch('https://api.telegram.org/bot'+token+'/sendMessage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});
  if(!r.ok)console.error('Telegram notification HTTP '+r.status);
 }catch{console.error('Telegram registration notification failed')}
}
export async function login(fd){
 const email=clean(fd.get('email')).toLowerCase(),whatsapp=clean(fd.get('whatsapp')),password=String(fd.get('password')||'');
 const r=await pool.query('SELECT * FROM app_users WHERE lower(email)=$1 AND active=true',[email]);const u=r.rows[0];
 if(!u) return {ok:false,error:'Datos de acceso incorrectos.'};
 if(!u.password_hash&&email==='jorgitom18@gmail.com'){
  const initial=process.env.ADMIN_INITIAL_PASSWORD,adminWa=process.env.ADMIN_WHATSAPP;
  if(!initial||!adminWa)return {ok:false,error:'El administrador todavía no fue configurado en el servidor.'};
  if(password!==initial||whatsapp!==adminWa)return {ok:false,error:'Datos de acceso incorrectos.'};
  await pool.query('UPDATE app_users SET password_hash=$1,whatsapp=$2,last_login_at=NOW() WHERE id=$3',[hashPassword(password),whatsapp,u.id]);
 }else if(u.whatsapp!==whatsapp||!verifyPassword(password,u.password_hash))return {ok:false,error:'Datos de acceso incorrectos.'};
 await createSession(u.id);await pool.query('UPDATE app_users SET last_login_at=NOW() WHERE id=$1',[u.id]);await audit(u.id,'login','user',u.id);redirect('/');
}

export async function register(fd){
 const email=clean(fd.get('email')).toLowerCase(),whatsapp=clean(fd.get('whatsapp')),password=String(fd.get('password')||''),confirm=String(fd.get('confirm_password')||'');
 if(!email||!email.includes('@')||!whatsapp)return {ok:false,error:'Completa tu email y WhatsApp.'};
 if(password.length<8)return {ok:false,error:'La contraseña debe tener al menos 8 caracteres.'};
 if(password!==confirm)return {ok:false,error:'Las contraseñas no coinciden.'};
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const exists=await client.query('SELECT id FROM app_users WHERE lower(email)=$1',[email]);
  if(exists.rows[0]){await client.query('ROLLBACK');return {ok:false,error:'Ya existe una cuenta con ese email.'}}
  const r=await client.query("INSERT INTO app_users(email,whatsapp,password_hash,role,active) VALUES($1,$2,$3,'user',true) RETURNING id",[email,whatsapp,hashPassword(password)]);
  const id=r.rows[0].id;
  await client.query("INSERT INTO accounts(name,kind,opening_balance,user_id) VALUES('Efectivo','cash',0,$1) ON CONFLICT(user_id,name) DO NOTHING",[id]);
  for(const [name,sort] of [['Alimentación',10],['Transporte',20],['Vivienda',30],['Servicios',40],['Salud',50],['Ocio',60],['Otros',100]])await client.query('INSERT INTO categories(name,sort_order,user_id) VALUES($1,$2,$3) ON CONFLICT(user_id,name) DO NOTHING',[name,sort,id]);
  await client.query('COMMIT');
  await audit(id,'register','user',id);
  await notifyNewRegistration(id,email,whatsapp);
  await createSession(id);
 }catch(e){await client.query('ROLLBACK');return {ok:false,error:'No pudimos crear la cuenta. Revisa los datos e intenta nuevamente.'}}finally{client.release()}
 redirect('/');
}

export async function logout(){const u=await currentUser();if(u)await audit(u.id,'logout','user',u.id);await destroySession();redirect('/login')}
export async function createUser(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const email=clean(fd.get('email')).toLowerCase(),whatsapp=clean(fd.get('whatsapp')),password=String(fd.get('password')||'');if(!email||!whatsapp||password.length<8)throw new Error('Completa email, WhatsApp y una contraseña de al menos 8 caracteres');const r=await pool.query("INSERT INTO app_users(email,whatsapp,password_hash,role) VALUES($1,$2,$3,'user') RETURNING id",[email,whatsapp,hashPassword(password)]);await audit(admin.id,'create_user','user',r.rows[0].id,{email});redirect('/admin')}
export async function toggleUser(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const id=Number(fd.get('id'));if(id===Number(admin.id))throw new Error('No puedes desactivar tu propia cuenta');const r=await pool.query('UPDATE app_users SET active=NOT active WHERE id=$1 RETURNING active,email',[id]);if(r.rows[0])await audit(admin.id,r.rows[0].active?'activate_user':'deactivate_user','user',id,{email:r.rows[0].email});redirect('/admin')}

export async function deleteUser(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const id=Number(fd.get('id'));if(!Number.isInteger(id)||id<=0)throw new Error('Usuario inválido');if(id===Number(admin.id))throw new Error('No puedes eliminar tu propia cuenta');const client=await pool.connect();try{await client.query('BEGIN');const target=await client.query('SELECT email,role FROM app_users WHERE id=$1 FOR UPDATE',[id]);if(!target.rows[0])throw new Error('Usuario no encontrado');if(target.rows[0].role==='admin')throw new Error('No puedes eliminar otra cuenta administradora');await client.query('DELETE FROM user_sessions WHERE user_id=$1',[id]);await client.query('UPDATE app_users SET active=false,password_hash=NULL WHERE id=$1',[id]);await client.query('COMMIT');await audit(admin.id,'delete_user','user',id,{previous_email:target.rows[0].email});}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}redirect('/admin')}

export async function resetUserPassword(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const id=Number(fd.get('id')),password=String(fd.get('new_password')||'');if(!Number.isInteger(id)||id<=0)throw new Error('Usuario inválido');if(password.length<8)throw new Error('La nueva contraseña debe tener al menos 8 caracteres');const client=await pool.connect();try{await client.query('BEGIN');const target=await client.query('SELECT email,role FROM app_users WHERE id=$1 FOR UPDATE',[id]);if(!target.rows[0])throw new Error('Usuario no encontrado');if(target.rows[0].role==='admin'&&id!==Number(admin.id))throw new Error('No puedes restablecer la contraseña de otro administrador');await client.query('UPDATE app_users SET password_hash=$1,active=true WHERE id=$2',[hashPassword(password),id]);await client.query('DELETE FROM user_sessions WHERE user_id=$1',[id]);await client.query('COMMIT');await audit(admin.id,'reset_password','user',id,{email:target.rows[0].email});}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}redirect('/admin')}


export async function permanentlyDeleteUser(fd){
 const admin=await currentUser();
 if(!admin||admin.role!=='admin')throw new Error('No autorizado');
 const id=Number(fd.get('id')),confirmation=clean(fd.get('confirmation'));
 if(!Number.isInteger(id)||id<=0)throw new Error('Usuario inválido');
 if(id===Number(admin.id))throw new Error('No puedes eliminar permanentemente tu propia cuenta');
 if(confirmation!=='ELIMINAR')throw new Error('Escribe ELIMINAR para confirmar');
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const target=await client.query('SELECT email,role FROM app_users WHERE id=$1 FOR UPDATE',[id]);
  if(!target.rows[0])throw new Error('Usuario no encontrado');
  if(target.rows[0].role==='admin')throw new Error('No puedes eliminar permanentemente otra cuenta administradora');
  const email=target.rows[0].email;
  await client.query("DELETE FROM movement_tags mt USING income i WHERE mt.movement_kind='income' AND mt.movement_id=i.id AND i.user_id=$1",[id]);
  await client.query("DELETE FROM movement_tags mt USING expense e WHERE mt.movement_kind='expense' AND mt.movement_id=e.id AND e.user_id=$1",[id]);
  await client.query('DELETE FROM debt_payments dp USING debts d WHERE dp.debt_id=d.id AND d.user_id=$1',[id]);
  await client.query('DELETE FROM user_sessions WHERE user_id=$1',[id]);
  for(const table of ['receipts','transfers','credit_cards','income','expense','debts','accounts','tags','monthly_closures','monthly_budgets','savings_goals','recurring_items','budgets','categories'])await client.query('DELETE FROM '+table+' WHERE user_id=$1',[id]);
  await client.query('UPDATE audit_log SET user_id=NULL WHERE user_id=$1',[id]);
  await client.query('DELETE FROM app_users WHERE id=$1',[id]);
  await client.query('COMMIT');
  await audit(admin.id,'permanent_delete_user','user',id,{email});
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 redirect('/admin');
}
