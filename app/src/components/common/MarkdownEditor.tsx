"use client";

import { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function MarkdownEditor({ label, value, onChange, required, placeholder, className = '', minHeight = 200 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'markdown' | 'preview'>('markdown');

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-text-muted">{label}{required && <span className="text-red-500"> *</span>}</span>
        <div className="ml-auto flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTab('markdown')}
            className={`px-2 py-1 rounded-md border ${tab==='markdown' ? 'bg-primary text-background border-primary' : 'border-border text-text-muted hover:text-text'}`}
          >Markdown</button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-2 py-1 rounded-md border ${tab==='preview' ? 'bg-primary text-background border-primary' : 'border-border text-text-muted hover:text-text'}`}
          >Preview</button>
        </div>
      </div>
      {tab === 'markdown' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="form-input w-full rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary p-3 text-sm font-normal leading-normal resize-y"
          style={{ minHeight }}
        />
      ) : (
        <div className="border border-border rounded-xl p-3 bg-background/60">
          {value ? <MarkdownViewer value={value} /> : <p className="text-text-muted text-sm italic">Nothing to preview</p>}
        </div>
      )}
      <p className="text-xs text-text-muted">Markdown supported: headings, bold, italic, code, lists, links.</p>
    </div>
  );
}
