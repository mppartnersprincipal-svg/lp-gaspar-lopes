import React from 'react';
export function Card({ children, raised = false, padding = 32, style }) {
  return (
    <div style={{
      background: raised ? 'var(--surface-raised)' : 'var(--surface-card)',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      boxShadow: raised ? 'var(--shadow-card)' : 'none', padding, ...style,
    }}>{children}</div>
  );
}
