'use server';

import { pool } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const backToPeriod = (formData) => {
  const year = String(formData.get('view_year') || '');
  const month = String(formData.get('view_month') || '');
  return year && month ? `/?year=${year}&month=${month}` : '/';
};

export async function addIncome(formData) {
  const concept = String(formData.get('concept') || '').trim();
  const source = String(formData.get('source') || 'extra');
  const amount = Number(formData.get('amount') || 0);
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!concept || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query('INSERT INTO income (concept, source, amount, occurred_on) VALUES ($1,$2,$3,$4)',[concept,source,amount,occurredOn]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}

export async function addExpense(formData) {
  const concept = String(formData.get('concept') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const amount = Number(formData.get('amount') || 0);
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!concept || !category || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query('INSERT INTO expense (concept, category, amount, occurred_on) VALUES ($1,$2,$3,$4)',[concept,category,amount,occurredOn]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}

export async function updateIncome(formData) {
  const id = Number(formData.get('id'));
  const concept = String(formData.get('concept') || '').trim();
  const source = String(formData.get('source') || 'extra');
  const amount = Number(formData.get('amount'));
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!id || !concept || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query('UPDATE income SET concept=$1, source=$2, amount=$3, occurred_on=$4 WHERE id=$5',[concept,source,amount,occurredOn,id]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}

export async function updateExpense(formData) {
  const id = Number(formData.get('id'));
  const concept = String(formData.get('concept') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const amount = Number(formData.get('amount'));
  const occurredOn = String(formData.get('occurred_on') || '');
  if (!id || !concept || !category || !occurredOn || !Number.isFinite(amount) || amount < 0) return;
  await pool.query('UPDATE expense SET concept=$1, category=$2, amount=$3, occurred_on=$4 WHERE id=$5',[concept,category,amount,occurredOn,id]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}

export async function deleteIncome(formData) {
  const id = Number(formData.get('id'));
  if (id) await pool.query('DELETE FROM income WHERE id=$1',[id]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}

export async function deleteExpense(formData) {
  const id = Number(formData.get('id'));
  if (id) await pool.query('DELETE FROM expense WHERE id=$1',[id]);
  revalidatePath('/');
  redirect(backToPeriod(formData));
}
