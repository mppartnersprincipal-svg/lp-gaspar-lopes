import React from 'react';
export function SectionTitle({ overline, title, accent, align = 'center', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, ...style }}>
      {overline && <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)' }}>{overline}</span>}
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 'var(--ls-heading)', color: 'var(--text-heading)', lineHeight: 'var(--lh-tight)' }}>
        {title}{accent && <> <em style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>{accent}</em></>}
      </h2>
    </div>
  );
}
