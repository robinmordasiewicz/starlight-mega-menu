import type { StarlightPlugin } from '@astrojs/starlight/types';
import react from '@astrojs/react';

import type { MegaMenuConfig } from './types';
import { vitePluginMegaMenuConfig } from './libs/vite';

export type {
  MegaMenuConfig,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuCategory,
  MegaMenuLink,
  MegaMenuFooter,
} from './types';

export default function starlightMegaMenu(config: MegaMenuConfig): StarlightPlugin {
  return {
    name: 'starlight-mega-menu',
    hooks: {
      'config:setup'({ config: starlightConfig, updateConfig, addIntegration, astroConfig, logger }) {
        // 1. Conditionally add @astrojs/react if not already loaded
        const isReactLoaded = astroConfig.integrations.find(
          ({ name }) => name === '@astrojs/react'
        );
        if (!isReactLoaded) {
          addIntegration(react());
        }

        // 2. Add Vite virtual module via Astro integration
        addIntegration({
          name: 'starlight-mega-menu-integration',
          hooks: {
            'astro:config:setup': ({ updateConfig: updateAstroConfig }) => {
              updateAstroConfig({
                vite: {
                  plugins: [vitePluginMegaMenuConfig(config)],
                },
              });
            },
          },
        });

        // 3. Override Header component + inject CSS
        updateConfig({
          customCss: [
            ...(starlightConfig.customCss ?? []),
            'starlight-mega-menu/components/mega-menu.css',
          ],
          components: {
            ...starlightConfig.components,
            Header: 'starlight-mega-menu/components/Header.astro',
          },
        });

        logger.info('Mega-menu plugin loaded');
      },
    },
  };
}
