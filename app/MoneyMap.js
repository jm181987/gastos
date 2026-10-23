const fmt=n=>new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU',maximumFractionDigits:0}).format(Number(n||0));
const shorten=(s,n=22)=>String(s).length>n?String(s).slice(0,n-1)+'…':String(s);
export default function MoneyMap({sources=[],destinations=[],year,month}){
 const ins=sources.filter(x=>Number(x.amount)>0).map(x=>({name:x.name||'Otros ingresos',amount:Number(x.amount)})).sort((a,b)=>b.amount-a.amount);
 const outs=destinations.filter(x=>Number(x.amount)>0).map(x=>({name:x.name||'Otros gastos',amount:Number(x.amount)})).sort((a,b)=>b.amount-a.amount);
 const sum=a=>a.reduce((s,x)=>s+x.amount,0),income=sum(ins),expense=sum(outs),remaining=income-expense;
 const compact=(arr,max)=>arr.length<=max?arr:[...arr.slice(0,max-1),{name:'Otras categorías',amount:sum(arr.slice(max-1))}];
 const left=compact(ins,8),right=compact([...outs,...(remaining>0?[{name:'Saldo del período',amount:remaining}]:[])],9);
 const h=Math.max(340,Math.max(left.length,right.length)*47+60),top=36,usable=h-72;
 const layout=(arr,total)=>{let y=top;return arr.map((x,i)=>{const height=Math.max(8,total?x.amount/total*(usable-arr.length*12):8);const node={...x,y,height};y+=height+12;return node})};
 const maxTotal=Math.max(income,expense,1),L=layout(left,maxTotal),R=layout(right,maxTotal);
 const centerY=top+usable/2,centerHeight=Math.max(12,Math.min(usable,income/maxTotal*usable));
 const colors=['#4b9fff','#9d87ff','#2dd4bf','#ffb55a','#f07da3','#76c3ff','#b7d26d','#c99bf5','#fb8878'];
 return <section className="card money-map" aria-label="Mapa del dinero">
  <div className="section-head"><div><span className="eyebrow">FLUJO FINANCIERO · {String(month).padStart(2,'0')}/{year}</span><h2>Mapa del dinero</h2><p className="muted">De dónde viene y cómo se distribuye tu dinero en el período seleccionado.</p></div></div>
  <div className="money-map-totals"><div><small>Ingresos</small><b>{fmt(income)}</b></div><div><small>Gastos</small><b>{fmt(expense)}</b></div><div><small>Resultado</small><b className={remaining<0?'negative':'positive'}>{fmt(remaining)}</b></div></div>
  {income===0&&expense===0?<p className="muted">Todavía no hay ingresos ni gastos registrados en este mes.</p>:<>
  <div className="money-map-scroll"><svg viewBox={`0 0 1000 ${h}`} role="img" aria-label={`Ingresos ${fmt(income)}, gastos ${fmt(expense)}, resultado ${fmt(remaining)}`} preserveAspectRatio="xMidYMin meet">
   <text x="12" y="20" className="money-map-heading">ORIGEN</text><text x="450" y="20" className="money-map-heading">TOTAL</text><text x="770" y="20" className="money-map-heading">DESTINO</text>
   {L.map((n,i)=><path key={'in'+i} d={`M 222 ${n.y+n.height/2} C 335 ${n.y+n.height/2}, 355 ${centerY}, 455 ${centerY}`} fill="none" stroke={colors[i%colors.length]} strokeOpacity=".37" strokeWidth={Math.max(2,n.height)} />)}
   {R.map((n,i)=><path key={'out'+i} d={`M 545 ${centerY} C 650 ${centerY}, 665 ${n.y+n.height/2}, 770 ${n.y+n.height/2}`} fill="none" stroke={colors[(i+2)%colors.length]} strokeOpacity=".38" strokeWidth={Math.max(2,n.height)}/>)}
   <rect x="455" y={centerY-centerHeight/2} width="90" height={centerHeight} rx="12" fill="#3b82f6" opacity=".9"/>
   <text x="500" y={centerY+4} textAnchor="middle" className="money-map-center">UYU</text>
   {L.map((n,i)=><g key={'labelin'+i}><rect x="8" y={n.y} width="214" height={Math.max(18,n.height)} rx="6" fill={colors[i%colors.length]} opacity=".2"/><text x="15" y={n.y+14} className="money-map-label">{shorten(n.name)}</text><text x="15" y={n.y+29} className="money-map-value">{fmt(n.amount)}</text><title>{n.name}: {fmt(n.amount)}</title></g>)}
   {R.map((n,i)=><g key={'labelout'+i}><rect x="770" y={n.y} width="222" height={Math.max(18,n.height)} rx="6" fill={colors[(i+2)%colors.length]} opacity=".2"/><text x="780" y={n.y+14} className="money-map-label">{shorten(n.name)}</text><text x="780" y={n.y+29} className="money-map-value">{fmt(n.amount)}</text><title>{n.name}: {fmt(n.amount)}</title></g>)}
  </svg></div>
  <p className="muted money-map-note">Vista agregada de ingresos y gastos registrados, incluidos pendientes. No representa transferencias reales entre cuentas ni descuenta cuotas de deudas por separado. {remaining<0?'El resultado negativo indica gastos superiores a los ingresos.':'El resultado es la diferencia entre ingresos y gastos.'}</p>
  </>}
 </section>
}
