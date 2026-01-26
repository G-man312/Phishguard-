async function load() {
  const data = await chrome.storage.local.get(['whitelist', 'blacklist']);
  document.getElementById('dump').textContent = JSON.stringify({
    whitelist: data.whitelist || [],
    blacklist: data.blacklist || []
  }, null, 2);
}
document.getElementById('addWhite').onclick = async () => {
  const d = document.getElementById('domain').value.trim();
  if (!d) return;
  const data = await chrome.storage.local.get(['whitelist']);
  const list = new Set(data.whitelist || []);
  list.add(d);
  await chrome.storage.local.set({ whitelist: [...list] });
  await load();
};
document.getElementById('addBlack').onclick = async () => {
  const d = document.getElementById('domain').value.trim();
  if (!d) return;
  const data = await chrome.storage.local.get(['blacklist']);
  const list = new Set(data.blacklist || []);
  list.add(d);
  await chrome.storage.local.set({ blacklist: [...list] });
  await load();
};
load();
