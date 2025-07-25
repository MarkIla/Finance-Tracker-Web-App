'use client';
import { ReactNode } from 'react';

/** A simple, dark-theme table wrapper */
export default function DataTable({
  head,
  rows,
  empty,
}: {
  head: ReactNode;
  rows: ReactNode[];
  empty: string;
}) {
  if (!rows.length) {
    return (
      <p className="text-center text-sm text-gray-400">{empty}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-100">
        <thead className="bg-gray-800 text-gray-300">{head}</thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900">
          {rows}
        </tbody>
      </table>
    </div>
  );
}
