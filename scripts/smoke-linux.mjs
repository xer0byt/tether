import assert from 'node:assert/strict';
import path from 'node:path';
import { root, runPackagedSmoke } from './packaged-smoke.mjs';

// Needs an X display and an unlocked Secret Service keyring: Tether encrypts
// each session's launch settings with safeStorage and refuses to create a
// session without OS encryption. The `linux package + verify + smoke` CI job
// shows a disposable setup (xvfb plus gnome-keyring on a private D-Bus). Set
// TETHER_SMOKE_PASSWORD_STORE (e.g. gnome-libsecret) where Chromium cannot
// pick the keyring backend from the desktop environment.
const passwordStore = process.env.TETHER_SMOKE_PASSWORD_STORE;

await runPackagedSmoke({
  name: 'Linux',
  executable: path.join(root, 'out', `Tether-linux-${process.arch}`, 'tether'),
  diagnosticsDir: path.join(root, 'out', 'smoke-linux'),
  preflight() {
    assert.equal(process.platform, 'linux', 'This smoke targets the experimental Linux package');
    assert.ok(process.env.DISPLAY, 'An X display is required: run `xvfb-run -a npm run smoke:linux`');
    assert.ok(!passwordStore || /^[a-z0-9-]+$/.test(passwordStore), 'TETHER_SMOKE_PASSWORD_STORE must be a Chromium --password-store value');
  },
  env: isolatedHome => ({
    XDG_CONFIG_HOME: path.join(isolatedHome, '.config'),
    XDG_CACHE_HOME: path.join(isolatedHome, '.cache'),
    XDG_STATE_HOME: path.join(isolatedHome, '.local', 'state'),
  }),
  // Stay on the X display above. Without this, Electron follows
  // XDG_SESSION_TYPE=wayland onto a developer's desktop compositor.
  extraArgs: ['--ozone-platform=x11', ...(passwordStore ? [`--password-store=${passwordStore}`] : [])],
  // Own process group, so a failed run can also kill Electron's helpers.
  spawnOptions: { detached: true },
  killTree(child) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already exited */ }
  },
});
