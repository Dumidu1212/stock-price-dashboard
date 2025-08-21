import { useState } from 'react';

export default function SearchBar({ onAdd }: { onAdd: (ticker: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="flex gap-2 items-center">
      <input
        aria-label="Add ticker"
        className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Add ticker (e.g., NVDA)"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onAdd(value.trim());
            setValue('');
          }
        }}
      />
      <button
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        onClick={() => {
          if (value.trim()) {
            onAdd(value.trim());
            setValue('');
          }
        }}
      >
        Add
      </button>
    </div>
  );
}
