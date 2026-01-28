(() => {
  if (document.getElementById('phishguard-interstitial')) return;

  // -- MAIN OVERLAY --
  const overlay = document.createElement('div');
  overlay.id = 'phishguard-interstitial';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(15, 23, 42, 0.85)', // Darker backdrop
    backdropFilter: 'blur(12px)',         // Glass effect
    zIndex: '2147483647',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  });

  // -- CARD CONTAINER --
  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(500px, 90vw)',
    padding: '40px',
    borderRadius: '24px',
    background: '#1E293B',           // Slate 800
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    color: '#F8FAFC'
  });

  // -- ICON --
  const icon = document.createElement('div');
  icon.innerHTML = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  Object.assign(icon.style, { marginBottom: '24px' });

  // -- TEXT CONTENT --
  const title = document.createElement('h1');
  title.textContent = 'Phishing Detected';
  Object.assign(title.style, {
    margin: '0 0 12px', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.025em'
  });

  const desc = document.createElement('p');
  desc.textContent = 'PhishGuard has identified this site as malicious. Visiting this page may compromise your sensitive information.';
  Object.assign(desc.style, {
    margin: '0 0 32px', fontSize: '16px', lineHeight: '1.6', color: '#94A3B8'
  });

  // -- BUTTONS --
  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, {
    display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'
  });

  function mkBtn(text, primary) {
    const b = document.createElement('button');
    b.textContent = text;
    const bg = primary
      ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
      : 'transparent';
    const border = primary ? 'none' : '1px solid #475569';
    const color = '#FFFFFF';

    Object.assign(b.style, {
      padding: '12px 24px', border: border, borderRadius: '12px', cursor: 'pointer',
      background: bg, color: color, fontWeight: '600', fontSize: '15px',
      transition: 'transform 0.1s, opacity 0.2s',
      fontFamily: 'inherit'
    });

    b.onmouseover = () => b.style.opacity = '0.9';
    b.onmouseout = () => b.style.opacity = '1';
    b.onmousedown = () => b.style.transform = 'scale(0.98)';
    b.onmouseup = () => b.style.transform = 'scale(1)';

    return b;
  }

  const goBack = mkBtn('Go Back to Safety', true);
  goBack.onclick = () => { try { history.back(); } catch { } };

  const close = mkBtn('Close Tab', false);
  close.onclick = () => chrome.runtime?.sendMessage?.({ type: 'pg_close_tab' });

  const proceed = document.createElement('button');
  proceed.textContent = 'I understand the risks, proceed anyway';
  Object.assign(proceed.style, {
    display: 'block', margin: '24px auto 0', background: 'none', border: 'none',
    color: '#64748B', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
  });
  proceed.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  };
  Object.assign(overlay.style, { transition: 'opacity 0.2s ease-out' });

  btnRow.appendChild(goBack);
  btnRow.appendChild(close);

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(btnRow);
  card.appendChild(proceed);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // -- THEMING SUPPORT --
  // This new design is "Dark Mode" by default for impact, 
  // but we can adjust if the user wants light mode using the message listener.
  function applyTheme(theme) {
    if (theme === 'light') {
      overlay.style.background = 'rgba(241, 245, 249, 0.85)';
      card.style.background = '#FFFFFF';
      card.style.borderColor = '#E2E8F0';
      title.style.color = '#0F172A';
      desc.style.color = '#64748B';
      card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
      proceed.style.color = '#94A3B8';
      close.style.borderColor = '#E2E8F0';
      close.style.color = '#0F172A';
    } else {
      // Revert to dark
      overlay.style.background = 'rgba(15, 23, 42, 0.85)';
      card.style.background = '#1E293B';
      card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      title.style.color = '#F8FAFC';
      desc.style.color = '#94A3B8';
      card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
      proceed.style.color = '#64748B';
      close.style.borderColor = '#475569';
      close.style.color = '#FFFFFF';
    }
  }

  try {
    chrome.storage.local.get(['theme']).then(({ theme = 'dark' }) => applyTheme(theme)); // Default to dark for full screen
  } catch { }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'pg_theme_changed') applyTheme(msg.theme);
  });

})();
