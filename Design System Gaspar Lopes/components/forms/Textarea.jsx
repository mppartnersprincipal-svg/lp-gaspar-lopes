import React from 'react';
export function Textarea({ label, rows = 4, style, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {label && <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', color: 'var(--text-muted)' }}>{label}</span>}
      <textarea
        rows={rows}
        style={{
          background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
          color: 'var(--fg-0)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)',
          padding: '12px', outline: 'none', resize: 'vertical', transition: 'border-color .2s var(--ease)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-0)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
        {...rest}
      />
    </label>
  );
}
