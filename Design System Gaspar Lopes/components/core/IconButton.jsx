import React from 'react';
export function IconButton({ children, size = 44, variant = 'outline', style, ...rest }) {
  const variants = {
    outline: { background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--fg-0)' },
    navy: { background: 'var(--navy-700)', border: '1px solid var(--navy-300)', color: '#fff' },
    solid: { background: 'var(--cta-bg)', border: '1px solid var(--cta-bg)', color: 'var(--cta-fg)' },
  };
  return (
    <button
      style={{
        width: size, height: size, borderRadius: 'var(--radius-full)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'opacity .2s var(--ease)', ...variants[variant], ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
