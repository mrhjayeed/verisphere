import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function MarkdownEditor({ value, onChange, placeholder, rows = 10 }) {
  const [tab, setTab] = useState('write');

  return (
    <div className="md-editor">
      <div className="md-editor-tabs">
        <button
          type="button"
          className={`md-editor-tab ${tab === 'write' ? 'active' : ''}`}
          onClick={() => setTab('write')}
        >
          Write
        </button>
        <button
          type="button"
          className={`md-editor-tab ${tab === 'preview' ? 'active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write your content in Markdown...'}
          rows={rows}
        />
      ) : (
        <div className="md-editor-preview">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-secondary">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
