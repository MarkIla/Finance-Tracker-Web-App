/* Shared React-Query hooks for Expenses & Incomes */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

/* ──────────────────────────────────── Lists ──────────────────────────────────── */
export function useExpenses(month: string) {
  return useQuery({
    queryKey: ['expenses', month],
    queryFn: () =>
      api.get('/expenses', { params: { month } }).then((r) => r.data),
  });
}

export function useIncomes(month: string) {
  return useQuery({
    queryKey: ['incomes', month],
    queryFn: () =>
      api.get('/incomes', { params: { month } }).then((r) => r.data),
  });
}

/* ──────────────────────────────────── Add ────────────────────────────────────── */
export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post('/expenses', body).then((r) => r.data),
    onSuccess: (_d, vars) => {
      const month = vars.incurredAt.slice(0, 7);
      qc.invalidateQueries({ queryKey: ['expenses', month] });
      qc.invalidateQueries({ queryKey: ['summary', month] });
      qc.invalidateQueries({ queryKey: ['categories', month] });
    },
  });
}

export function useAddIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post('/incomes', body).then((r) => r.data),
    onSuccess: (_d, vars) => {
      const month = vars.receivedAt.slice(0, 7);
      qc.invalidateQueries({ queryKey: ['incomes', month] });
      qc.invalidateQueries({ queryKey: ['summary', month] });
    },
  });
}

/* ──────────────────────────────────── Update ─────────────────────────────────── */
export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: any }) =>
      api.patch(`/expenses/${vars.id}`, vars.body).then((r) => r.data),
    onSuccess: (updated) => {
      const month = updated.incurredAt.slice(0, 7);
      qc.invalidateQueries({ queryKey: ['expenses', month] });
      qc.invalidateQueries({ queryKey: ['summary', month] });
      qc.invalidateQueries({ queryKey: ['categories', month] });
    },
  });
}

export function useUpdateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: any }) =>
      api.patch(`/incomes/${vars.id}`, vars.body).then((r) => r.data),
    onSuccess: (updated) => {
      const month = updated.receivedAt.slice(0, 7);
      qc.invalidateQueries({ queryKey: ['incomes', month] });
      qc.invalidateQueries({ queryKey: ['summary', month] });
    },
  });
}

/* ──────────────────────────────────── Delete ─────────────────────────────────── */
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; month: string }) =>
      api.delete(`/expenses/${vars.id}`).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses', vars.month] });
      qc.invalidateQueries({ queryKey: ['summary', vars.month] });
      qc.invalidateQueries({ queryKey: ['categories', vars.month] });
    },
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; month: string }) =>
      api.delete(`/incomes/${vars.id}`).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['incomes', vars.month] });
      qc.invalidateQueries({ queryKey: ['summary', vars.month] });
    },
  });
}
