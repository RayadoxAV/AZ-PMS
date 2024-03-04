import { ConfigEnv, UserConfig, defineConfig } from 'vite';
import path from 'path';
import { pluginExposeRenderer } from './vite.base.config';

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: path.join(__dirname, 'src', 'ui', 'main'),
    mode,
    base: './',
    build: {
      outDir: `../../../.vite/ui/main_window/${name}`
    },
    plugins: [pluginExposeRenderer(name)],
    resolve: {
      preserveSymlinks: true
    },
    clearScreen: false,
    experimental: {
      renderBuiltUrl(fileName: string) {
        console.log(fileName);
        return { relative: true};
      }
    }
  } as UserConfig;
});
