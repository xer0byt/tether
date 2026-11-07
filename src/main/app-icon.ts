import { app } from 'electron';
import path from 'node:path';

/**
 * Icon for BrowserWindows and desktop notifications.
 *
 * Windows keeps its long-standing `.ico` path (the packaged exe also embeds
 * the icon). Linux executables carry no embedded icon and the Vite build only
 * packages `.vite/`, so packaged Linux builds ship `icon.png` as an extra
 * resource (see `forge.config.ts`); dev runs read it from the repo.
 */
export function appIconPath(): string {
  if (process.platform === 'win32') return path.join(__dirname, '../../assets/icon.ico');
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../assets/icon.png');
}
