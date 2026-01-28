// Inject a streamlined top-left badge for suspicious pages
(() => {
  if (document.getElementById('phishguard-suspicious-badge')) return;

  const badge = document.createElement('div');
  badge.id = 'phishguard-suspicious-badge';

  // -- STYLE --
  Object.assign(badge.style, {
    position: 'fixed', top: '24px', left: '24px',
    padding: '12px 16px',
    background: '#FFFFFF',
    color: '#0F172A',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '14px', fontWeight: '500',
    zIndex: '2147483647',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderLeft: '4px solid #F59E0B', // Amber border
    display: 'flex', alignItems: 'center', gap: '12px',
    animation: 'pgSlideIn 0.3s ease-out'
  });

  // -- ICON --
  badge.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <span>Suspicious Activity Detected</span>
  `;

  // -- DISMISS BUTTON --
  const close = document.createElement('button');
  close.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  Object.assign(close.style, {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#94A3B8', padding: '4px',
    display: 'flex', alignItems: 'center'
  });

  close.onmouseover = () => close.style.color = '#0F172A';
  close.onmouseout = () => close.style.color = '#94A3B8';

  close.onclick = () => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(-10px)';
    setTimeout(() => badge.remove(), 200);
  };

  // Add keyframe style
  const style = document.createElement('style');
  style.textContent = `@keyframes pgSlideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
  document.head.appendChild(style);

  badge.appendChild(close);
  document.body.appendChild(badge);
})();
