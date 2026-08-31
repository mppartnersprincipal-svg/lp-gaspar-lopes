/* Runtime browser dos componentes (espelho de components/*.jsx) — usado pelos cards e UI kits */
(function () {
  const h = React.createElement;
  function hoverable(base) {
    return {
      onMouseEnter: function (e) { e.currentTarget.style.opacity = '0.85'; },
      onMouseLeave: function (e) { e.currentTarget.style.opacity = '1'; },
    };
  }
  function Button(props) {
    const p = Object.assign({ variant: 'primary', size: 'md' }, props);
    const sizes = { sm: { padding: '10px 18px', fontSize: 12 }, md: { padding: '14px 28px', fontSize: 13 }, lg: { padding: '18px 36px', fontSize: 14 } };
    const variants = {
      primary: { background: 'var(--cta-bg)', color: 'var(--cta-fg)', border: '1px solid var(--cta-bg)' },
      navy: { background: 'var(--navy-700)', color: 'var(--on-accent)', border: '1px solid var(--navy-300)' },
      outline: { background: 'transparent', color: 'var(--fg-0)', border: '1px solid var(--border-strong)' },
      ghost: { background: 'transparent', color: 'var(--fg-2)', border: '1px solid transparent' },
    };
    const style = Object.assign({
      fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)',
      fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, borderRadius: 'var(--radius-sm)', transition: 'opacity .2s var(--ease)',
    }, sizes[p.size], variants[p.variant], p.style);
    return h('button', Object.assign({ style: style, onClick: p.onClick, disabled: p.disabled }, hoverable()), p.icon, p.children);
  }
  function IconButton(props) {
    const p = Object.assign({ size: 44, variant: 'outline' }, props);
    const variants = {
      outline: { background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--fg-0)' },
      navy: { background: 'var(--navy-700)', border: '1px solid var(--navy-300)', color: '#fff' },
      solid: { background: 'var(--cta-bg)', border: '1px solid var(--cta-bg)', color: 'var(--cta-fg)' },
    };
    const style = Object.assign({
      width: p.size, height: p.size, borderRadius: 'var(--radius-full)', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity .2s var(--ease)',
    }, variants[p.variant], p.style);
    return h('button', Object.assign({ style: style, onClick: p.onClick }, hoverable()), p.children);
  }
  function Badge(props) {
    const p = Object.assign({ variant: 'outline' }, props);
    const variants = {
      outline: { border: '1px solid var(--border-strong)', color: 'var(--fg-1)', background: 'transparent' },
      navy: { border: '1px solid var(--navy-300)', color: '#fff', background: 'var(--navy-700)' },
      subtle: { border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'transparent' },
    };
    return h('span', { style: Object.assign({ display: 'inline-block', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }, variants[p.variant], p.style) }, p.children);
  }
  function Divider(props) {
    const p = props || {};
    return h('hr', { style: Object.assign({ border: 'none', borderTop: '1px solid var(--border-subtle)', width: p.width || '100%', margin: 0 }, p.style) });
  }
  const labelStyle = { fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', color: 'var(--text-muted)' };
  function Input(props) {
    const p = props || {};
    const rest = Object.assign({}, p); delete rest.label; delete rest.error; delete rest.style;
    return h('label', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 8 }, p.style) },
      p.label ? h('span', { style: labelStyle }, p.label) : null,
      h('input', Object.assign({
        style: { background: 'transparent', border: 'none', borderBottom: '1px solid ' + (p.error ? 'var(--danger)' : 'var(--border-strong)'), color: 'var(--fg-0)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', padding: '10px 2px', outline: 'none', transition: 'border-color .2s var(--ease)' },
        onFocus: function (e) { e.currentTarget.style.borderBottomColor = 'var(--fg-0)'; },
        onBlur: function (e) { e.currentTarget.style.borderBottomColor = p.error ? 'var(--danger)' : 'var(--border-strong)'; },
      }, rest)),
      p.error ? h('span', { style: { fontSize: 'var(--fs-small)', color: 'var(--danger)' } }, p.error) : null
    );
  }
  function Textarea(props) {
    const p = Object.assign({ rows: 4 }, props);
    const rest = Object.assign({}, p); delete rest.label; delete rest.style;
    return h('label', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 8 }, p.style) },
      p.label ? h('span', { style: labelStyle }, p.label) : null,
      h('textarea', Object.assign({
        style: { background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-0)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', padding: '12px', outline: 'none', resize: 'vertical', transition: 'border-color .2s var(--ease)' },
        onFocus: function (e) { e.currentTarget.style.borderColor = 'var(--fg-0)'; },
        onBlur: function (e) { e.currentTarget.style.borderColor = 'var(--border-strong)'; },
      }, rest))
    );
  }
  function Card(props) {
    const p = Object.assign({ raised: false, padding: 32 }, props);
    return h('div', { style: Object.assign({ background: p.raised ? 'var(--surface-raised)' : 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: p.raised ? 'var(--shadow-card)' : 'none', padding: p.padding }, p.style) }, p.children);
  }
  function HighlightCircle(props) {
    const p = Object.assign({ size: 96, active: false }, props);
    return h('div', { onClick: p.onClick, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: p.onClick ? 'pointer' : 'default', width: p.size + 24 } },
      h('div', { style: { width: p.size, height: p.size, borderRadius: 'var(--radius-full)', background: 'var(--surface-highlight)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 0 3px var(--bg-0), 0 0 0 4px ' + (p.active ? 'var(--fg-1)' : 'var(--border-strong)') + ', var(--shadow-circle)', transition: 'box-shadow .2s var(--ease)' } },
        p.src ? h('img', { src: p.src, alt: p.label || '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) : p.children),
      p.label ? h('span', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--fs-small)', fontWeight: 500, color: 'var(--fg-1)', textAlign: 'center' } }, p.label) : null
    );
  }
  function SectionTitle(props) {
    const p = Object.assign({ align: 'center' }, props);
    return h('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 16, alignItems: p.align === 'center' ? 'center' : 'flex-start', textAlign: p.align }, p.style) },
      p.overline ? h('span', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--fs-overline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)' } }, p.overline) : null,
      h('h2', { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 'var(--ls-heading)', color: 'var(--text-heading)', lineHeight: 'var(--lh-tight)' } },
        p.title, p.accent ? [' ', h('em', { key: 'a', style: { fontFamily: 'var(--font-accent)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontWeight: 500 } }, p.accent)] : null)
    );
  }
  window.GasparLopes = { Button: Button, IconButton: IconButton, Badge: Badge, Divider: Divider, Input: Input, Textarea: Textarea, Card: Card, HighlightCircle: HighlightCircle, SectionTitle: SectionTitle };
})();
