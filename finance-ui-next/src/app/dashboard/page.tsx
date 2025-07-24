'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '../lib/api';
import RequireAuth from '@/components/RequireAuth';
import DataTable from '@/components/DataTable';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  type PieLabelRenderProps,
} from 'recharts';

/* ───────────────────── helpers ───────────────────── */
const COLORS = [
  '#2563EB',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#F43F5E',
  '#14B8A6',
  '#FB923C',
];
interface CategorySlice {
  category: string;
  total: number;
  percent: number;
}
function useMonth() {
  const d = new Date();
  const [month, setMonth] = useState(
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
  );
  return { month, setMonth };
}

/* ───────────────────── dashboard ───────────────────── */
export default function DashboardPage() {
  const { month, setMonth } = useMonth();

  /* summary + charts */
  const summaryQ = useQuery({
    queryKey: ['summary', month],
    queryFn: () => api.get('/summary', { params: { month } }).then((r) => r.data),
  });
  const categoriesQ = useQuery({
    queryKey: ['categories', month],
    queryFn: () =>
      api.get('/summary/categories', { params: { month } }).then((r) => r.data),
  });
  const catData = (categoriesQ.data?.categories ?? []) as CategorySlice[];

  /* preview tables */
  const expensesPreview = useQuery({
    queryKey: ['expenses', month, 'preview'],
    queryFn: () =>
      api
        .get('/expenses', { params: { month, limit: 5, sort: 'desc' } })
        .then((r) => r.data),
  }).data as any[] | undefined;

  const incomesPreview = useQuery({
    queryKey: ['incomes', month, 'preview'],
    queryFn: () =>
      api
        .get('/incomes', { params: { month, limit: 5, sort: 'desc' } })
        .then((r) => r.data),
  }).data as any[] | undefined;

  /* ────────────────── ui ────────────────── */
  return (
    <RequireAuth>
      <main className="p-8 text-gray-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/expenses"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
            >
              Manage Expenses
            </Link>
            <Link
              href="/incomes"
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
            >
              Manage Incomes
            </Link>
          </div>
        </div>

        <label className="mb-6 inline-block text-sm">
          Month:{' '}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border border-gray-600 bg-gray-800 p-1 text-gray-100"
          />
        </label>

        {/* high-contrast cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {['incomeTotal', 'expenseTotal', 'monthlyBalance'].map((k) => (
            <div key={k} className="rounded-lg bg-gray-900 p-6 shadow">
              <p className="text-sm uppercase text-gray-400">
                {k === 'incomeTotal'
                  ? 'Income'
                  : k === 'expenseTotal'
                  ? 'Expense'
                  : 'Balance'}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-100">
                {summaryQ.isLoading
                  ? '…'
                  : summaryQ.data?.[k].toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'PHP',
                    })}
              </p>
            </div>
          ))}
        </div>

        {/* bar chart */}
        <div className="mt-10 h-64 w-full">
          {summaryQ.isLoading ? (
            <p>Loading chart…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', value: summaryQ.data?.incomeTotal ?? 0 },
                  { name: 'Expense', value: summaryQ.data?.expenseTotal ?? 0 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* pie chart */}
        <div className="mt-10 h-80 w-full">
          {categoriesQ.isLoading ? (
            <p>Loading categories…</p>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  dataKey="total"
                  data={catData}
                  innerRadius={50}
                  outerRadius={100}
                  label={({ index }: PieLabelRenderProps) => {
                    const s = catData[index!];
                    return `${s.category}: ${s.percent.toFixed(1)}%`;
                  }}
                >
                  {catData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) =>
                    v.toLocaleString(undefined, { style: 'currency', currency: 'PHP' })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* previews */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Recent Expenses</h2>
            <DataTable
              head={
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Cat.</th>
                  <th className="px-3 py-2 text-right">Amt</th>
                </tr>
              }
              rows={(expensesPreview ?? []).map((e) => (
                <tr key={e.id}>
                  <td className="px-3 py-2">{e.incurredAt.slice(0, 10)}</td>
                  <td className="px-3 py-2">{e.category}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(e.amount).toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'PHP',
                    })}
                  </td>
                </tr>
              ))}
              empty="No expenses yet."
            />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Recent Incomes</h2>
            <DataTable
              head={
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Src.</th>
                  <th className="px-3 py-2 text-right">Amt</th>
                </tr>
              }
              rows={(incomesPreview ?? []).map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2">{i.receivedAt.slice(0, 10)}</td>
                  <td className="px-3 py-2">{i.source}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(i.amount).toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'PHP',
                    })}
                  </td>
                </tr>
              ))}
              empty="No incomes yet."
            />
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
