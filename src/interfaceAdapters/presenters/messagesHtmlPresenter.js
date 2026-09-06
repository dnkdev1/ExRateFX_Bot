function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMessageItem(m) {
  return `<li><b>${escapeHtml(m.from)}</b>: ${escapeHtml(m.text)} <small>${escapeHtml(m.date)}</small></li>`;
}

function renderMessagesHtml(messages) {
  const rows = messages.slice().reverse().map(renderMessageItem).join('');
  return `<html><body>
<h1>Messages</h1>
<ul id="messages">${rows}</ul>
<script>
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function refreshMessages() {
    try {
      const res = await fetch('/messages.json');
      const messages = await res.json();
      document.getElementById('messages').innerHTML = messages
        .map((m) => \`<li><b>\${escapeHtml(m.from)}</b>: \${escapeHtml(m.text)} <small>\${escapeHtml(m.date)}</small></li>\`)
        .join('');
    } catch (err) {
      console.error('Failed to refresh messages:', err);
    }
  }

  setInterval(refreshMessages, 3000);
</script>
</body></html>`;
}

module.exports = { renderMessagesHtml };
