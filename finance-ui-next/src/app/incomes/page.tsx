'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useIncomes,
  useAddIncome,
  useUpdateIncome,
  useDeleteIncome,
} from '../lib/queries';
import { presignUpload, checksumHeaders, getPreviewUrl } from '../lib/files';

import RequireAuth from '@/components/RequireAuth';
import DataTable   from '@/components/DataTable';
import ConfirmModal from '@/components/ConfirmModal';

/* ─────────────────────────── component ─────────────────────────── */
export default function IncomesPage() {
  /* ─────────────────────────── state ─────────────────────────── */
  const today = new Date();
  const [month, setMonth] = useState(
    `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`,
  );

  const incQ        = useIncomes(month);
  const addIncome   = useAddIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  const [drawer, setDrawer]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    amount: '',
    source: '',
    receivedAt: new Date().toISOString().slice(0, 10),
    note: '',
    receiptKey: null as string | null,
  });

  const [errors, setErrors]       = useState<{ amount?: string }>({});
  const [file, setFile]           = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<null | string>(null);

  /* drawer preview ------------------------------------------------- */
  const [drawerPreview, setDrawerPreview] = useState<string | null>(null);
  useEffect(() => {
    if (draft.receiptKey) {
      getPreviewUrl(draft.receiptKey).then(setDrawerPreview);
    } else {
      setDrawerPreview(null);
    }
  }, [draft.receiptKey]);

  /* hover preview -------------------------------------------------- */
  const tableRef           = useRef<HTMLDivElement>(null);
  const [hoverUrl, setHoverUrl] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  /* ─────────────────────────── handlers ─────────────────────────── */
  function openAdd() {
    setEditingId(null);
    setDraft({
      amount: '',
      source: '',
      receivedAt: new Date().toISOString().slice(0, 10),
      note: '',
      receiptKey: null,
    });
    setErrors({});
    setFile(null);
    setDrawer(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setDraft({
      amount: row.amount,
      source: row.source,
      receivedAt: row.receivedAt.slice(0, 10),
      note: row.note ?? '',
      receiptKey: row.receiptKey ?? null,
    });
    setErrors({});
    setFile(null);
    setDrawer(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    /* amount validation */
    const amt = Number(draft.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setErrors({ amount: 'Amount must be a positive number' });
      return;
    }
    setErrors({}); // clear previous errors

    /* file-type validation */
    if (file && !['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only PNG and JPG images are allowed.');
      return;
    }

    /* upload receipt if any */
    let receiptKey = draft.receiptKey;
    if (file) {
      const { key, url } = await presignUpload(file);
      console.log(url); 
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, ...checksumHeaders(url) },
        body: file,
      });
      receiptKey = key;
    }

    const body = { ...draft, amount: Number(draft.amount), receiptKey };

    editingId
      ? updateIncome.mutate({ id: editingId, body })
      : addIncome.mutate(body);

    setDrawer(false);
  }

  async function handleHover(key: string, ev: React.MouseEvent) {
    const rect = tableRef.current?.getBoundingClientRect();
    setHoverPos({ x: ev.clientX - (rect?.left ?? 0) + 16, y: ev.clientY + 16 });
    setHoverUrl(await getPreviewUrl(key));
  }

  const isAmountValid = Number(draft.amount) > 0;

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <RequireAuth>
      <main className="p-8 text-gray-100">
        {/* header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Incomes</h1>
          </div>

          <button
            onClick={openAdd}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            + Add
          </button>
        </div>

        <label className="mb-4 inline-block text-sm">
          Month:{' '}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border border-gray-600 bg-gray-800 p-1 text-gray-100"
          />
        </label>

        <div ref={tableRef}>
          {incQ.isLoading ? (
            <p className="text-gray-400">Loading…</p>
          ) : (
            <DataTable
              head={
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Receipt</th>
                  <th className="px-3 py-2 text-center">⋯</th>
                </tr>
              }
              rows={(incQ.data ?? []).map((i: any) => {
                const fname = i.receiptKey ? i.receiptKey.split('/').pop() : '';
                return (
                  <tr key={i.id} className="hover:bg-gray-800">
                    <td className="px-3 py-2">{i.receivedAt.slice(0, 10)}</td>
                    <td className="px-3 py-2">{i.source}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(i.amount).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'PHP',
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {i.receiptKey ? (
                        <span
                          className="cursor-pointer underline decoration-dotted underline-offset-4"
                          onMouseEnter={(ev) => handleHover(i.receiptKey, ev)}
                          onMouseLeave={() => setHoverUrl(null)}
                        >
                          {fname}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => openEdit(i)}
                        className="mr-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete(i.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              empty="No incomes this month."
            />
          )}
        </div>

        {/* hover preview */}
        {hoverUrl && (
          <img
            src={hoverUrl}
            className="pointer-events-none fixed z-50 h-40 w-auto rounded border border-gray-700 shadow-lg"
            style={{ left: hoverPos.x, top: hoverPos.y }}
          />
        )}

        {/* Drawer */}
        {drawer && (
          <div className="fixed inset-0 z-40 bg-black/50">
            <form
              onSubmit={submit}
              className="absolute right-0 top-0 z-50 h-full w-80 overflow-y-auto bg-gray-900 p-6 shadow-lg"
            >
              <h2 className="mb-4 text-lg font-semibold">
                {editingId ? 'Edit Income' : 'Add Income'}
              </h2>

              {drawerPreview && !file && (
                <img
                  src={drawerPreview}
                  className="mb-4 max-h-40 w-full rounded object-contain"
                />
              )}

              {/* amount */}
              <input
                className={`mb-1 w-full rounded border bg-gray-800 p-2
                            ${errors.amount ? 'border-red-500' : 'border-gray-600'}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              />
              {errors.amount && (
                <p className="mb-2 text-xs text-red-500">{errors.amount}</p>
              )}

              {/* other fields */}
              <input
                className="mb-3 w-full rounded border border-gray-600 bg-gray-800 p-2"
                placeholder="Source"
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              />
              <input
                className="mb-3 w-full rounded border border-gray-600 bg-gray-800 p-2"
                type="date"
                value={draft.receivedAt}
                onChange={(e) => setDraft({ ...draft, receivedAt: e.target.value })}
              />
              <textarea
                className="mb-3 w-full rounded border border-gray-600 bg-gray-800 p-2"
                placeholder="Note"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />

              {/* receipt upload */}
              <label className="mb-4 block text-sm">
                Receipt (PNG / JPG):
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm text-gray-300"
                />
              </label>

              <button
                disabled={!isAmountValid}
                className={`w-full rounded py-2 text-white
                            ${
                              isAmountValid
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-gray-700 opacity-60'
                            }`}
              >
                {editingId ? 'Save changes' : 'Save'}
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded bg-gray-700 py-2 hover:bg-gray-600"
                onClick={() => setDrawer(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* delete confirm */}
        {pendingDelete && (
          <ConfirmModal
            title="Delete income"
            message="Are you sure you want to delete this income? This action cannot be undone."
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => {
              deleteIncome.mutate({ id: pendingDelete, month });
              setPendingDelete(null);
            }}
          />
        )}
      </main>
    </RequireAuth>
  );
}
