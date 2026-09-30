import { pool } from '../lib/db';
import { addExpense, addIncome } from './actions';

export const dynamic = 'force-dynamic';

const money = (n) => new Intl.NumberFormat('es-UY',{style:'currency',currency:'UYU',maximumFractionDigits:2}).format(Number(n||0));

function recommendations({ income, expense, savingsRate, topCategory, fixedShare }) {
  const out = [];
  if (income <= 0) out.push('Registra tus ingresos del mes para poder medir capacidad de ahorro y gasto sostenible.');
  if (expense > income && income > 0) out.push('Tus gastos superan tus ingresos del período. Prioriza recortar categorías no esenciales y revisar gastos recurrentes.');
  if (savingsRate < 10 && income > 0) out.push('Tu tasa de ahorro está por debajo de 10%. Intenta reservar primero una parte del ingreso antes de gastar.');
  if (savingsRate >= 20) out.push('Mantienes una tasa de ahorro de al menos 20%, una señal positiva para construir colchón financiero.');
  if (topCategory?.share > 35) out.push(`La categoría “${topCategory.category}” concentra ${topCategory.share.toFixed(1)}% del gasto. Vale la pena revisarla primero.`);
  if (fixedShare > 60) out.push('Más de 60% del gasto está concentrado en vivienda, servicios, deudas o suscripciones. Revisa contratos y gastos recurrentes.');
  if (!out.length) out.push('El gasto está relativamente equilibrado. Mantén el control semanal para evitar desvíos al final del mes.');
  return out;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params?.year || now.getFullYear());
  const month = Number(params?.month || now.getMonth()+1);
  const from = `${year}-${String(month).padStart(2,'0')}-01`;
  const next = new Date(Date.UTC(year, month, 1));
  const to = next.toISOString().slice(0,10);

  const [inc, exp, cats, monthly, recentInc, recentExp, annual] = await Promise.all([
    pool.query('SELECT COALESCE(SUM(amount),0) total FROM income WHERE occurred_on >= $1 AND occurred_on < $2',[from,to]),
    pool.query('SELECT COALESCE(SUM(amount),0) total FROM expense WHERE occurred_on >= $1 AND occurred_on < $2',[from,to]),
    pool.query(`SELECT category, SUM(amount)::numeric total FROM expense WHERE occurred_on >= $1 AND occurred_on < $2 GROUP BY category ORDER BY total DESC`,[from,to]),
    pool.query(`
      WITH m AS (SELECT generate_series(1,12) m)
      SELECT m.m,
        COALESCE((SELECT SUM(amount) FROM income i WHERE EXTRACT(YEAR FROM i.occurred_on)=$1 AND EXTRACT(MONTH FROM i.occurred_on)=m.m),0) income,
        COALESCE((SELECT SUM(amount) FROM expense e WHERE EXTRACT(YEAR FROM e.occurred_on)=$1 AND EXTRACT(MONTH FROM e.occurred_on)=m.m),0) expense
      FROM m ORDER BY m.m`,[year]),
    pool.query('SELECT * FROM income ORDER BY occurred_on DESC, id DESC LIMIT 8'),
    pool.query('SELECT * FROM expense ORDER BY occurred_on DESC, id DESC LIMIT 8'),
    pool.query(`SELECT
      COALESCE((SELECT SUM(amount) FROM income WHERE EXTRACT(YEAR FROM occurred_on)=$1),0) income,
      COALESCE((SELECT SUM(amount) FROM expense WHERE EXTRACT(YEAR FROM occurred_on)=$1),0) expense`,[year]),
  ]);

  const income = Number(inc.rows[0].total);
  const expense = Number(exp.rows[0].total);
  const balance = income-expense;
  const savingsRate = income > 0 ? balance/income*100 : 0;
  const categories = cats.rows.map(r=>({...r,total:Number(r.total),share:expense>0?Number(r.total)/expense*100:0}));
  const topCategory = categories[0];
  const fixedNames = ['vivienda','alquiler','servicios','deudas','suscripciones'];
  const fixedShare = expense > 0 ? categories.filter(c=>fixedNames.includes(c.category.toLowerCase())).reduce((s,c)=>s+c.total,0)/expense*100 : 0;
  const advice = recommendations({income,expense,savingsRate,topCategory,fixedShare});
  const maxMonthly = Math.max(1,...monthly.rows.flatMap(r=>[Number(r.income),Number(r.expense)]));
  const monthNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return <main className="wrap">
    <div className="hero">
      <div>
        <div className="muted">FINANZAS PERSONALES</div>
        <h1>Gestor de gastos</h1>
        <div className="muted">Control mensual y anual de lo que entra, lo que sale y dónde mejorar.</div>
      </div>
      <form className="filters" method="GET">
        <select name="month" defaultValue={String(month)} aria-label="Mes">
          {monthNames.map((name,i)=><option key={name} value={i+1}>{name}</option>)}
        </select>
        <select name="year" defaultValue={String(year)} aria-label="Año">
          {Array.from({length:11},(_,i)=>year-5+i).map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit">Ver período</button>
      </form>
    </div>

    <section className="grid kpis">
      <div className="card kpi"><span className="muted">Ingresos del mes</span><strong className="positive">{money(income)}</strong></div>
      <div className="card kpi"><span className="muted">Gastos del mes</span><strong className="negative">{money(expense)}</strong></div>
      <div className="card kpi"><span className="muted">Balance</span><strong className={balance>=0?'positive':'negative'}>{money(balance)}</strong></div>
      <div className="card kpi"><span className="muted">Tasa de ahorro</span><strong>{savingsRate.toFixed(1)}%</strong></div>
      <div className="card kpi"><span className="muted">Gasto / ingreso</span><strong>{income>0?(expense/income*100).toFixed(1):'0.0'}%</strong></div>
    </section>

    <div style={{height:16}} />

    <section className="grid cols">
      <div className="card">
        <h2 className="section-title">Ingresos</h2>
        <form action={addIncome} className="form">
          <input name="concept" placeholder="Ej. Sueldo septiembre" required />
          <select name="source" defaultValue="sueldo"><option value="sueldo">Sueldo</option><option value="comision">Comisión</option><option value="bonus">Bonus</option><option value="extra">Extra</option></select>
          <input name="amount" type="number" step="0.01" min="0" placeholder="Monto" required />
          <input name="occurred_on" type="date" defaultValue={new Date().toISOString().slice(0,10)} required />
          <button>Agregar</button>
        </form>
        <table className="table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Origen</th><th>Monto</th></tr></thead><tbody>
          {recentInc.rows.map(r=><tr key={r.id}><td>{String(r.occurred_on).slice(0,10)}</td><td>{r.concept}</td><td>{r.source}</td><td className="positive">{money(r.amount)}</td></tr>)}
        </tbody></table>
      </div>

      <div className="card">
        <h2 className="section-title">Resumen anual {year}</h2>
        <p><span className="muted">Ingresos:</span> <b className="positive">{money(annual.rows[0].income)}</b></p>
        <p><span className="muted">Gastos:</span> <b className="negative">{money(annual.rows[0].expense)}</b></p>
        <p><span className="muted">Balance:</span> <b>{money(Number(annual.rows[0].income)-Number(annual.rows[0].expense))}</b></p>
      </div>
    </section>

    <div style={{height:16}} />

    <section className="card">
      <h2 className="section-title">Registrar gasto</h2>
      <form action={addExpense} className="form">
        <input name="concept" placeholder="Ej. Supermercado" required />
        <select name="category" defaultValue="Alimentación">
          <option>Alimentación</option><option>Vivienda</option><option>Servicios</option><option>Transporte</option><option>Salud</option><option>Ocio</option><option>Compras</option><option>Deudas</option><option>Suscripciones</option><option>Educación</option><option>Otros</option>
        </select>
        <input name="amount" type="number" step="0.01" min="0" placeholder="Monto" required />
        <input name="occurred_on" type="date" defaultValue={new Date().toISOString().slice(0,10)} required />
        <button>Agregar</button>
      </form>
    </section>

    <div style={{height:16}} />

    <section className="grid cols">
      <div className="card">
        <h2 className="section-title">Gasto por categoría</h2>
        {categories.length===0 && <p className="muted">Sin gastos registrados en este mes.</p>}
        {categories.map(c=><div key={c.category} style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>{c.category}</span><b>{money(c.total)} · {c.share.toFixed(1)}%</b></div>
          <div className="bar"><span style={{width:`${Math.min(100,c.share)}%`}} /></div>
        </div>)}
      </div>
      <div className="card">
        <h2 className="section-title">Análisis y mejoras</h2>
        {advice.map((a,i)=><div className="recommendation" key={i}>{a}</div>)}
      </div>
    </section>

    <div style={{height:16}} />

    <section className="card">
      <h2 className="section-title">Evolución mensual {year}</h2>
      <div className="month-grid">
        {monthly.rows.map((r,i)=><div className="month-col" key={r.m}>
          <div title={`Ingresos ${money(r.income)}`} className="month-bar" style={{height:`${Math.max(2,Number(r.income)/maxMonthly*130)}px`}} />
          <div title={`Gastos ${money(r.expense)}`} className="month-bar exp" style={{height:`${Math.max(2,Number(r.expense)/maxMonthly*130)}px`}} />
          <span>{monthNames[i]}</span>
        </div>)}
      </div>
      <div className="muted" style={{marginTop:10}}>Primera barra: ingresos · segunda barra: gastos</div>
    </section>

    <div style={{height:16}} />

    <section className="card">
      <h2 className="section-title">Últimos gastos</h2>
      <table className="table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th></tr></thead><tbody>
        {recentExp.rows.map(r=><tr key={r.id}><td>{String(r.occurred_on).slice(0,10)}</td><td>{r.concept}</td><td>{r.category}</td><td className="negative">{money(r.amount)}</td></tr>)}
      </tbody></table>
    </section>
  </main>
}
