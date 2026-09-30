'use server';

import { pool } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function addIncome(formData) {
  const concept = String(formData.get('concept') || '').trim();
  const source = String(formData.get('source') || 'extra');
  const amount = Number(formData.get('amount') || 0);
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!concept || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query(
    'INSERT INTO income (concept, source, amount, occurred_on) VALUES ($1,$2,$3,$4)',
    [concept, source, amount, occurredOn]
  );
  revalidatePath('/');
}

export async function addExpense(formData) {
  const concept = String(formData.get('concept') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const amount = Number(formData.get('amount') || 0);
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!concept || !category || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query(
    'INSERT INTO expense (concept, category, amount, occurred_on) VALUES ($1,$2,$3,$4)',
    [concept, category, amount, occurredOn]
  );
  revalidatePath('/');
}
