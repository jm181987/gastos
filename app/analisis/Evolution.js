'use client';
import {useState} from 'react';
const fmt=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU',maximumFractionDigits:0}).format(n||0);
export default function Evolution({expenses,incomes,prevExpenses}){
 const [scale,setScale]=useState('month');
 const bucket=d=>scale==='day'?d:scale==='year'?d.slice(0,4):scale==='month'?d.slice(0,7):(()=>{const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+6)%7);return t.toISOString().slice(0,10)})();
 const m=new Map();for(const [items,k] of [[expenses,'expense'],[incomes,'income']])for(const x of items){const d=bucket(x.date),v=m.get(d)||{income:0,expense:0};v[k]+=x.amount;m.set(d,v)}
 let balance=0;const rows=[...m].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,v])=>({date,...v,balance:balance+=v.income-v.expense}));
 const max=Math.max(1,...rows.flatMap(x=>[x.income,x.expense,Math.abs(x.balance)]));
 const line=k=>rows.map((x,i)=>(i?'L':'M')+(25+i*710/Math.max(1,rows.length-1))+' '+(205-x[k]/max*170)).join(' ');
 const old={};for(const x of prevExpenses)old[x.category]=(old[x.category]||0)+x.amount;
 const current={};for(const x of expenses)current[x.category]=(current[x.category]||0)+x.amount;
 return <><section className="card"><h2>Evolución financiera</h2><select value={scale} onChange={e=>setScale(e.target.value)}>{[['day','Diaria'],['week','Semanal'],['month','Mensual'],['year','Anual']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>{rows.length?<svg viewBox="0 0 760 230" role="img" aria-label="Evolución de ingresos, gastos y saldo" style={{width:'100%'}}>{[['income','#22c55e'],['expense','#fb7185'],['balance','#60a5fa']].map(([k,color])=><path key={k} d={line(k)} fill="none" stroke={color} strokeWidth="3"/>)}</svg>:<p>Sin movimientos</p>}<p className="muted">Verde: ingresos · Rosa: gastos · Azul: saldo acumulado del período</p></section><section className="card"><h2>Comparación por categoría</h2>{Object.entries(current).sort((a,b)=>b[1]-a[1]).map(([k,v])=><p key={k}><b>{k}</b> · {fmt(v)} vs {fmt(old[k]||0)} · diferencia {fmt(v-(old[k]||0))}</p>)}</section></>
}
