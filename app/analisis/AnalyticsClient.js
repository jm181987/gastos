'use client';
import {useState} from 'react';
import './analytics.css';
import Evolution from './Evolution';
import FinancialInsights from './FinancialInsights';
import ThemeToggle from '../ThemeToggle';
const fmt=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU',maximumFractionDigits:0}).format(n||0);
export default function AnalyticsClient({initial,expenses,incomes,prevExpenses,prevIncomes,accounts,cards,categories}){
 const [f,setF]=useState(initial),[selected,setSelected]=useState(''),[metric,setMetric]=useState('amount');
 const sum=a=>a.reduce((s,x)=>s+x.amount,0),total=sum(expenses),income=sum(incomes);
 const groups={};for(const x of expenses)groups[x.category]=(groups[x.category]||0)+x.amount;
 const byDay={};for(const x of expenses){const d=byDay[x.date]||{amount:0,count:0};d.amount+=x.amount;d.count++;byDay[x.date]=d}
 const days=[];for(let t=Date.parse(f.start+'T00:00:00Z'),end=Date.parse(f.end+'T00:00:00Z');t<=end&&days.length<3661;t+=86400000){const date=new Date(t).toISOString().slice(0,10);days.push({date,...(byDay[date]||{amount:0,count:0})})}
 const peak=Math.max(1,...days.map(x=>x[metric])),rank=Object.entries(groups).sort((a,b)=>b[1]-a[1]),max=Math.max(1,...rank.map(x=>x[1]));
 const filtered=expenses.filter(x=>!selected||x.date===selected||x.category===selected);
 return <main className="wrap analytics"><div className="analytics-top"><a className="export-btn" href="/">← Volver al resumen</a><ThemeToggle/></div><div className="analytics-intro"><span className="eyebrow">KNJ FINANZAS · INFORMES</span><h1>Centro de análisis visual</h1><p className="muted">Tus ingresos, gastos y tendencias según los registros de la base de datos.</p></div><form className="card analytics-filters" onSubmit={e=>{e.preventDefault();location.href='/analisis?'+new URLSearchParams(f)}}>
 {[['start','Desde'],['end','Hasta'],['compareStart','Comparar desde'],['compareEnd','Comparar hasta']].map(([k,label])=><label key={k}>{label}<input type="date" required value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></label>)}
 {[['category','Categoría',categories.map(x=>({id:x.name,name:x.name}))],['account','Cuenta',accounts],['card','Tarjeta',cards],['status','Estado',[{id:'pagado',name:'Pagado'},{id:'pendiente',name:'Pendiente'}]]].map(([k,label,items])=><label key={k}>{label}<select value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}><option value="">Todos</option>{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>)}<button>Aplicar filtros</button><a className="export-btn" href="/analisis">Limpiar</a></form>
 {!expenses.length&&!incomes.length&&<div className="card analytics-empty"><b>No se encontraron movimientos en el período seleccionado.</b><p className="muted">Probá ampliar las fechas o restablecer los filtros. Si el resumen principal muestra movimientos para esas fechas, revisá los registros del servidor.</p></div>}<div className="analytics-kpis">{[['Ingresos',income,sum(prevIncomes)],['Gastos',total,sum(prevExpenses)],['Resultado',income-total,sum(prevIncomes)-sum(prevExpenses)]].map(([name,v,old])=><div className="card" key={name}><small>{name}</small><h2>{fmt(v)}</h2><p>Comparación: {fmt(v-old)}</p></div>)}</div>
 <FinancialInsights expenses={expenses} incomes={incomes} prevExpenses={prevExpenses} prevIncomes={prevIncomes} start={initial.start} end={initial.end}/><div className="analytics-grid"><Evolution expenses={expenses} incomes={incomes} prevExpenses={prevExpenses}/><section className="card"><h2>Categorías</h2>{rank.map(([name,v])=><button className="analytics-bar" key={name} onClick={()=>setSelected(name)}><span>{name}</span><i style={{width:v/max*100+'%'}}/>{fmt(v)}</button>)}</section>
 <section className="card"><h2>Mapa de calor</h2><select value={metric} onChange={e=>setMetric(e.target.value)}><option value="amount">Importe</option><option value="count">Cantidad</option></select><div className="analytics-heat">{days.map(d=><button key={d.date} title={d.date+' '+fmt(d.amount)} onClick={()=>setSelected(d.date)} style={{background:d[metric]?'rgba(34,197,94,'+(.15+.8*d[metric]/peak)+')':'var(--surface2)'}}>{d.date.slice(8)}</button>)}</div></section>
 <section className="card"><h2>Indicadores</h2><p>Gasto diario: {fmt(total/Math.max(1,days.length))}</p><p>Movimientos: {expenses.length}</p><p>Ahorro: {income?((income-total)/income*100).toFixed(1):0}%</p></section>
 <section className="card"><h2>Movimientos {selected}</h2><button onClick={()=>setSelected('')}>Limpiar</button>{filtered.slice(0,100).map(x=><p key={x.id}>{x.date} · {x.concept} · {fmt(x.amount)}</p>)}</section></div></main>
}
