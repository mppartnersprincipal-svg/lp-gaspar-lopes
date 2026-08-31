import React from 'react';
export function HighlightCircle({ label, src, children, size = 96, active = false, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: onClick ? 'pointer' : 'default', width: size + 24 }}>
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-full)',
        background: 'var(--surface-highlight)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        boxShadow: '0 0 0 3px var(--bg-0), 0 0 0 4px ' + (active ? 'var(--fg-1)' : 'var(--border-strong)') + ', var(--shadow-circle)',
        transition: 'box-shadow .2s var(--ease)',
      }}>
        {src ? <img src={src} alt={label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : children}
      </div>
      {label && <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-small)', fontWeight: 500, color: 'var(--fg-1)', textAlign: 'center' }}>{label}</span>}
    </div>
  );
}
