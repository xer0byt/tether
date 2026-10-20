import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root, runPackagedSmoke } from './packaged-smoke.mjs';

let taskkillExecutable;

await runPackagedSmoke({
  name: 'Windows',
  executable: path.join(root, 'out', 'Tether-win32-x64', 'Tether.exe'),
  diagnosticsDir: path.join(root, 'out', 'smoke-windows'),
  preflight() {
    assert.equal(process.platform, 'win32', 'This smoke targets the shipped Windows package');
    assert.ok(process.env.SystemRoot && path.isAbsolute(process.env.SystemRoot), 'Windows system directory is available');
    taskkillExecutable = path.join(process.env.SystemRoot, 'System32', 'taskkill.exe');
  },
  env: isolatedHome => ({
    USERPROFILE: isolatedHome,
    LOCALAPPDATA: path.join(isolatedHome, 'AppData', 'Local'),
  }),
  killTree(child) {
    spawnSync(taskkillExecutable, ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
  },
});
