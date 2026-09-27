// components/CreateUnitModal.jsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function CreateUnitModal({ isOpen, onClose, onSubmit }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <button type="button" aria-label="Close create unit dialog" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="create-unit-title" className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 id="create-unit-title" className="text-lg font-semibold text-slate-950">Create unit</h3>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="unitNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
              Unit number
            </label>
            <input
              required
              type="text"
              id="unitNumber"
              name="unitNumber"
              placeholder="e.g. A-204"
              className="w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label htmlFor="floor" className="mb-1.5 block text-sm font-medium text-slate-700">
              Floor
            </label>
            <input
              required
              type="text"
              id="floor"
              name="floor"
              placeholder="e.g. 2"
              className="w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
