'use client';
import {useEffect,useState} from 'react';
export default function PWAInstall(){
 const [installed,setInstalled]=useState(false),[deferred,setDeferred]=useState(null),[open,setOpen]=useState(false),[ios,setIos]=useState(false);
 useEffect(()=>{
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const sync=()=>{setInstalled(standalone());if(standalone())setOpen(false)};
  sync();
  setIos(/iPhone|iPad|iPod/.test(navigator.userAgent));
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(console.error);
  const before=e=>{e.preventDefault();setDeferred(e);if(!standalone()&&!sessionStorage.getItem('knj-pwa-dismissed'))setOpen(true)};
  const done=()=>{setInstalled(true);setDeferred(null);setOpen(false)};
  window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);
  const media=window.matchMedia('(display-mode: standalone)');media.addEventListener?.('change',sync);
  if(!standalone()&&!sessionStorage.getItem('knj-pwa-dismissed'))setOpen(true);
  return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);media.removeEventListener?.('change',sync)};
 },[]);
 const install=async()=>{if(deferred){await deferred.prompt();const result=await deferred.userChoice;setDeferred(null);if(result?.outcome==='accepted')setOpen(false)}else setOpen(true)};
 const dismiss=()=>{setOpen(false);sessionStorage.setItem('knj-pwa-dismissed','1')};
 const help=ios?'En Safari, tocá Compartir y elegí «Agregar a pantalla de inicio».':/Android/i.test(typeof navigator==='undefined'?'':navigator.userAgent)?'En Chrome, abrí el menú ⋮ y elegí «Instalar aplicación» o «Agregar a pantalla principal».':'En Chrome o Edge, buscá el icono de instalación en la barra de direcciones o abrí el menú y elegí «Instalar aplicación».';
 return <div className="pwa-control">
  <button type="button" className="pwa-launcher" onClick={()=>{if(!installed&&deferred)install();else setOpen(v=>!v)}} aria-label={installed?'KNJ Finanzas instalada':deferred?'Instalar KNJ Finanzas':'Cómo instalar KNJ Finanzas'}>{installed?'✓ App instalada':deferred?'↓ Instalar app':'↓ Cómo instalar'}</button>
  {open&&<aside className="pwa-install" role="region" aria-label="Instalar KNJ Finanzas"><button className="pwa-close" type="button" aria-label="Cerrar" onClick={dismiss}>×</button><div><strong>{installed?'KNJ Finanzas instalada':'Instalá KNJ Finanzas'}</strong><p>{installed?'La aplicación está abierta en modo independiente.':deferred?'Accedé a tus finanzas desde el escritorio o pantalla de inicio.':help}</p></div>{!installed&&deferred&&<button className="pwa-install-button" type="button" onClick={install}>Instalar</button>}</aside>}
 </div>
}