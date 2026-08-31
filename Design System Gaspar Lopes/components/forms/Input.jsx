import React from 'react';
export function Input({ label, error, style, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {label && <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', color: 'var(--text-muted)' }}>{label}</span>}
      <input
        style={{
          background: 'transparent', border: 'none',
          borderBottom: '1px solid ' + (error ? 'var(--danger)' : 'var(--border-strong)'),
          color: 'var(--fg-0)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)',
          padding: '10px 2px', outline: 'none', transition: 'border-color .2s var(--ease)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--fg-0)'; }}
        onBlur={(e) => { e.currentTarget.style.borderBottomColor = error ? 'var(--danger)' : 'var(--border-strong)'; }}
        {...rest}
      />
      {error && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--danger)' }}>{error}</span>}
    </label>
  );
}
