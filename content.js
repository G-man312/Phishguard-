(() => {
  if (document.getElementById('phishguard-interstitial')) return;

  const overlay = document.createElement('div');
  overlay.id = 'phishguard-interstitial';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.72)',
    zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(640px, 92vw)', padding: '24px', borderRadius: '12px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
    boxShadow: '0 12px 24px rgba(0,0,0,.4)'
  });

  const title = document.createElement('h2');
  title.textContent = 'Warning: This is a known phishing site';
  Object.assign(title.style, { margin: '0 0 8px', fontSize: '20px' });

  const desc = document.createElement('p');
  desc.textContent = 'It is recommended to avoid this page.';
  Object.assign(desc.style, { margin: '0 0 16px' });

  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '10px', flexWrap: 'wrap' });

  function mkBtn(text, bg, fg) {
    const b = document.createElement('button');
    b.textContent = text;
    Object.assign(b.style, {
      padding: '10px 14px', border: '0', borderRadius: '10px', cursor: 'pointer',
      background: bg, color: fg, fontWeight: '600'
    });
    return b;
  }

  const goBack = mkBtn('Go Back (Recommended)', '#ff5252', '#fff');
  goBack.onclick = () => {
    try { history.back(); } catch {}
  };

  const proceed = mkBtn('Proceed Anyway', '#eeeeee', '#111');
  proceed.onclick = () => overlay.remove();

  const close = mkBtn('Close Tab', '#e53935', '#fff');
  close.onclick = () => chrome.runtime?.sendMessage?.({ type: 'pg_close_tab' });

  btnRow.appendChild(goBack);
  btnRow.appendChild(proceed);
  btnRow.appendChild(close);

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(btnRow);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Theming: read saved theme and react to changes from popup
  function applyTheme(theme) {
    if (theme === 'dark') {
      overlay.style.background = 'rgba(0,0,0,0.72)';
      card.style.background = '#1b1b1b';
      card.style.color = '#ffffff';
      desc.style.color = '#ffcccc';
      proceed.style.background = '#eeeeee';
      proceed.style.color = '#111111';
    } else {
      overlay.style.background = 'rgba(0,0,0,0.32)';
      card.style.background = '#ffffff';
      card.style.color = '#111111';
      desc.style.color = '#aa0000';
      proceed.style.background = '#f2f2f2';
      proceed.style.color = '#111111';
    }
  }

  try {
    chrome.storage.local.get(['theme']).then(({ theme = 'light' }) => applyTheme(theme));
  } catch {
    applyTheme('light');
  }

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === 'pg_theme_changed' && msg.theme) {
        applyTheme(msg.theme);
      }
    });
  } catch {}
})();
