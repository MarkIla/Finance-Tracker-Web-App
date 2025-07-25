'use client';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded bg-gray-900 p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-100">{title}</h2>
        <p className="mb-6 text-sm text-gray-200">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded bg-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-600"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              confirmLabel === 'Delete'
                ? 'rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500'
                : 'rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
