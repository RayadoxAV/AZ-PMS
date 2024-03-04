import { ConfigEnv, UserConfig, defineConfig } from 'vite';
import path from 'path';
import { pluginExposeRenderer } from './vite.base.config';

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: path.join(__dirname, 'src', 'help'),
    mode,
    base: './',
    build: {
      outDir: `../../.vite/help_window/${name}`
    },
    plugins: [pluginExposeRenderer(name)],
    resolve: {
      preserveSymlinks: true
    },
    clearScreen: false,
    experimental: {
      renderBuiltUrl(fileName: string) {
        return { relative: true }
      }
    }
  } as UserConfig;
});
