import React from 'react';
export function Divider({ width = '100%', style }) {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', width, margin: 0, ...style }} />;
}
