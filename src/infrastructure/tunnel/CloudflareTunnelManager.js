const { spawn } = require('child_process');

const CLOUDFLARED_PATH = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';
const RESTART_DELAY_MS = 2000;
// give a freshly announced hostname time to propagate before it's first
// looked up, so Telegram's resolver doesn't negative-cache a not-yet-live name
const INITIAL_REGISTER_DELAY_MS = 8000;

class CloudflareTunnelManager {
  constructor({ port, onUrl }) {
    this.port = port;
    this.onUrl = onUrl;
    this.lastAnnouncedUrl = null;
  }

  start() {
    const tunnel = spawn(CLOUDFLARED_PATH, ['tunnel', '--url', `http://localhost:${this.port}`]);

    tunnel.stdout.on('data', (chunk) => this.handleOutput(chunk));
    tunnel.stderr.on('data', (chunk) => this.handleOutput(chunk));

    tunnel.on('exit', (code) => {
      console.error(`[tunnel] cloudflared exited (code ${code}), restarting in ${RESTART_DELAY_MS}ms...`);
      setTimeout(() => this.start(), RESTART_DELAY_MS);
    });
  }

  handleOutput(chunk) {
    const text = chunk.toString();
    process.stdout.write(text);

    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && match[0] !== this.lastAnnouncedUrl) {
      this.lastAnnouncedUrl = match[0];
      setTimeout(() => this.onUrl(match[0]), INITIAL_REGISTER_DELAY_MS);
    }
  }
}

module.exports = { CloudflareTunnelManager };
