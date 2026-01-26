// Inject a small top-left badge for suspicious pages
(() => {
  if (document.getElementById('phishguard-suspicious-badge')) return;

  const badge = document.createElement('div');
  badge.id = 'phishguard-suspicious-badge';
  badge.textContent = '⚠️ This site is suspicious';
  Object.assign(badge.style, {
    position: 'fixed', top: '8px', left: '8px',
    padding: '6px 10px', background: '#ffb300', color: '#212121',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
    fontSize: '12px', zIndex: '2147483647',
    borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,.2)'
  });

  const close = document.createElement('button');
  close.textContent = 'Dismiss';
  Object.assign(close.style, {
    marginLeft: '8px', padding: '2px 6px', background: '#fff', color: '#795548',
    border: '0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
  });
  close.onclick = () => badge.remove();

  badge.appendChild(close);
  document.body.appendChild(badge);
})();


