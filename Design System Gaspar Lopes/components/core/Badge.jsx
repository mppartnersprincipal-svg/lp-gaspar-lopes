import React from 'react';
export function Badge({ children, variant = 'outline', style }) {
  const variants = {
    outline: { border: '1px solid var(--border-strong)', color: 'var(--fg-1)', background: 'transparent' },
    navy: { border: '1px solid var(--navy-300)', color: '#fff', background: 'var(--navy-700)' },
    subtle: { border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'transparent' },
  };
  return (
    <span style={{
      display: 'inline-block', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', ...variants[variant], ...style,
    }}>{children}</span>
  );
}
