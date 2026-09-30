'use client';
import { useEffect, useState } from 'react';
export default function ThemeToggle(){
 const [theme,setTheme]=useState('dark');
 useEffect(()=>{const saved=localStorage.getItem('gastos-theme')||'dark';document.documentElement.dataset.theme=saved;setTheme(saved)},[]);
 const toggle=()=>{const next=theme==='dark'?'light':'dark';setTheme(next);document.documentElement.dataset.theme=next;localStorage.setItem('gastos-theme',next)};
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Cambiar tema">{theme==='dark'?'☀ Claro':'☾ Oscuro'}</button>
}