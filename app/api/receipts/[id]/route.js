import {pool} from '../../../../../lib/db';
export const dynamic='force-dynamic';
export async function GET(_req,{params}){
 const {id}=await params;
 const r=await pool.query('SELECT file_name,mime_type,data FROM receipts WHERE id=$1',[Number(id)]);
 if(!r.rows[0])return new Response('No encontrado',{status:404});
 const x=r.rows[0];
 return new Response(x.data,{headers:{'Content-Type':x.mime_type,'Content-Disposition':`inline; filename="${String(x.file_name).replace(/"/g,'')}"`,'Cache-Control':'private, no-store'}});
}
