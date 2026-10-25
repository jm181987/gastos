import './insights.css';
'use client';
const money=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU',maximumFractionDigits:0}).format(Number(n)||0);
const sum=a=>a.reduce((s,x)=>s+Number(x.amount||0),0);
const percent=(v,b)=>b?((v-b)/Math.abs(b)*100):null;
export default function FinancialInsights({expenses,incomes,prevExpenses,prevIncomes,start,end}){
 const expense=sum(expenses),income=sum(incomes),previousExpense=sum(prevExpenses),previousIncome=sum(prevIncomes);
 const balance=income-expense,oldBalance=previousIncome-previousExpense,days=Math.max(1,Math.round((Date.parse(end)-Date.parse(start))/86400000)+1);
 const paid=expenses.filter(x=>String(x.status).toLowerCase()==='pagado'),pending=expenses.filter(x=>String(x.status).toLowerCase()==='pendiente');
 const category=new Map(),oldCategory=new Map(),byDay=new Map(),sources=new Map();
 for(const x of expenses){const k=x.category||'Sin categoría';category.set(k,(category.get(k)||0)+x.amount);byDay.set(x.date,(byDay.get(x.date)||0)+x.amount)}
 for(const x of prevExpenses){const k=x.category||'Sin categoría';oldCategory.set(k,(oldCategory.get(k)||0)+x.amount)}
 for(const x of incomes){const k=x.source||'Sin origen';sources.set(k,(sources.get(k)||0)+x.amount)}
 const ordered=[...category].sort((a,b)=>b[1]-a[1]),biggest=[...byDay].sort((a,b)=>b[1]-a[1])[0];
 const top=ordered[0],concentration=expense&&top?top[1]/expense*100:0;
 const expenseChange=percent(expense,previousExpense),incomeChange=percent(income,previousIncome);
 const advice=[];
 if(expense>income&&income>0)advice.push({title:'Resultado negativo',body:'Los gastos registrados superan los ingresos en '+money(expense-income)+'. Revisá las categorías con mayor peso y los compromisos pendientes.',level:'warn'});
 if(!income&&expense)advice.push({title:'Ingresos no registrados',body:'Hay gastos pero no ingresos en el rango. Comprobá que los ingresos estén cargados antes de interpretar la tasa de ahorro.',level:'warn'});
 if(expenseChange!==null&&expenseChange>10)advice.push({title:'Aumento de gastos',body:'Los gastos aumentaron '+expenseChange.toFixed(1)+'% respecto del período de comparación. Revisá los movimientos que explican la diferencia.',level:'warn'});
 if(concentration>=40)advice.push({title:'Concentración de gastos',body:(top?.[0]||'Una categoría')+' representa '+concentration.toFixed(1)+'% del gasto registrado. Conviene analizar si es habitual o excepcional.',level:'info'});
 if(pending.length)advice.push({title:'Pagos pendientes',body:'Tenés '+pending.length+' movimientos pendientes por '+money(sum(pending))+'. No equivalen necesariamente a vencimientos futuros.',level:'info'});
 if(income>expense&&income>0)advice.push({title:'Balance positivo',body:'El excedente registrado es '+money(balance)+' ('+(balance/income*100).toFixed(1)+'% de los ingresos). No representa por sí solo el saldo bancario.',level:'good'});
 const renderDelta=n=>n===null?'Sin base comparable':(n>0?'+':'')+n.toFixed(1)+'%';
 return <section className="analytics-insights"><div className="analytics-section-heading"><div><span className="eyebrow">LECTURA FINANCIERA</span><h2>Diagnóstico del período</h2><p className="muted">Indicadores calculados con tus movimientos, no estimaciones inventadas.</p></div></div>
 <div className="analytics-insight-kpis">
 <article className="card"><small>Tasa de ahorro registrada</small><strong>{income?(balance/income*100).toFixed(1)+'%':'Sin ingresos'}</strong><p className="muted">Ingresos menos gastos, dividido entre ingresos</p></article>
 <article className="card"><small>Gasto diario promedio</small><strong>{money(expense/days)}</strong><p className="muted">{days} días en el período</p></article>
 <article className="card"><small>Gastos pagados</small><strong>{money(sum(paid))}</strong><p className="muted">{paid.length} movimientos pagados</p></article>
 <article className="card"><small>Gastos pendientes</small><strong>{money(sum(pending))}</strong><p className="muted">{pending.length} movimientos pendientes</p></article>
 </div>
 <div className="analytics-insight-grid">
 <article className="card"><h3>Comparación de períodos</h3><div className="analytics-metric-rows"><div><span>Ingresos</span><b>{money(income)}</b><em>{renderDelta(incomeChange)}</em></div><div><span>Gastos</span><b>{money(expense)}</b><em>{renderDelta(expenseChange)}</em></div><div><span>Resultado</span><b>{money(balance)}</b><em>{money(balance-oldBalance)} de diferencia</em></div></div><p className="muted">Compará períodos de duración similar para interpretar las variaciones.</p></article>
 <article className="card"><h3>Concentración del gasto</h3>{ordered.length?ordered.slice(0,6).map(([name,value])=><div className="analytics-category-share" key={name}><div><span>{name}</span><b>{money(value)} · {(value/expense*100).toFixed(1)}%</b></div><div className="analytics-share-track"><i style={{width:value/expense*100+'%'}}/></div><small className="muted">Antes: {money(oldCategory.get(name)||0)} · Cambio: {money(value-(oldCategory.get(name)||0))}</small></div>):<p className="muted">Sin gastos registrados.</p>}</article>
 <article className="card"><h3>Origen de los ingresos</h3>{[...sources].sort((a,b)=>b[1]-a[1]).map(([name,value])=><div className="analytics-metric-rows" key={name}><div><span>{name}</span><b>{money(value)}</b><em>{income?(value/income*100).toFixed(1)+'%':''}</em></div></div>)}{!sources.size&&<p className="muted">Sin ingresos registrados.</p>}</article>
 <article className="card"><h3>Patrones de gasto</h3><div className="analytics-metric-rows"><div><span>Día de mayor gasto</span><b>{biggest?.[0]||'Sin datos'}</b><em>{money(biggest?.[1])}</em></div><div><span>Gasto medio por movimiento</span><b>{money(expenses.length?expense/expenses.length:0)}</b></div><div><span>Movimientos de gasto</span><b>{expenses.length}</b></div><div><span>Categorías con gastos</span><b>{ordered.length}</b></div></div></article>
 </div>
 <div className="card"><h3>Observaciones y oportunidades</h3>{advice.length?<div className="analytics-advice">{advice.map((x,i)=><div className={'analytics-advice-item '+x.level} key={i}><b>{x.title}</b><p>{x.body}</p></div>)}</div>:<p className="muted">No hay suficientes movimientos para generar observaciones de este período.</p>}</div>
 <p className="muted">Los valores incluyen movimientos pendientes cuando no filtrás por estado. Los indicadores muestran el flujo registrado del período, no el saldo de las cuentas ni una predicción financiera.</p>
 </section>;
}
