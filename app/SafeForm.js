'use client';
import {useState,useTransition} from 'react';

export default function SafeForm({action,className='',children,onSuccess,successMessage='Guardado correctamente',...props}){
 const [error,setError]=useState(''),[success,setSuccess]=useState(''),[pending,start]=useTransition();
 const submit=e=>{
  e.preventDefault(); setError(''); setSuccess('');
  const form=e.currentTarget;
  if(!form.reportValidity()) return;
  const fd=new FormData(form);
  start(async()=>{
   try{
    const result=await action(fd);
    if(result?.ok===false){setError(result.error||'No se pudo guardar. Revisa los datos e inténtalo nuevamente.');return;}
    setSuccess(successMessage);
    if(onSuccess) onSuccess();
   }catch(err){
    const msg=String(err?.message||'');
    setError(msg.includes('obligatorio')||msg.includes('inválid')||msg.includes('mayor')||msg.includes('negativo')?msg:'No se pudo guardar. Revisa los datos e inténtalo nuevamente.');
   }
  });
 };
 return <form {...props} className={className} onSubmit={submit}>
  {children}
  {error&&<div className="form-message error" role="alert">{error}</div>}
  {success&&<div className="form-message success" role="status">{success}</div>}
  {pending&&<div className="form-message pending">Guardando…</div>}
 </form>
}
