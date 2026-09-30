'use server';
import {pool} from '../lib/db';
import {hashPassword,verifyPassword,createSession,destroySession,currentUser,audit} from '../lib/auth';
import {redirect} from 'next/navigation';
const clean=v=>String(v||'').trim();
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
export async function logout(){const u=await currentUser();if(u)await audit(u.id,'logout','user',u.id);await destroySession();redirect('/login')}
export async function createUser(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const email=clean(fd.get('email')).toLowerCase(),whatsapp=clean(fd.get('whatsapp')),password=String(fd.get('password')||'');if(!email||!whatsapp||password.length<8)throw new Error('Completa email, WhatsApp y una contraseña de al menos 8 caracteres');const r=await pool.query("INSERT INTO app_users(email,whatsapp,password_hash,role) VALUES($1,$2,$3,'user') RETURNING id",[email,whatsapp,hashPassword(password)]);await audit(admin.id,'create_user','user',r.rows[0].id,{email});redirect('/admin')}
export async function toggleUser(fd){const admin=await currentUser();if(!admin||admin.role!=='admin')throw new Error('No autorizado');const id=Number(fd.get('id'));if(id===Number(admin.id))throw new Error('No puedes desactivar tu propia cuenta');const r=await pool.query('UPDATE app_users SET active=NOT active WHERE id=$1 RETURNING active,email',[id]);if(r.rows[0])await audit(admin.id,r.rows[0].active?'activate_user':'deactivate_user','user',id,{email:r.rows[0].email});redirect('/admin')}
