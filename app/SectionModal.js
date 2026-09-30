'use client';
import {useState} from 'react';
export default function SectionModal({eyebrow,title,buttonLabel,children,wide=false}){
 const [open,setOpen]=useState(false);
 return <><button type="button" className="section-modal-trigger" onClick={()=>setOpen(true)}><span><small>{eyebrow}</small><b>{title}</b></span><i>＋</i></button>
 {open&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><div className={`modal-card section-modal ${wide?'wide':''}`}><div className="modal-title"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div><button type="button" className="modal-close" onClick={()=>setOpen(false)}>×</button></div><div className="section-modal-body">{children}</div><div className="section-modal-footer"><button type="button" className="secondary-btn" onClick={()=>setOpen(false)}>Cerrar</button></div></div></div>}</>
}