import {cookies} from 'next/headers';
import {pool} from './db';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'crypto';
const COOKIE='gastos_session';
export const hashPassword=p=>{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(String(p),salt,64).toString('hex')};
export const verifyPassword=(p,stored)=>{try{const [salt,key]=String(stored||'').split(':');if(!salt||!key)return false;return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(String(p),salt,64))}catch{return false}};
export async function currentUser(){try{const jar=await cookies(),sid=jar.get(COOKIE)?.value;if(!sid)return null;const r=await pool.query(`SELECT u.id,u.email,u.whatsapp,u.role,u.active FROM user_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.id=$1 AND s.expires_at>NOW() AND u.active=true`,[sid]);return r.rows[0]||null}catch{return null}}
export async function requireUser(){const u=await currentUser();if(!u)throw new Error('Sesión requerida');return u}
export async function createSession(userId){const id=randomUUID();await pool.query("INSERT INTO user_sessions(id,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')",[id,userId]);const jar=await cookies();jar.set(COOKIE,id,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*30})}
export async function destroySession(){const jar=await cookies(),sid=jar.get(COOKIE)?.value;if(sid)await pool.query('DELETE FROM user_sessions WHERE id=$1',[sid]);jar.delete(COOKIE)}
export async function audit(userId,action,entity=null,entityId=null,details={}){await pool.query('INSERT INTO audit_log(user_id,action,entity,entity_id,details) VALUES($1,$2,$3,$4,$5::jsonb)',[userId,action,entity,entityId,JSON.stringify(details)])}
