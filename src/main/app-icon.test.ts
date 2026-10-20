import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({ isPackaged: false }));
vi.mock('electron', () => ({ app: electronApp }));

import { appIconPath } from './app-icon';

describe('appIconPath', () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const originalResourcesPath = process.resourcesPath;
  const setPlatform = (value: NodeJS.Platform) => {
    Object.defineProperty(process, 'platform', { ...originalPlatform, value });
  };

  afterEach(() => {
    Object.defineProperty(process, 'platform', originalPlatform);
    process.resourcesPath = originalResourcesPath;
    electronApp.isPackaged = false;
  });

  it.each([false, true])('keeps the Windows .ico path (packaged: %s)', (packaged) => {
    setPlatform('win32');
    electronApp.isPackaged = packaged;
    expect(appIconPath()).toBe(path.join(__dirname, '../../assets/icon.ico'));
  });

  it('uses the PNG shipped as an extra resource in packaged Linux builds', () => {
    setPlatform('linux');
    electronApp.isPackaged = true;
    process.resourcesPath = path.join(path.sep, 'opt', 'Tether', 'resources');
    expect(appIconPath()).toBe(path.join(path.sep, 'opt', 'Tether', 'resources', 'icon.png'));
  });

  it('uses the repo PNG in Linux dev runs', () => {
    setPlatform('linux');
    expect(appIconPath()).toBe(path.join(__dirname, '../../assets/icon.png'));
  });
});
