'use client';
import {useMemo,useState} from 'react';
import SafeForm from './SafeForm';
export default function ImportPreview({action,year,month}){
 const [csv,setCsv]=useState('');
 const rows=useMemo(()=>{const ls=csv.split(/\r?\n/).filter(Boolean);if(ls.length<2)return[];const h=ls[0].toLowerCase().split(',').map(x=>x.trim());return ls.slice(1,11).map((line,i)=>{const v=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));return {n:i+1,...Object.fromEntries(h.map((x,j)=>[x,v[j]||'']))}})},[csv]);
 return <><SafeForm action={action} className="stack" successMessage="Importación completada"><input type="hidden" name="view_year" value={year}/><input type="hidden" name="view_month" value={month}/><textarea name="csv" rows="7" value={csv} onChange={e=>setCsv(e.target.value)} placeholder="tipo,fecha,concepto,categoria,origen,monto,estado" required/><button>Confirmar importación</button></SafeForm>{rows.length>0&&<div className="import-preview"><b>Vista previa · primeras {rows.length} filas</b>{rows.map(r=><div key={r.n}><span>{r.fecha||'Sin fecha'}</span><span>{r.concepto||'Sin concepto'}</span><span>{r.monto||'Sin monto'}</span></div>)}</div>}</>
}