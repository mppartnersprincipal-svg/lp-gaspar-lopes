import React from 'react';
export function Button({ variant = 'primary', size = 'md', icon, children, style, ...rest }) {
  const sizes = {
    sm: { padding: '10px 18px', fontSize: 12 },
    md: { padding: '14px 28px', fontSize: 13 },
    lg: { padding: '18px 36px', fontSize: 14 },
  };
  const variants = {
    primary: { background: 'var(--cta-bg)', color: 'var(--cta-fg)', border: '1px solid var(--cta-bg)' },
    navy: { background: 'var(--navy-700)', color: 'var(--on-accent)', border: '1px solid var(--navy-300)' },
    outline: { background: 'transparent', color: 'var(--fg-0)', border: '1px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--fg-2)', border: '1px solid transparent' },
  };
  return (
    <button
      style={{
        fontFamily: 'var(--font-display)', textTransform: 'uppercase',
        letterSpacing: 'var(--ls-caps)', fontWeight: 500, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        borderRadius: 'var(--radius-sm)', transition: 'opacity .2s var(--ease)',
        ...sizes[size], ...variants[variant], ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      {...rest}
    >
      {icon}{children}
    </button>
  );
}
