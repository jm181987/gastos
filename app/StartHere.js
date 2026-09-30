'use client';
import {useState} from 'react';
export default function StartHere({hasAccounts,hasCards,hasDebts}){
 const [open,setOpen]=useState(false);
 const steps=[['1','Registra lo de hoy','Usa Agregar ingreso o Agregar gasto. Es lo único necesario para empezar.','#movimientos'],['2','Organiza tu dinero','Crea tus cuentas para que el sistema calcule automáticamente dónde está tu dinero.','#finanzas'],['3','Automatiza lo repetitivo','Configura recurrentes, tarjetas o deudas solo cuando los necesites.','#planificacion']];
 const ready=[hasAccounts,hasCards||hasDebts];
 return <div className="start-here"><button type="button" className="start-here-toggle" onClick={()=>setOpen(!open)}><span><b>¿Qué hago primero?</b><small>{hasAccounts?'Tu gestor ya está conectado · consulta esta guía cuando quieras':'Empieza en 3 pasos · toma menos de un minuto'}</small></span><i>{open?'−':'?'}</i></button>{open&&<div className="start-here-body">{steps.map((x,i)=><a href={x[3]} key={x[0]} onClick={()=>setOpen(false)}><em>{ready[i-1]?'✓':x[0]}</em><span><b>{x[1]}</b><small>{x[2]}</small></span><strong>›</strong></a>)}</div>}</div>
}