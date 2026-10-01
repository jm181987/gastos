'use client';
import {useState} from 'react';
export default function StartHere({hasAccounts,hasIncome,hasExpense,hasCommitments}){
 const complete=[hasAccounts,hasIncome,hasExpense,hasCommitments],done=complete.filter(Boolean).length;
 const [open,setOpen]=useState(done<3);
 const steps=[
  ['Configura dónde está tu dinero','Agrega efectivo, banco o billetera para conocer tu saldo real.','#finanzas'],
  ['Registra tu primer ingreso','Puede ser sueldo, comisión, venta o cualquier entrada de dinero.','#movimientos'],
  ['Registra tu primer gasto','Anota una compra o pago y KNJ empezará a ordenar tus gastos.','#movimientos'],
  ['Agrega tus compromisos','Tarjetas, cuotas, deudas y pagos recurrentes pueden configurarse cuando los necesites.','#finanzas']
 ];
 if(done===4)return <div className="onboarding-ready"><div><b>Tu panel está listo</b><span>KNJ ya tiene la información básica para ayudarte a controlar tu dinero.</span></div><button type="button" onClick={()=>setOpen(!open)}>{open?'Ocultar':'Ver configuración'}</button>{open&&<div className="onboarding-checks">{steps.map((x,i)=><a href={x[2]} key={x[0]}><em>✓</em><span><b>{x[0]}</b><small>{x[1]}</small></span></a>)}</div>}</div>;
 return <section className="onboarding"><div className="onboarding-head"><div><span className="eyebrow">PRIMEROS PASOS</span><h2>Prepara KNJ para ti</h2><p>Completa estos pasos a tu ritmo. El panel irá marcando automáticamente lo que ya hiciste.</p></div><div className="onboarding-progress"><b>{done}/4</b><span>completados</span></div></div><div className="onboarding-bar"><i style={{width:`${done*25}%`}}/></div>{open&&<div className="onboarding-steps">{steps.map((x,i)=><a className={complete[i]?'done':''} href={x[2]} key={x[0]}><em>{complete[i]?'✓':i+1}</em><span><b>{x[0]}</b><small>{complete[i]?'Completado':x[1]}</small></span><strong>{complete[i]?'Listo':'Empezar ›'}</strong></a>)}</div>}<button type="button" className="onboarding-toggle" onClick={()=>setOpen(!open)}>{open?'Ocultar guía':'Continuar configuración'}</button></section>
}