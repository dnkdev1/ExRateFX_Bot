function renderMessagesHtml(messages) {
  const rows = messages
    .slice()
    .reverse()
    .map((m) => `<li><b>${m.from}</b>: ${m.text} <small>${m.date}</small></li>`)
    .join('');
  return `<html><body><h1>Messages</h1><ul>${rows}</ul></body></html>`;
}

module.exports = { renderMessagesHtml };
