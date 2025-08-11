"use client";

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
  value: string;
  className?: string;
}

export default function MarkdownViewer({ value, className = '' }: MarkdownViewerProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!value) {
      setHtml('');
      return;
    }
    (async () => {
      try {
        marked.setOptions({
          breaks: true,
          gfm: true
        });
  const parsed = marked.parse(value, { async: false });
  // NOTE: Sanitization dependency removed due to module resolution issues.
  // If untrusted user input will be rendered, reintroduce a sanitizer.
  setHtml(parsed as string);
      } catch (e) {
        setHtml(`<pre class='text-red-500'>Failed to render markdown</pre>`);
      }
    })();
  }, [value]);

  return (
    <div className={`prose prose-invert max-w-none text-sm md:text-base markdown-content ${className}`}
         dangerouslySetInnerHTML={{ __html: html }} />
  );
}
